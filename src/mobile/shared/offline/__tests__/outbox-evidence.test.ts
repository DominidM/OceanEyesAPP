/* eslint-disable import/first -- jest.mock debe declararse antes de importar los módulos simulados */
/**
 * PU-07b Outbox: la evidencia no se pierde en silencio.
 *  - Fotos y audio se suben antes de crear el documento (el reporte nace con ellos).
 *  - Si el admin cambia el estado antes de adjuntar un video, el reporte queda con evidencia
 *    incompleta, el elemento sale del outbox (no queda 'stuck') y el usuario recibe un aviso.
 *  - Los reintentos no repiten subidas ya hechas.
 *
 * Unidades bajo prueba: src/mobile/shared/firebase/reports.ts (publishPendingReport),
 * src/mobile/shared/offline/sync-engine.ts y src/mobile/modules/reports/domain/valueObjects/report-evidence.ts.
 * Firestore se sustituye por un almacén en memoria que aplica la regla SEC-02 del dueño
 * (solo adjunta medios mientras el reporte está 'pendiente').
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type Ref = { id: string; path: string };
type Doc = Record<string, unknown>;

const mockStore = new Map<string, Doc>();
const mockLog: string[] = [];
const mockState = { autoId: 0, onVideoUpload: null as null | (() => void) };

jest.mock('firebase/firestore', () => {
  const ref = (path: string): Ref => ({ id: path.split('/').pop()!, path });
  const denied = () => Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' });
  return {
    collection: (_db: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
    doc: (base: { path?: string }, ...segments: string[]) =>
      segments.length > 0 ? ref(segments.join('/')) : ref(`${base.path}/auto-${(mockState.autoId += 1)}`),
    writeBatch: () => {
      const writes: [Ref, Doc][] = [];
      return {
        set: (r: Ref, data: Doc) => writes.push([r, data]),
        commit: async () => {
          if (writes.some(([r]) => mockStore.has(r.path))) throw denied();
          writes.forEach(([r, data]) => mockStore.set(r.path, { ...data }));
          mockLog.push(`create:${writes[0][0].path}`);
        },
      };
    },
    updateDoc: async (r: Ref, data: Doc) => {
      const current = mockStore.get(r.path);
      if (!current || current.status !== 'pendiente') throw denied();
      mockStore.set(r.path, { ...current, ...data });
      mockLog.push(`update:${r.path}`);
    },
    getDoc: async (r: Ref) => ({ exists: () => mockStore.has(r.path), data: () => mockStore.get(r.path) }),
    serverTimestamp: () => 'ts',
    getDocs: jest.fn(),
    increment: jest.fn(),
    limit: jest.fn(),
    onSnapshot: jest.fn(),
    orderBy: jest.fn(),
    query: jest.fn(),
    runTransaction: jest.fn(),
    where: jest.fn(),
  };
});
jest.mock('@/shared/firebase/app', () => ({ firestore: {}, firebaseAuth: { currentUser: { uid: 'alice' } } }));
jest.mock('@/shared/identity/device-id', () => ({ getDeviceHash: async () => 'hash' }));
jest.mock('@shared/blockchain/ledger', () => ({ awardPointsOnChain: jest.fn() }));
jest.mock('ethers', () => ({ isAddress: () => true }));
jest.mock('@/shared/offline/cloudinary', () => ({
  uploadReportMedia: jest.fn(async (o: { kind: string; mediaId: string }) => {
    mockLog.push(`cloudinary:${o.mediaId}`);
    return `https://cdn/${o.mediaId}`;
  }),
}));
jest.mock('@/shared/offline/media', () => ({
  stageMedia: jest.fn(),
  removeStagedMedia: jest.fn(async () => undefined),
  uploadMediaToStorage: jest.fn(async (o: { mediaId: string }) => {
    mockState.onVideoUpload?.();
    mockLog.push(`storage:${o.mediaId}`);
    return `https://storage/${o.mediaId}`;
  }),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getEvidenceStatus } from '@/modules/reports/domain/valueObjects/report-evidence';
import { publishPendingReport } from '@/shared/firebase/reports';
import { uploadReportMedia } from '@/shared/offline/cloudinary';
import { enqueueReport, getPendingReports, type PendingReport } from '@/shared/offline/outbox';
import { dismissSyncWarning, getSyncState, initSyncEngine, requestSync } from '@/shared/offline/sync-engine';

const input = {
  category: 'pesca_ilegal' as const,
  title: 'Redes abandonadas',
  isAnonymous: false,
  location: { latitude: -12.05, longitude: -77.15 },
};

async function storedPending(id: string): Promise<PendingReport> {
  return (await getPendingReports()).find((item) => item.id === id)!;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  mockStore.clear();
  mockLog.length = 0;
  mockState.onVideoUpload = null;
  dismissSyncWarning();
  (uploadReportMedia as jest.Mock).mockClear();
});

describe('publishPendingReport', () => {
  it('sube fotos y audio antes de crear el documento, que nace con su evidencia', async () => {
    const pending = await enqueueReport(input, [{ localUri: 'file:///f.jpg', kind: 'photo' }], {
      localUri: 'file:///a.m4a',
      durationMillis: 3000,
    });

    const result = await publishPendingReport(pending);

    expect(mockLog.map((entry) => entry.split(':')[0])).toEqual(['cloudinary', 'cloudinary', 'create']);
    const report = mockStore.get(`reports/${result.reportId}`)!;
    expect(report).toMatchObject({
      status: 'pendiente',
      mediaExpected: 2,
      photoURLs: [`https://cdn/${pending.id}-0`],
      audioURL: 'https://cdn/audio',
      audioDurationMillis: 3000,
    });
    expect(mockStore.get(`reports/${result.reportId}/statusHistory/initial`)).toMatchObject({ toStatus: 'pendiente' });
    expect(result).toEqual({ reportId: result.reportId, expectedMedia: 2, missingMedia: 0, reason: null });
  });

  it('si el admin cambia el estado antes de adjuntar el video, informa la evidencia faltante', async () => {
    const pending = await enqueueReport(input, [
      { localUri: 'file:///f.jpg', kind: 'photo' },
      { localUri: 'file:///v.mp4', kind: 'video' },
    ]);
    mockState.onVideoUpload = () => {
      for (const [path, data] of mockStore) {
        if (/^reports\/[^/]+$/.test(path)) mockStore.set(path, { ...data, status: 'en_revision' });
      }
    };

    const result = await publishPendingReport(pending);

    expect(result).toMatchObject({ expectedMedia: 2, missingMedia: 1, reason: 'status_changed' });
    const report = mockStore.get(`reports/${result.reportId}`)!;
    expect(report.photoURLs).toEqual([`https://cdn/${pending.id}-0`]);
    expect(getEvidenceStatus(report)).toBe('incompleta');
  });

  it('un reintento reutiliza el id y no repite las subidas ya hechas', async () => {
    const pending = await enqueueReport(input, [{ localUri: 'file:///f.jpg', kind: 'photo' }]);
    await AsyncStorage.setItem(
      '@oceaneyes/outbox/v1',
      JSON.stringify([{ ...pending, plannedId: 'r-fijo', uploaded: { [`${pending.id}-0`]: 'https://cdn/previa' } }]),
    );

    const result = await publishPendingReport(await storedPending(pending.id));

    expect(uploadReportMedia).not.toHaveBeenCalled();
    expect(result.reportId).toBe('r-fijo');
    expect(mockStore.get('reports/r-fijo')!.photoURLs).toEqual(['https://cdn/previa']);
  });
});

describe('sync-engine con evidencia faltante', () => {
  it('saca el reporte del outbox y deja un aviso hasta que el usuario lo cierra', async () => {
    initSyncEngine({ getOnline: () => true });
    await enqueueReport(input, [{ localUri: 'file:///v.mp4', kind: 'video' }]);
    mockState.onVideoUpload = () => {
      for (const [path, data] of mockStore) {
        if (/^reports\/[^/]+$/.test(path)) mockStore.set(path, { ...data, status: 'verificado' });
      }
    };

    await requestSync('test');

    expect(await getPendingReports()).toHaveLength(0);
    expect(getSyncState().lastWarning).toBe(
      'Tu reporte "Redes abandonadas" se envió sin evidencia: ya estaba en revisión cuando se intentó adjuntar los archivos.',
    );
    const [report] = [...mockStore.entries()].filter(([path]) => /^reports\/[^/]+$/.test(path)).map(([, data]) => data);
    expect(getEvidenceStatus(report)).toBe('sin_evidencia');

    dismissSyncWarning();
    expect(getSyncState().lastWarning).toBeNull();
  });
});

describe('getEvidenceStatus', () => {
  it.each([
    [{ photoURLs: [], audioURL: null, mediaExpected: 0 }, 'sin_medios'],
    [{ photoURLs: ['a'], audioURL: 'b', mediaExpected: 2 }, 'completa'],
    [{ photoURLs: ['a'], audioURL: null, mediaExpected: 3 }, 'incompleta'],
    [{ photoURLs: [], audioURL: null, mediaExpected: 1 }, 'sin_evidencia'],
    [{ photoURLs: ['a'] }, 'completa'],
  ] as [Parameters<typeof getEvidenceStatus>[0], string][])('%j → %s', (report, expected) => {
    expect(getEvidenceStatus(report)).toBe(expected);
  });
});
