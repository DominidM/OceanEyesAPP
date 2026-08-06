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
import { stageMedia, uploadMediaToStorage } from '@/shared/offline/media';
import {
  enqueueReport,
  type PendingMedia,
  type PendingReport,
  updatePendingReport,
} from '@/shared/offline/outbox';

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

export async function publishReportOnline(
  input: ReportInput,
  media?: { uri: string; kind: 'photo' | 'video' }[],
): Promise<string> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión para enviar un reporte.');

  const deviceHash = await getDeviceHash();
  const ref = await addDoc(collection(firestore, 'reports'), buildReportDocFields(input, user.uid, deviceHash));

  const photoURLs: string[] = [];
  for (let index = 0; index < (media ?? []).length; index += 1) {
    const item = media![index];
    const url = await uploadMediaToStorage({
      localUri: item.uri,
      kind: item.kind,
      reportId: ref.id,
      mediaId: `${ref.id}-${index}`,
    });
    photoURLs.push(url);
  }
  if (photoURLs.length > 0) {
    await updateDoc(doc(firestore, 'reports', ref.id), { photoURLs });
  }

  return ref.id;
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
    const ref = await addDoc(collection(firestore, 'reports'), buildReportDocFields(pending.input, user.uid, pending.input.deviceHash ?? null));
    reportId = ref.id;
    await updatePendingReport(pending.id, { remoteId: reportId });
  }

  const photoURLs: string[] = [];
  for (let index = 0; index < pending.media.length; index += 1) {
    const media = pending.media[index];
    const url = await uploadMediaToStorage({
      localUri: media.localUri,
      kind: media.kind,
      reportId,
      mediaId: `${pending.id}-${index}`,
    });
    photoURLs.push(url);
  }
  await updateDoc(doc(firestore, 'reports', reportId), { photoURLs });
}

export async function getMyReports(): Promise<Report[]> {
  const user = firebaseAuth?.currentUser;
  if (!user) return [];

  const snapshot = await getDocs(
    query(collection(firestore, 'reports'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Report);
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

export async function verifyReport(reportId: string, adminUid: string): Promise<void> {
  const reportRef = doc(firestore, 'reports', reportId);

  await runTransaction(firestore, async (tx) => {
    const snap = await tx.get(reportRef);
    if (!snap.exists()) throw new Error('Reporte no encontrado.');

    const report = snap.data() as Report;
    const userRef = doc(firestore, 'users', report.userId);
    const userSnap = await tx.get(userRef);

    tx.update(reportRef, {
      status: 'verificado',
      pointsAwarded: 0,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
    });

    if (!userSnap.exists()) return;

    const categoryPoints = REPORT_CATEGORIES[report.category]?.points ?? 0;
    const user = userSnap.data() as { pointsBalance: number; totalPointsEarned: number; verifiedReportsCount: number };
    const newBalance = (user.pointsBalance ?? 0) + categoryPoints;

    tx.update(userRef, {
      pointsBalance: increment(categoryPoints),
      totalPointsEarned: increment(categoryPoints),
      verifiedReportsCount: increment(1),
    });

    const txRef = doc(collection(firestore, 'pointTransactions'));
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
}

export async function updateReportStatus(
  reportId: string,
  status: 'en_revision' | 'verificado' | 'descartado',
  options?: { adminUid?: string; reason?: string },
): Promise<void> {
  const reportRef = doc(firestore, 'reports', reportId);

  if (status === 'verificado') {
    return verifyReport(reportId, options?.adminUid ?? 'admin');
  }

  await updateDoc(reportRef, {
    status,
    reviewedAt: serverTimestamp(),
    reviewedBy: options?.adminUid ?? null,
    rejectionReason: status === 'descartado' ? options?.reason ?? null : null,
  });
}
