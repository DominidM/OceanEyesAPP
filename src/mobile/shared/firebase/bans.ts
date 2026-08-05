import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { isFirebaseConfigured } from './config';

import { firestore } from './app';

export type BannedDevice = {
  id: string;
  reason?: string | null;
  bannedBy?: string | null;
  bannedAt?: { toDate?: () => Date };
};

export async function isDeviceBanned(deviceHash: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const snapshot = await getDoc(doc(firestore, 'bannedDevices', deviceHash));
  return snapshot.exists();
}

export async function banDevice(
  deviceHash: string,
  options?: { reason?: string; bannedBy?: string },
): Promise<void> {
  await setDoc(doc(firestore, 'bannedDevices', deviceHash), {
    reason: options?.reason ?? null,
    bannedBy: options?.bannedBy ?? null,
    bannedAt: serverTimestamp(),
  });
}

export async function unbanDevice(deviceHash: string): Promise<void> {
  await deleteDoc(doc(firestore, 'bannedDevices', deviceHash));
}

export async function listBannedDevices(): Promise<BannedDevice[]> {
  if (!isFirebaseConfigured()) return [];
  const snapshot = await getDocs(
    query(collection(firestore, 'bannedDevices'), orderBy('bannedAt', 'desc')),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as BannedDevice);
}
