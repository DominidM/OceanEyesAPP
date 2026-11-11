/* eslint-disable import/first -- jest.mock debe declararse antes de importar los módulos simulados */
/**
 * PU-06 Guardado offline
 * PU-07 Sincronización de 3 pendientes sin duplicar
 *
 * Unidades bajo prueba:
 *  - src/mobile/shared/offline/outbox.ts
 *  - src/mobile/shared/offline/sync-engine.ts
 * Dependencias de red (Firestore/Cloudinary) y de archivos se sustituyen por dobles.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/shared/firebase/reports', () => {
  class AuthenticationRequiredError extends Error {}
  return {
    AuthenticationRequiredError,
    publishPendingReport: jest.fn(),
  };
});
jest.mock('@/shared/offline/media', () => ({
  removeStagedMedia: jest.fn(async () => undefined),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

import { publishPendingReport } from '@/shared/firebase/reports';
import { enqueueReport, getPendingReports } from '@/shared/offline/outbox';
import { initSyncEngine, requestSync } from '@/shared/offline/sync-engine';

const publishMock = publishPendingReport as unknown as jest.Mock<
  (item: { id: string }) => Promise<{ reportId: string; expectedMedia: number; missingMedia: number; reason: null }>
>;
const ok = { reportId: 'r', expectedMedia: 0, missingMedia: 0, reason: null };

const input = {
  category: 'pesca_ilegal' as const,
  title: 'Pesca ilegal',
  isAnonymous: true,
  location: { latitude: -12.05, longitude: -77.15 },
};

beforeEach(async () => {
  await AsyncStorage.clear();
  publishMock.mockReset();
});

describe('PU-06 guardado offline', () => {
  it('encola el reporte en AsyncStorage con estado queued y sin remoteId', async () => {
    const pending = await enqueueReport(input, [{ localUri: 'file:///foto.jpg', kind: 'photo' }]);
    const all = await getPendingReports();

    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({
      id: pending.id,
      state: 'queued',
      attempts: 0,
      input,
    });
    expect(all[0].remoteId).toBeUndefined();
  });

  it('no sincroniza mientras no hay conexión', async () => {
    initSyncEngine({ getOnline: () => false });
    await enqueueReport(input, []);
    await requestSync('test');
    expect(publishMock).not.toHaveBeenCalled();
    expect(await getPendingReports()).toHaveLength(1);
  });
});

describe('PU-07 sincronización de 3 pendientes sin duplicar', () => {
  it('publica cada pendiente exactamente una vez aunque se dispare la sync en paralelo', async () => {
    initSyncEngine({ getOnline: () => true });
    publishMock.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return ok;
    });

    const a = await enqueueReport({ ...input, title: 'A' }, []);
    const b = await enqueueReport({ ...input, title: 'B' }, []);
    const c = await enqueueReport({ ...input, title: 'C' }, []);

    await Promise.all([requestSync('online'), requestSync('foreground'), requestSync('manual')]);

    const publishedIds = publishMock.mock.calls.map(([item]) => item.id).sort();
    expect(publishedIds).toEqual([a.id, b.id, c.id].sort());
    expect(publishMock).toHaveBeenCalledTimes(3);
    expect(await getPendingReports()).toHaveLength(0);
  });
});
