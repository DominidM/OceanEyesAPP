import {
  addDoc,
  collection,
  deleteDoc,
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
import type {
  Alert,
  AlertReport,
  AlertReportType,
  AlertSeverity,
  AlertSource,
  UserProfile,
} from './types';

const COLLECTION = 'alerts';
const ALERT_REPORTS_COLLECTION = 'alertReports';

const CLUSTER_WINDOW_MIN = 15;
const CLUSTER_RADIUS_KM = 30;
const CLUSTER_MIN_WEIGHT = 3;
const FISHER_WEIGHT = 2;

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

export async function approveAlert(alertId: string): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, alertId), {
    active: true,
    pendingReview: false,
  });
}

export async function rejectAlert(alertId: string): Promise<void> {
  await updateDoc(doc(firestore, COLLECTION, alertId), {
    pendingReview: false,
    active: false,
  });
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
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Alert)));
    },
    (err) => console.warn('[alerts] subscribeActiveAlerts:', err),
  );
}

export function subscribeAllAlerts(callback: (alerts: Alert[]) => void): Unsubscribe {
  const q = query(collection(firestore, COLLECTION), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Alert)));
    },
    (err) => console.warn('[alerts] subscribeAllAlerts:', err),
  );
}

export function subscribeOwnAlerts(uid: string, callback: (alerts: Alert[]) => void): Unsubscribe {
  const q = query(
    collection(firestore, COLLECTION),
    where('sentBy', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Alert)));
    },
    (err) => console.warn('[alerts] subscribeOwnAlerts:', err),
  );
}

/* ── AlertReports (reportes ciudadanos de alerta) ── */

const CLUSTER_TITLES: Record<AlertReportType, string> = {
  retroceso_mar: 'Posible tsunami: retroceso del mar',
  oleaje_extremo: 'Oleaje extremo cerca de la costa',
  contaminacion: 'Mancha de contaminación marina',
  otro: 'Evento marino reportado por vecinos',
};

export async function createAlertReport(input: {
  userId: string;
  type: AlertReportType;
  severity: AlertSeverity;
  description: string;
  location: { latitude: number; longitude: number };
}): Promise<string> {
  const ref = await addDoc(collection(firestore, ALERT_REPORTS_COLLECTION), {
    ...input,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeAlertReports(callback: (reports: AlertReport[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(firestore, ALERT_REPORTS_COLLECTION), orderBy('createdAt', 'desc'), limit(200)),
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AlertReport)));
    },
    (err) => console.warn('[alerts] subscribeAlertReports:', err),
  );
}

export async function getRecentAlertReports(): Promise<AlertReport[]> {
  const snapshot = await getDocs(
    query(collection(firestore, ALERT_REPORTS_COLLECTION), orderBy('createdAt', 'desc'), limit(100)),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AlertReport));
}

/* ── Verificación por clústeres ── */

const SEVERITY_RANK: Record<AlertSeverity, number> = { info: 1, warning: 2, danger: 3 };

function toDate(ts: unknown): Date | null {
  if (ts && typeof ts === 'object' && 'toDate' in ts) {
    try {
      return (ts as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findClusters(reports: AlertReport[]): AlertReport[][] {
  const clusters: AlertReport[][] = [];
  const visited = new Set<string>();

  for (const report of reports) {
    if (visited.has(report.id)) continue;
    const cluster: AlertReport[] = [report];
    visited.add(report.id);
    const queue = [report];

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const other of reports) {
        if (visited.has(other.id)) continue;
        const dist = haversineKm(
          current.location.latitude,
          current.location.longitude,
          other.location.latitude,
          other.location.longitude,
        );
        if (dist <= CLUSTER_RADIUS_KM) {
          visited.add(other.id);
          cluster.push(other);
          queue.push(other);
        }
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

async function loadProfiles(userIds: string[]): Promise<Map<string, UserProfile>> {
  const maps = new Map<string, UserProfile>();
  const results = await Promise.allSettled(userIds.map((uid) => getDoc(doc(firestore, 'users', uid))));
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.exists()) {
      maps.set(result.value.id, result.value.data() as UserProfile);
    }
  });
  return maps;
}

function clusterExternalId(cluster: AlertReport[]): string {
  return `user_cluster_${cluster.map((c) => c.id).sort().join('_')}`;
}

async function isAlertAlreadyCreated(externalId: string): Promise<boolean> {
  const snapshot = await getDocs(
    query(collection(firestore, COLLECTION), where('externalId', '==', externalId), limit(1)),
  );
  return !snapshot.empty;
}

export async function evaluateAlertClusters(): Promise<{ promoted: boolean; reportCount: number }> {
  const reports = await getRecentAlertReports();
  const now = Date.now();
  const fresh = reports.filter((r) => {
    if (r.status !== 'pending') return false;
    const date = toDate(r.createdAt);
    if (!date) return false;
    return now - date.getTime() <= CLUSTER_WINDOW_MIN * 60 * 1000;
  });

  const byType = new Map<AlertReportType, AlertReport[]>();
  for (const report of fresh) {
    const list = byType.get(report.type) ?? [];
    list.push(report);
    byType.set(report.type, list);
  }

  let promoted = false;
  for (const [, group] of byType) {
    const clusters = findClusters(group);
    for (const cluster of clusters) {
      const uniqueUsers = Array.from(new Set(cluster.map((c) => c.userId)));
      const profiles = await loadProfiles(uniqueUsers);
      const weight = uniqueUsers.reduce(
        (acc, uid) => acc + (profiles.get(uid)?.profileType === 'fisher' ? FISHER_WEIGHT : 1),
        0,
      );
      if (weight < CLUSTER_MIN_WEIGHT) continue;

      const externalId = clusterExternalId(cluster);
      if (await isAlertAlreadyCreated(externalId)) continue;

      const severity = cluster.reduce(
        (acc, c) => (SEVERITY_RANK[c.severity] > SEVERITY_RANK[acc] ? c.severity : acc),
        'info' as AlertSeverity,
      );
      const lat = cluster.reduce((acc, c) => acc + c.location.latitude, 0) / cluster.length;
      const lng = cluster.reduce((acc, c) => acc + c.location.longitude, 0) / cluster.length;

      await createAlert({
        title: CLUSTER_TITLES[cluster[0].type] ?? 'Alerta ciudadana confirmada',
        message:
          `${uniqueUsers.length} vecino(s) confirmaron un "${CLUSTER_TITLES[cluster[0].type]}" a ${CLUSTER_RADIUS_KM} km a la redonda en los últimos ${CLUSTER_WINDOW_MIN} min. ` +
          `Severidad: ${severity}. Verificado por la comunidad.`,
        severity,
        source: 'user_cluster',
        coordinates: { latitude: lat, longitude: lng },
        radiusKm: CLUSTER_RADIUS_KM,
        sentBy: 'system',
        externalId,
      });

      await Promise.all(
        cluster.map((c) =>
          updateDoc(doc(firestore, ALERT_REPORTS_COLLECTION, c.id), {
            status: 'verified',
            verifiedAt: serverTimestamp(),
            clusteredWith: cluster.map((x) => x.id),
          }),
        ),
      );
      promoted = true;
    }
  }

  return { promoted, reportCount: fresh.length };
}

export async function submitAlertReport(input: {
  userId: string;
  type: AlertReportType;
  severity: AlertSeverity;
  description: string;
  location: { latitude: number; longitude: number };
}): Promise<{ reportId: string; promoted: boolean }> {
  const reportId = await createAlertReport(input);
  return { reportId, promoted: false };
}

export function alertClusterConstants() {
  return {
    windowMin: CLUSTER_WINDOW_MIN,
    radiusKm: CLUSTER_RADIUS_KM,
    minWeight: CLUSTER_MIN_WEIGHT,
    fisherWeight: FISHER_WEIGHT,
  };
}
