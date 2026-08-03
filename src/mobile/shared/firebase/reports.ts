import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { firebaseAuth, firestore, storage } from './app';
import type { Report, ReportInput } from './types';

async function uploadEvidence(reportId: string, evidence: NonNullable<ReportInput['evidence']>) {
  return Promise.all(
    evidence.map(async (item, index) => {
      const response = await fetch(item.uri);
      const blob = await response.blob();
      const storagePath = `reports/${reportId}/${index}-${Date.now()}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, blob, { contentType: blob.type || item.type });
      return { storagePath, type: item.type, downloadURL: await getDownloadURL(storageRef) };
    }),
  );
}

export async function createReport(input: ReportInput) {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión para enviar un reporte.');

  const reportReference = doc(collection(firestore, 'reports'));
  await setDoc(reportReference, {
    ...input,
    userId: user.uid,
    status: 'pending',
    evidence: [],
    evidenceCount: 0,
    pointsAwarded: 0,
    createdAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  });

  const evidence = input.evidence ? await uploadEvidence(reportReference.id, input.evidence) : [];
  await updateDoc(reportReference, {
    evidence: evidence.map(({ downloadURL, ...item }) => item),
    evidenceCount: evidence.length,
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(firestore, 'reports', reportReference.id, 'private', 'reporter'), {
    userId: user.uid,
    displayName: input.isAnonymous ? null : user.displayName,
    email: input.isAnonymous ? null : user.email,
  });

  return reportReference.id;
}

export async function getMyReports() {
  const user = firebaseAuth?.currentUser;
  if (!user) return [];

  const snapshot = await getDocs(
    query(collection(firestore, 'reports'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')),
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Report);
}
