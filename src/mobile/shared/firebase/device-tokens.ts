import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { firestore } from './app';
import type { DeviceToken } from './types';

const COLLECTION = 'deviceTokens';

export async function saveDeviceToken(
  token: string,
  userId: string,
  platform?: string,
): Promise<void> {
  const ref = doc(firestore, COLLECTION, token);
  await setDoc(ref, {
    userId,
    platform: platform ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function removeDeviceToken(token: string): Promise<void> {
  await deleteDoc(doc(firestore, COLLECTION, token));
}

export async function getAllDeviceTokens(): Promise<DeviceToken[]> {
  const snapshot = await getDocs(query(collection(firestore, COLLECTION), limit(500)));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DeviceToken));
}

export async function getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
  const snapshot = await getDocs(
    query(collection(firestore, COLLECTION), where('userId', '==', userId), limit(100)),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DeviceToken));
}