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

import { stageMedia, uploadMediaToStorage } from '@/shared/offline/media';
import {
  enqueueReport,
  type PendingMedia,
  type PendingReport,
  updatePendingReport,
} from '@/shared/offline/outbox';

export async function createReport(input: ReportInput): Promise<string> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión para enviar un reporte.');

  const ref = await addDoc(collection(firestore, 'reports'), {
    userId: user.uid,
    category: input.category,
    title: input.title,
    description: input.description ?? null,
    isAnonymous: input.isAnonymous,
    location: input.location ?? null,
    photoURLs: input.photoURLs ?? [],
    status: 'pendiente',
    pointsAwarded: 0,
    createdAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  });

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
  const pending = await enqueueReport(input, staged);
  return pending.id;
}

export async function publishPendingReport(pending: PendingReport): Promise<void> {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión para enviar un reporte.');

  let reportId = pending.remoteId;
  if (!reportId) {
    const ref = await addDoc(collection(firestore, 'reports'), {
      userId: user.uid,
      category: pending.input.category,
      title: pending.input.title,
      description: pending.input.description ?? null,
      isAnonymous: pending.input.isAnonymous,
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
    const categoryPoints = REPORT_CATEGORIES[report.category]?.points ?? 0;
    const userRef = doc(firestore, 'users', report.userId);
    const userSnap = await tx.get(userRef);
    const user = userSnap.data() as { pointsBalance: number; totalPointsEarned: number; verifiedReportsCount: number };

    tx.update(reportRef, {
      status: 'verificado',
      pointsAwarded: categoryPoints,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
    });

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
