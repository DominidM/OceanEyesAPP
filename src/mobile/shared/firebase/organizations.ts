import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';

import { firestore } from './app';
import type { Organization } from './types';

const COLLECTION = 'organizations';

export async function createOrganization(input: {
  name: string;
  category: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  verified?: boolean;
  logoURL?: string;
}): Promise<string> {
  const ref = await addDoc(collection(firestore, COLLECTION), {
    ...input,
    verified: input.verified ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateOrganization(
  organizationId: string,
  changes: Partial<Omit<Organization, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, organizationId), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOrganization(organizationId: string): Promise<void> {
  await deleteDoc(doc(firestore, COLLECTION, organizationId));
}

export async function getOrganizations(): Promise<Organization[]> {
  const snapshot = await getDocs(
    query(collection(firestore, COLLECTION), orderBy('name', 'asc'), limit(200)),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Organization));
}

export function subscribeOrganizations(
  callback: (organizations: Organization[]) => void,
): Unsubscribe {
  const q = query(collection(firestore, COLLECTION), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Organization)));
  });
}