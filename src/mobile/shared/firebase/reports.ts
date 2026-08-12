import {
  addDoc,
  collection,
  doc,
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
} from 'firebase/firestore';

import { isFirebaseConfigured } from './config';

import { firebaseAuth, firestore } from './app';
import { REPORT_CATEGORIES, type GeoBounds, type Report, type ReportInput } from './types';

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

import type { Signer } from 'ethers';

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
    status: 'pendiente',
    pointsAwarded: 0,
    customIcon: input.customIcon ?? null,
    createdAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  };
}

export async function createReport(input: ReportInput): Promise<string> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión para enviar un reporte.');

  const deviceHash = await getDeviceHash();
  const ref = await addDoc(collection(firestore, 'reports'), buildReportDocFields(input, user.uid, deviceHash));

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
  const ref = await addDoc(collection(firestore, 'reports'), buildReportDocFields(input, user.uid, deviceHash));

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

export async function publishPendingReport(pending: PendingReport): Promise<void> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new AuthenticationRequiredError();

  let reportId = pending.remoteId;
  if (!reportId) {
    const ref = await addDoc(collection(firestore, 'reports'), buildReportDocFields(pending.input, user.uid, pending.input.deviceHash ?? null));
    reportId = ref.id;
    await updatePendingReport(pending.id, { remoteId: reportId });
  }

  const photoURLs: string[] = [];
  for (let index = 0; index < pending.media.length; index += 1) {
    const media = pending.media[index];
    try {
      const url =
        media.kind === 'video'
          ? await uploadMediaToStorage({
              localUri: media.localUri,
              kind: 'video',
              reportId,
              mediaId: `${pending.id}-${index}`,
            })
          : await uploadReportMedia({
              localUri: media.localUri,
              kind: 'photo',
              reportId,
              mediaId: `${pending.id}-${index}`,
            });
      photoURLs.push(url);
    } catch (error) {
      if (isNetworkError(error)) throw error;
      console.warn('No se pudo adjuntar el medio del reporte pendiente', reportId, error);
    }
  }

  let audioURL: string | null = null;
  if (pending.audio?.localUri) {
    try {
      audioURL = await uploadReportMedia({
        localUri: pending.audio.localUri,
        kind: 'audio',
        reportId,
        mediaId: 'audio',
      });
    } catch (error) {
      if (isNetworkError(error)) throw error;
      console.warn('No se pudo adjuntar el audio del reporte pendiente', reportId, error);
    }
  }

  const updates: Record<string, unknown> = { photoURLs };
  if (audioURL) {
    updates.audioURL = audioURL;
    updates.audioDurationMillis = pending.audio?.durationMillis ?? null;
  }
  await updateDoc(doc(firestore, 'reports', reportId), updates);
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

    tx.update(reportRef, {
      status: 'verificado',
      pointsAwarded: categoryPoints,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
    });

    if (!userSnap.exists()) return;

    const user = userSnap.data() as {
      pointsBalance: number;
      totalPointsEarned: number;
      verifiedReportsCount: number;
      walletAddress?: string;
    };
    reporterWallet = user.walletAddress;
    const newBalance = (user.pointsBalance ?? 0) + categoryPoints;

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

  if (!signer) {
    await updateDoc(reportRef, { onChainStatus: 'skipped_no_signer' });
    return { kind: 'skipped_no_signer' };
  }
  if (!reporterWallet) {
    await updateDoc(reportRef, { onChainStatus: 'skipped_no_wallet' });
    return { kind: 'skipped_no_wallet' };
  }

  try {
    const txHash = await awardPointsOnChain({
      signer,
      reporter: reporterWallet,
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

  await updateDoc(reportRef, {
    status,
    reviewedAt: serverTimestamp(),
    reviewedBy: options?.adminUid ?? null,
    rejectionReason: status === 'descartado' ? options?.reason ?? null : null,
  });

  return null;
}
