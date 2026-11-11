import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
  type Transaction,
} from 'firebase/firestore';

import { isFirebaseConfigured } from './config';

import { firebaseAuth, firestore } from './app';
import { REPORT_CATEGORIES, type GeoBounds, type Report, type ReportInput, type ReportStatus } from './types';

import { getDeviceHash } from '@/shared/identity/device-id';
import { isNetworkError } from '@/shared/offline/errors';
import { uploadReportMedia } from '@/shared/offline/cloudinary';
import { stageMedia, uploadMediaToStorage } from '@/shared/offline/media';
import {
  enqueueReport,
  type PendingMedia,
  type PendingReport,
  updatePendingReport,
} from '@/shared/offline/outbox';

import { awardPointsOnChain } from '@shared/blockchain/ledger';

import { isAddress, type Signer } from 'ethers';

export type ReportAudioUpload = {
  uri: string;
  durationMillis: number;
};

export class AuthenticationRequiredError extends Error {
  constructor(message = 'Debes iniciar sesión para enviar el reporte.') {
    super(message);
    this.name = 'AuthenticationRequiredError';
  }
}

function buildReportDocFields(
  input: ReportInput,
  userId: string,
  deviceHash: string | null,
  mediaExpected?: number,
): Record<string, unknown> {
  return {
    userId,
    category: input.category,
    title: input.title,
    description: input.description ?? null,
    isAnonymous: input.isAnonymous,
    deviceHash: deviceHash ?? null,
    location: input.location ?? null,
    photoURLs: input.photoURLs ?? [],
    audioURL: input.audioURL ?? null,
    audioDurationMillis: input.audioDurationMillis ?? null,
    mediaExpected: mediaExpected ?? (input.photoURLs?.length ?? 0) + (input.audioURL ? 1 : 0),
    status: 'pendiente',
    pointsAwarded: 0,
    customIcon: input.customIcon ?? null,
    createdAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  };
}

/**
 * Crea el reporte y su entrada inicial de historial ('— → pendiente') en un único batch atómico.
 * La entrada usa el id fijo 'initial', el único que las reglas permiten escribir al dueño.
 */
async function createReportWithHistory(
  input: ReportInput,
  userId: string,
  deviceHash: string | null,
  options: { reportId?: string; mediaExpected?: number } = {},
): Promise<DocumentReference> {
  const reportRef = options.reportId
    ? doc(firestore, 'reports', options.reportId)
    : doc(collection(firestore, 'reports'));
  const batch = writeBatch(firestore);
  batch.set(reportRef, buildReportDocFields(input, userId, deviceHash, options.mediaExpected));
  batch.set(doc(firestore, 'reports', reportRef.id, 'statusHistory', 'initial'), {
    fromStatus: null,
    toStatus: 'pendiente',
    changedBy: userId,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  return reportRef;
}

function recordStatusChange(
  tx: Transaction,
  reportId: string,
  change: { fromStatus: ReportStatus; toStatus: ReportStatus; changedBy: string; reason?: string | null },
): void {
  tx.set(doc(collection(firestore, 'reports', reportId, 'statusHistory')), {
    fromStatus: change.fromStatus,
    toStatus: change.toStatus,
    changedBy: change.changedBy,
    reason: change.reason ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function createReport(input: ReportInput): Promise<string> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión para enviar un reporte.');

  const deviceHash = await getDeviceHash();
  const ref = await createReportWithHistory(input, user.uid, deviceHash);

  return ref.id;
}

export type PublishReportResult = {
  id: string;
  mediaAttached: boolean;
  mediaWarning: string | null;
};

export async function publishReportOnline(
  input: ReportInput,
  media?: { uri: string; kind: 'photo' | 'video' }[],
  audio?: ReportAudioUpload | null,
): Promise<PublishReportResult> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión para enviar un reporte.');

  const deviceHash = await getDeviceHash();
  const ref = await createReportWithHistory(input, user.uid, deviceHash, {
    mediaExpected: (media?.length ?? 0) + (audio?.uri ? 1 : 0),
  });

  let mediaAttached = false;
  const mediaFailed: string[] = [];
  const photoURLs: string[] = [];
  for (let index = 0; index < (media ?? []).length; index += 1) {
    const item = media![index];
    try {
      const url =
        item.kind === 'video'
          ? await uploadMediaToStorage({
              localUri: item.uri,
              kind: 'video',
              reportId: ref.id,
              mediaId: `${ref.id}-${index}`,
            })
          : await uploadReportMedia({
              localUri: item.uri,
              kind: 'photo',
              reportId: ref.id,
              mediaId: `${ref.id}-${index}`,
            });
      photoURLs.push(url);
      mediaAttached = true;
    } catch (error) {
      if (isNetworkError(error)) throw error;
      console.warn('No se pudo adjuntar el medio al reporte', ref.id, error);
      mediaFailed.push(`foto ${index + 1}`);
    }
  }

  let audioURL: string | null = null;
  let audioDurationMillis: number | null = null;
  if (audio?.uri) {
    audioDurationMillis = audio.durationMillis;
    try {
      audioURL = await uploadReportMedia({
        localUri: audio.uri,
        kind: 'audio',
        reportId: ref.id,
        mediaId: 'audio',
      });
      mediaAttached = true;
    } catch (error) {
      if (isNetworkError(error)) throw error;
      console.warn('No se pudo adjuntar el audio al reporte', ref.id, error);
      mediaFailed.push('audio');
    }
  }

  if (photoURLs.length > 0 || audioURL) {
    await updateDoc(doc(firestore, 'reports', ref.id), {
      photoURLs,
      audioURL,
      audioDurationMillis,
    });
  }

  let mediaWarning: string | null = null;
  if (mediaFailed.length > 0) {
    const total = (media?.length ?? 0) + (audio?.uri ? 1 : 0);
    mediaWarning =
      mediaFailed.length >= total
        ? 'El reporte se guardó, pero no se pudieron subir las fotos ni el audio.'
        : 'El reporte se guardó, pero algunos archivos (fotos/audio) no se subieron.';
  }

  return { id: ref.id, mediaAttached, mediaWarning };
}

export async function saveReportOfflineFirst(
  input: ReportInput,
  media?: { uri: string; kind: 'photo' | 'video' }[],
  audio?: ReportAudioUpload | null,
): Promise<string> {
  const staged: PendingMedia[] = [];
  for (const item of media ?? []) {
    try {
      staged.push({ localUri: await stageMedia(item.uri, item.kind), kind: item.kind });
    } catch {
      staged.push({ localUri: item.uri, kind: item.kind });
    }
  }
  let stagedAudio: { localUri: string; durationMillis: number } | null = null;
  if (audio?.uri) {
    stagedAudio = { localUri: await stageMedia(audio.uri, 'video'), durationMillis: audio.durationMillis };
  }
  const deviceHash = await getDeviceHash();
  const inputWithDevice = deviceHash ? { ...input, deviceHash } : input;
  const pending = await enqueueReport(inputWithDevice, staged, stagedAudio);
  return pending.id;
}

export type PublishPendingResult = {
  reportId: string;
  /** Archivos que el usuario adjuntó (fotos, videos y audio). */
  expectedMedia: number;
  /** Archivos que no quedaron enlazados en el reporte. */
  missingMedia: number;
  /** status_changed: el admin cambió el estado antes de adjuntarlos; upload_failed: la subida falló. */
  reason: 'status_changed' | 'upload_failed' | null;
};

function isPermissionDenied(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === 'permission-denied';
}

/**
 * Publica un reporte del outbox. El id se fija antes de subir nada y las URLs subidas se guardan
 * en el outbox, de modo que los reintentos no repiten subidas ni crean duplicados.
 *  1. Fotos y audio (Cloudinary) se suben ANTES de crear el documento: el reporte nace con ellos.
 *  2. Se crea el documento (+ statusHistory/initial) con `mediaExpected`.
 *  3. Los videos (Storage exige que el documento exista) se adjuntan después. Si el admin ya cambió
 *     el estado, las reglas impiden adjuntarlos: el reporte queda con evidencia incompleta y el
 *     resultado lo indica para avisar al usuario, en lugar de reintentar hasta quedar 'stuck'.
 */
export async function publishPendingReport(pending: PendingReport): Promise<PublishPendingResult> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new AuthenticationRequiredError();

  let reportId = pending.remoteId ?? pending.plannedId;
  if (!reportId) {
    reportId = doc(collection(firestore, 'reports')).id;
    await updatePendingReport(pending.id, { plannedId: reportId });
  }
  const reportRef = doc(firestore, 'reports', reportId);
  const expectedMedia = pending.media.length + (pending.audio?.localUri ? 1 : 0);

  const uploaded: Record<string, string> = { ...(pending.uploaded ?? {}) };
  const failed = new Set<string>();
  let uploadedAfterCreate = false;
  let created = Boolean(pending.remoteId);

  const upload = async (key: string, run: () => Promise<string>) => {
    if (uploaded[key] || failed.has(key)) return;
    try {
      uploaded[key] = await run();
      if (created) uploadedAfterCreate = true;
      await updatePendingReport(pending.id, { uploaded: { ...uploaded } });
    } catch (error) {
      if (isNetworkError(error)) throw error;
      console.warn('No se pudo adjuntar el medio del reporte pendiente', reportId, key, error);
      failed.add(key);
    }
  };
  const mediaKey = (index: number) => `${pending.id}-${index}`;
  const uploadCloudinary = async () => {
    for (let index = 0; index < pending.media.length; index += 1) {
      const media = pending.media[index];
      if (media.kind === 'video') continue;
      await upload(mediaKey(index), () =>
        uploadReportMedia({ localUri: media.localUri, kind: 'photo', reportId: reportId!, mediaId: mediaKey(index) }),
      );
    }
    const audio = pending.audio;
    if (audio?.localUri) {
      await upload('audio', () =>
        uploadReportMedia({ localUri: audio.localUri, kind: 'audio', reportId: reportId!, mediaId: 'audio' }),
      );
    }
  };
  const mediaFields = () => {
    const photoURLs = pending.media.map((_, index) => uploaded[mediaKey(index)]).filter(Boolean);
    const audioURL = uploaded.audio ?? null;
    return {
      photoURLs,
      audioURL,
      audioDurationMillis: audioURL ? (pending.audio?.durationMillis ?? null) : null,
    };
  };

  if (!created) {
    await uploadCloudinary();
    try {
      await createReportWithHistory(
        { ...pending.input, ...mediaFields() },
        user.uid,
        pending.input.deviceHash ?? null,
        { reportId, mediaExpected: expectedMedia },
      );
    } catch (error) {
      // Un intento anterior pudo crear el documento sin llegar a guardar remoteId (p. ej. timeout).
      const snap = isPermissionDenied(error) ? await getDoc(reportRef).catch(() => null) : null;
      if (!snap?.exists() || snap.data().userId !== user.uid) throw error;
      uploadedAfterCreate = true;
    }
    created = true;
    await updatePendingReport(pending.id, { remoteId: reportId });
  }

  // Reportes encolados por versiones anteriores (con remoteId y sin URLs guardadas) o fotos
  // pendientes, y los videos, que Storage solo acepta cuando el documento existe.
  await uploadCloudinary();
  for (let index = 0; index < pending.media.length; index += 1) {
    const media = pending.media[index];
    if (media.kind !== 'video') continue;
    await upload(mediaKey(index), () =>
      uploadMediaToStorage({ localUri: media.localUri, kind: 'video', reportId: reportId!, mediaId: mediaKey(index) }),
    );
  }

  const fields = mediaFields();
  const attached = fields.photoURLs.length + (fields.audioURL ? 1 : 0);
  if (uploadedAfterCreate) {
    try {
      await updateDoc(reportRef, fields);
    } catch (error) {
      if (!isPermissionDenied(error)) throw error;
      const snap = await getDoc(reportRef);
      if (!snap.exists() || snap.data().status === 'pendiente') throw error;
      const inDoc = snap.data() as Report;
      const linked = (inDoc.photoURLs?.length ?? 0) + (inDoc.audioURL ? 1 : 0);
      return { reportId, expectedMedia, missingMedia: Math.max(expectedMedia - linked, 0), reason: 'status_changed' };
    }
  }

  const missingMedia = Math.max(expectedMedia - attached, 0);
  return { reportId, expectedMedia, missingMedia, reason: missingMedia > 0 ? 'upload_failed' : null };
}

function reportTimeValue(value: unknown): number {
  const date = (value as { toDate?: () => Date } | null)?.toDate?.();
  return date instanceof Date ? date.getTime() : 0;
}

export async function getMyReports(): Promise<Report[]> {
  const user = firebaseAuth?.currentUser;
  if (!user) return [];

  const snapshot = await getDocs(
    query(collection(firestore, 'reports'), where('userId', '==', user.uid)),
  );
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Report)
    .sort((a, b) => reportTimeValue(b.createdAt) - reportTimeValue(a.createdAt));
}

export function subscribeMyReports(callback: (reports: Report[]) => void): () => void {
  const user = firebaseAuth?.currentUser;
  if (!isFirebaseConfigured() || !user) return () => undefined;

  return onSnapshot(
    query(collection(firestore, 'reports'), where('userId', '==', user.uid)),
    (snapshot) => {
      callback(
        snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Report)
          .sort((a, b) => reportTimeValue(b.createdAt) - reportTimeValue(a.createdAt)),
      );
    },
    (error) => {
      console.warn('No se pudieron cargar tus reportes', error);
    },
  );
}

export async function getAllReports(): Promise<Report[]> {
  const snapshot = await getDocs(
    query(collection(firestore, 'reports'), orderBy('createdAt', 'desc')),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Report);
}

export function subscribeAllReports(
  callback: (reports: Report[]) => void,
  bounds?: GeoBounds,
): () => void {
  if (!isFirebaseConfigured()) return () => undefined;

  const constraints = bounds
    ? [
        where('location.latitude', '>=', bounds.south),
        where('location.latitude', '<=', bounds.north),
        where('location.longitude', '>=', bounds.west),
        where('location.longitude', '<=', bounds.east),
        orderBy('location.latitude'),
        orderBy('location.longitude'),
        limit(200),
      ]
    : [orderBy('createdAt', 'desc'), limit(200)];

  return onSnapshot(
    query(collection(firestore, 'reports'), ...constraints),
    (snapshot) => callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Report)),
    (error) => console.warn('No se pudieron cargar los reportes territoriales', error),
  );
}

export function subscribeReports(callback: (reports: Report[]) => void): () => void {
  if (!isFirebaseConfigured()) return () => undefined;

  return onSnapshot(
    query(
      collection(firestore, 'reports'),
      where('status', '==', 'verificado'),
      orderBy('createdAt', 'desc'),
    ),
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Report));
    },
    (error) => {
      console.warn('No se pudieron cargar los reportes', error);
    },
  );
}

export type OnChainOutcome =
  | { kind: 'awarded'; txHash: string }
  | { kind: 'skipped_no_signer' }
  | { kind: 'skipped_no_wallet' }
  | { kind: 'failed'; error: string };

export type OnChainStatus = Report['onChainStatus'];

export function onChainNoticeForReport(
  status: OnChainStatus,
  options: { installed?: boolean; error?: string } = {},
): string | null {
  switch (status) {
    case 'skipped_no_signer':
      return options.installed
        ? 'Reporte verificado en BD. Sin transacción on-chain: conecta tu wallet en la parte superior.'
        : 'Reporte verificado en BD. Sin transacción on-chain: MetaMask no está instalado.';
    case 'skipped_no_wallet':
      return 'Reporte verificado en BD. Sin transacción on-chain: el reportante no tiene wallet vinculada.';
    case 'failed':
      return `Reporte verificado en BD. La transacción on-chain falló: ${options.error ?? 'Error desconocido'}`;
    default:
      return null;
  }
}

export async function verifyReport(
  reportId: string,
  adminUid: string,
  signer?: Signer,
): Promise<OnChainOutcome> {
  if (!signer) {
    throw new Error('Conecta la wallet administradora antes de verificar el reporte. No se modificó su estado.');
  }
  const reportRef = doc(firestore, 'reports', reportId);
  let pointTxId: string | undefined;
  let reporterWallet: string | undefined;
  let category = '';

  await runTransaction(firestore, async (tx) => {
    const snap = await tx.get(reportRef);
    if (!snap.exists()) throw new Error('Reporte no encontrado.');

    const report = snap.data() as Report;
    if (report.status === 'verificado') {
      throw new Error('El reporte ya fue verificado.');
    }
    category = report.category;
    const categoryPoints = REPORT_CATEGORIES[report.category]?.points ?? 0;
    const userRef = doc(firestore, 'users', report.userId);
    const userSnap = await tx.get(userRef);

    if (!userSnap.exists()) throw new Error('El reportante no tiene un perfil válido. No se modificó el reporte.');

    const user = userSnap.data() as {
      pointsBalance: number;
      totalPointsEarned: number;
      verifiedReportsCount: number;
      walletAddress?: string;
    };
    reporterWallet = user.walletAddress;
    if (!reporterWallet || !isAddress(reporterWallet)) {
      throw new Error('El reportante no tiene una wallet válida. No se modificó el reporte.');
    }
    const newBalance = (user.pointsBalance ?? 0) + categoryPoints;

    tx.update(reportRef, {
      status: 'verificado',
      pointsAwarded: categoryPoints,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
    });
    recordStatusChange(tx, reportId, { fromStatus: report.status, toStatus: 'verificado', changedBy: adminUid });

    tx.update(userRef, {
      pointsBalance: increment(categoryPoints),
      totalPointsEarned: increment(categoryPoints),
      verifiedReportsCount: increment(1),
    });

    const txRef = doc(collection(firestore, 'pointTransactions'));
    pointTxId = txRef.id;
    tx.set(txRef, {
      userId: report.userId,
      type: 'report_verified',
      amount: categoryPoints,
      reportId,
      balanceBefore: user.pointsBalance ?? 0,
      balanceAfter: newBalance,
      createdAt: serverTimestamp(),
    });
  });

  try {
    const txHash = await awardPointsOnChain({
      signer,
      reporter: reporterWallet!,
      reportId,
      category,
    });
    await updateDoc(reportRef, { txHash, onChainStatus: 'awarded' });
    if (pointTxId) {
      await updateDoc(doc(firestore, 'pointTransactions', pointTxId), { txHash });
    }
    return { kind: 'awarded', txHash };
  } catch (error) {
    console.warn('No se pudieron registrar puntos on-chain para el reporte', reportId, error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    await updateDoc(reportRef, { onChainStatus: 'failed', onChainError: message });
    return { kind: 'failed', error: message };
  }
}

export async function updateReportStatus(
  reportId: string,
  status: 'en_revision' | 'verificado' | 'descartado',
  options?: { adminUid?: string; reason?: string; signer?: Signer },
): Promise<OnChainOutcome | null> {
  const reportRef = doc(firestore, 'reports', reportId);

  if (status === 'verificado') {
    return verifyReport(reportId, options?.adminUid ?? 'admin', options?.signer);
  }

  const adminUid = options?.adminUid ?? 'admin';
  await runTransaction(firestore, async (tx) => {
    const snap = await tx.get(reportRef);
    if (!snap.exists()) throw new Error('Reporte no encontrado.');
    const current = (snap.data() as Report).status;
    if (current === status) return;
    tx.update(reportRef, {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
      rejectionReason: status === 'descartado' ? options?.reason ?? null : null,
      updatedAt: serverTimestamp(),
    });
    recordStatusChange(tx, reportId, {
      fromStatus: current,
      toStatus: status,
      changedBy: adminUid,
      reason: status === 'descartado' ? options?.reason ?? null : null,
    });
  });

  return null;
}
