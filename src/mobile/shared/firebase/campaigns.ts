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
  where,
  type Unsubscribe,
} from 'firebase/firestore';

import { firestore } from './app';
import type { Campaign } from './types';

const COLLECTION = 'campaigns';

export async function createCampaign(input: {
  municipalityId: string;
  municipalityName?: string;
  title: string;
  description: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
}): Promise<string> {
  const ref = await addDoc(collection(firestore, COLLECTION), {
    ...input,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCampaign(
  campaignId: string,
  changes: Partial<Pick<Campaign, 'title' | 'description' | 'location' | 'startDate' | 'endDate' | 'active'>>,
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, campaignId), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  await deleteDoc(doc(firestore, COLLECTION, campaignId));
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, COLLECTION),
      where('active', '==', true),
      orderBy('createdAt', 'desc'),
      limit(100),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Campaign));
}

export function subscribeActiveCampaigns(callback: (campaigns: Campaign[]) => void): Unsubscribe {
  const q = query(
    collection(firestore, COLLECTION),
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Campaign)));
    },
    (err) => console.warn('[campaigns] subscribeActiveCampaigns:', err),
  );
}

export function subscribeMunicipalityCampaigns(
  municipalityId: string,
  callback: (campaigns: Campaign[]) => void,
): Unsubscribe {
  const q = query(
    collection(firestore, COLLECTION),
    where('municipalityId', '==', municipalityId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Campaign)));
    },
    (err) => console.warn('[campaigns] subscribeMunicipalityCampaigns:', err),
  );
}