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

export type UserBan = {
  id: string;
  reason?: string | null;
  bannedBy?: string | null;
  startsAt?: { toDate?: () => Date };
  endsAt?: { toDate?: () => Date } | null;
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

export async function banUser(
  userId: string,
  options?: {
    reason?: string;
    bannedBy?: string;
    startsAt?: Date;
    endsAt?: Date | null;
  },
): Promise<void> {
  await setDoc(doc(firestore, 'bans', userId), {
    reason: options?.reason ?? null,
    bannedBy: options?.bannedBy ?? null,
    startsAt: options?.startsAt ?? serverTimestamp(),
    endsAt: options?.endsAt ?? null,
    bannedAt: serverTimestamp(),
  });
}

export async function unbanUser(userId: string): Promise<void> {
  await deleteDoc(doc(firestore, 'bans', userId));
}

export async function isUserBanned(userId: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const snapshot = await getDoc(doc(firestore, 'bans', userId));
  if (!snapshot.exists()) return false;
  const data = snapshot.data();
  const endsAt = data.endsAt?.toDate?.();
  if (endsAt && endsAt.getTime() <= Date.now()) return false;
  return true;
}

export async function listBannedUsers(): Promise<UserBan[]> {
  if (!isFirebaseConfigured()) return [];
  const snapshot = await getDocs(query(collection(firestore, 'bans'), orderBy('bannedAt', 'desc')));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as UserBan)
    .filter((b) => {
      const endsAt = b.endsAt?.toDate?.();
      return !endsAt || endsAt.getTime() > Date.now();
    });
}
