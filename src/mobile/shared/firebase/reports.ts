import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
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
import { REPORT_CATEGORIES, type Report, type ReportInput } from './types';

import { getDeviceHash } from '@/shared/identity/device-id';
import { isNetworkError } from '@/shared/offline/errors';
import { stageMedia, uploadMediaToStorage } from '@/shared/offline/media';
import {
  enqueueReport,
  type PendingMedia,
  type PendingReport,
  updatePendingReport,
} from '@/shared/offline/outbox';
import { awardPointsOnChain } from '@shared/blockchain/ledger';

import type { Signer } from 'ethers';

export class AuthenticationRequiredError extends Error {
  constructor(message = 'Debes iniciar sesión para enviar el reporte.') {
    super(message);
    this.name = 'AuthenticationRequiredError';
  }
}

export async function createReport(input: ReportInput): Promise<string> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión para enviar un reporte.');

  const deviceHash = await getDeviceHash();
  const ref = await addDoc(collection(firestore, 'reports'), {
    userId: user.uid,
    category: input.category,
    title: input.title,
    description: input.description ?? null,
    isAnonymous: input.isAnonymous,
    deviceHash: deviceHash ?? null,
    location: input.location ?? null,
    photoURLs: input.photoURLs ?? [],
    status: 'pendiente',
    pointsAwarded: 0,
    createdAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function publishReportOnline(
  input: ReportInput,
  media?: { uri: string; kind: 'photo' | 'video' }[],
): Promise<{ id: string; mediaAttached: boolean }> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión para enviar un reporte.');

  const deviceHash = await getDeviceHash();
  const ref = await addDoc(collection(firestore, 'reports'), {
    userId: user.uid,
    category: input.category,
    title: input.title,
    description: input.description ?? null,
    isAnonymous: input.isAnonymous,
    deviceHash: deviceHash ?? null,
    location: input.location ?? null,
    photoURLs: [],
    status: 'pendiente',
    pointsAwarded: 0,
    createdAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  });

  let mediaAttached = false;
  const photoURLs: string[] = [];
  for (let index = 0; index < (media ?? []).length; index += 1) {
    const item = media![index];
    try {
      const url = await uploadMediaToStorage({
        localUri: item.uri,
        kind: item.kind,
        reportId: ref.id,
        mediaId: `${ref.id}-${index}`,
      });
      photoURLs.push(url);
      mediaAttached = true;
    } catch (error) {
      if (isNetworkError(error)) throw error;
      console.warn('No se pudo adjuntar el medio al reporte', ref.id, error);
    }
  }
  if (photoURLs.length > 0) {
    await updateDoc(doc(firestore, 'reports', ref.id), { photoURLs });
  }

  return { id: ref.id, mediaAttached };
}

export async function saveReportOfflineFirst(
  input: ReportInput,
  media?: { uri: string; kind: 'photo' | 'video' }[],
): Promise<string> {
  const staged: PendingMedia[] = [];
  for (const item of media ?? []) {
    try {
      staged.push({ localUri: await stageMedia(item.uri, item.kind), kind: item.kind });
    } catch {
      staged.push({ localUri: item.uri, kind: item.kind });
    }
  }
  const deviceHash = await getDeviceHash();
  const inputWithDevice = deviceHash ? { ...input, deviceHash } : input;
  const pending = await enqueueReport(inputWithDevice, staged);
  return pending.id;
}

export async function publishPendingReport(pending: PendingReport): Promise<void> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new AuthenticationRequiredError();

  let reportId = pending.remoteId;
  if (!reportId) {
    const ref = await addDoc(collection(firestore, 'reports'), {
      userId: user.uid,
      category: pending.input.category,
      title: pending.input.title,
      description: pending.input.description ?? null,
      isAnonymous: pending.input.isAnonymous,
      deviceHash: pending.input.deviceHash ?? null,
      location: pending.input.location ?? null,
      photoURLs: [],
      status: 'pendiente',
      pointsAwarded: 0,
      createdAt: serverTimestamp(),
      submittedAt: serverTimestamp(),
    });
    reportId = ref.id;
    await updatePendingReport(pending.id, { remoteId: reportId });
  }

  const photoURLs: string[] = [];
  for (let index = 0; index < pending.media.length; index += 1) {
    const media = pending.media[index];
    try {
      const url = await uploadMediaToStorage({
        localUri: media.localUri,
        kind: media.kind,
        reportId,
        mediaId: `${pending.id}-${index}`,
      });
      photoURLs.push(url);
    } catch (error) {
      if (isNetworkError(error)) throw error;
      console.warn('No se pudo adjuntar el medio del reporte pendiente', reportId, error);
    }
  }
  await updateDoc(doc(firestore, 'reports', reportId), { photoURLs });
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

export function subscribeReports(callback: (reports: Report[]) => void): () => void {
  if (!isFirebaseConfigured()) return () => undefined;

  return onSnapshot(
    query(collection(firestore, 'reports'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Report));
    },
  );
}

export async function verifyReport(
  reportId: string,
  adminUid: string,
  signer?: Signer,
): Promise<void> {
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

  if (signer && reporterWallet) {
    try {
      const txHash = await awardPointsOnChain({
        signer,
        reporter: reporterWallet,
        reportId,
        category,
      });
      await updateDoc(reportRef, { txHash });
      if (pointTxId) {
        await updateDoc(doc(firestore, 'pointTransactions', pointTxId), { txHash });
      }
    } catch (error) {
      console.warn('No se pudieron registrar puntos on-chain para el reporte', reportId, error);
    }
  }
}

export async function updateReportStatus(
  reportId: string,
  status: 'en_revision' | 'verificado' | 'descartado',
  options?: { adminUid?: string; reason?: string; signer?: Signer },
): Promise<void> {
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
}
