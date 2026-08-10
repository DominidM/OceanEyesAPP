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
import type { Alert, AlertSource, AlertSeverity } from './types';

const COLLECTION = 'alerts';

export async function createAlert(input: {
  title: string;
  message: string;
  severity: AlertSeverity;
  source: AlertSource;
  coordinates?: { latitude: number; longitude: number };
  radiusKm?: number;
  sentBy: string;
  externalId?: string;
}): Promise<string> {
  const ref = await addDoc(collection(firestore, COLLECTION), {
    ...input,
    active: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deactivateAlert(alertId: string): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, alertId), { active: false });
}

export async function deleteAlert(alertId: string): Promise<void> {
  await deleteDoc(doc(firestore, COLLECTION, alertId));
}

export async function getActiveAlerts(): Promise<Alert[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, COLLECTION),
      where('active', '==', true),
      orderBy('createdAt', 'desc'),
      limit(50),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Alert));
}

export async function getAllAlerts(): Promise<Alert[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(100),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Alert));
}

export function subscribeActiveAlerts(callback: (alerts: Alert[]) => void): Unsubscribe {
  const q = query(
    collection(firestore, COLLECTION),
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Alert)));
  });
}
