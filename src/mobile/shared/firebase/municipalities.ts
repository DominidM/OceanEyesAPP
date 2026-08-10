import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';

import { firestore } from './app';
import type { Municipality } from './types';

const COLLECTION = 'municipalities';

export async function createMunicipalityApplication(input: {
  name: string;
  province: string;
  region: string;
  address?: string;
  contactName?: string;
  contactEmail?: string;
  phone?: string;
  ownerUid: string;
}): Promise<string> {
  const ref = await addDoc(collection(firestore, COLLECTION), {
    ...input,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getMunicipalityByOwner(ownerUid: string): Promise<Municipality | null> {
  const snapshot = await getDocs(
    query(collection(firestore, COLLECTION), where('ownerUid', '==', ownerUid), limit(1)),
  );
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Municipality;
}

export function subscribeMunicipalityByOwner(
  ownerUid: string,
  callback: (municipality: Municipality | null) => void,
): Unsubscribe {
  const q = query(collection(firestore, COLLECTION), where('ownerUid', '==', ownerUid), limit(1));
  return onSnapshot(q, (snapshot) => {
    const docSnap = snapshot.docs[0];
    callback(docSnap ? ({ id: docSnap.id, ...docSnap.data() } as Municipality) : null);
  });
}

export function subscribeAllMunicipalities(
  callback: (municipalities: Municipality[]) => void,
): Unsubscribe {
  const q = query(collection(firestore, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Municipality)));
  });
}

export async function approveMunicipality(municipalityId: string, adminUid: string): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, municipalityId), {
    status: 'active',
    approvedBy: adminUid,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function rejectMunicipality(
  municipalityId: string,
  adminUid: string,
  reason: string,
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, municipalityId), {
    status: 'rejected',
    approvedBy: adminUid,
    rejectedReason: reason,
    updatedAt: serverTimestamp(),
  });
}

export async function reactivateMunicipality(municipalityId: string, adminUid: string): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, municipalityId), {
    status: 'active',
    approvedBy: adminUid,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getMunicipality(uid: string): Promise<Municipality | null> {
  const snapshot = await getDoc(doc(firestore, COLLECTION, uid));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Municipality) : null;
}

export async function updateMunicipality(
  municipalityId: string,
  changes: Partial<Pick<Municipality, 'address' | 'phone' | 'contactEmail' | 'bounds'>>,
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, municipalityId), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}