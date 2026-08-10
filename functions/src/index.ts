import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

initializeApp();

const POINTS_BY_CATEGORY: Record<string, number> = {
  illegal_fishing: 20,
  deforestation: 25,
  pollution: 20,
  protected_species: 30,
  suspicious_activity: 15,
  other: 10,
};

export const awardPointsForVerifiedReport = onDocumentUpdated('reports/{reportId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after || before.status === 'verified' || after.status !== 'verified') return;

  const reportId = event.params.reportId;
  const userId = after.userId as string;
  const amount = POINTS_BY_CATEGORY[after.category as string] ?? POINTS_BY_CATEGORY.other;
  const db = getFirestore();
  const transactionRef = db.doc(`pointTransactions/${reportId}-verified`);
  const userRef = db.doc(`users/${userId}`);
  const reportRef = db.doc(`reports/${reportId}`);

  await db.runTransaction(async (transaction) => {
    const [transactionSnapshot, userSnapshot] = await Promise.all([
      transaction.get(transactionRef),
      transaction.get(userRef),
    ]);
    if (transactionSnapshot.exists || !userSnapshot.exists) return;

    const currentBalance = Number(userSnapshot.data()?.pointsBalance ?? 0);
    transaction.set(transactionRef, {
      userId,
      reportId,
      type: 'report_verified',
      amount,
      balanceBefore: currentBalance,
      balanceAfter: currentBalance + amount,
      blockchainStatus: 'not_started',
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.update(userRef, {
      pointsBalance: currentBalance + amount,
      totalPointsEarned: FieldValue.increment(amount),
      verifiedReportsCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(reportRef, {
      pointsAwarded: amount,
      pointsAwardedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
});

/* ── Verificación por clústeres de alertas ciudadanas ── */

const CLUSTER_WINDOW_MIN = 15;
const CLUSTER_RADIUS_KM = 30;
const CLUSTER_MIN_WEIGHT = 3;
const FISHER_WEIGHT = 2;

const CLUSTER_TITLES: Record<string, string> = {
  retroceso_mar: 'Posible tsunami: retroceso del mar',
  oleaje_extremo: 'Oleaje extremo cerca de la costa',
  contaminacion: 'Mancha de contaminación marina',
  otro: 'Evento marino reportado por vecinos',
};

const SEVERITY_RANK: Record<string, number> = { info: 1, warning: 2, danger: 3 };

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

type ClusterReport = {
  id: string;
  userId: string;
  type: string;
  severity: string;
  location: { latitude: number; longitude: number };
};

function findClusters(reports: ClusterReport[]): ClusterReport[][] {
  const clusters: ClusterReport[][] = [];
  const visited = new Set<string>();

  for (const report of reports) {
    if (visited.has(report.id)) continue;
    const cluster: ClusterReport[] = [report];
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

export const promoteAlertCluster = onDocumentCreated(
  'alertReports/{alertReportId}',
  async (event) => {
    const db = getFirestore();
    const reportId = event.params.alertReportId;

    const reportSnap = await db.doc(`alertReports/${reportId}`).get();
    if (!reportSnap.exists) return;
    const report = reportSnap.data();
    if (!report || report.status !== 'pending') return;

    const nowMs = Date.now();
    const windowStart = new Date(nowMs - CLUSTER_WINDOW_MIN * 60 * 1000);

    const recentSnap = await db
      .collection('alertReports')
      .where('status', '==', 'pending')
      .where('type', '==', report.type)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const fresh = recentSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((r: any) => {
        const date = toDate(r.createdAt);
        return date && date.getTime() >= windowStart.getTime();
      }) as ClusterReport[];

    const clusters = findClusters(fresh);
    for (const cluster of clusters) {
      const uniqueUsers = Array.from(new Set(cluster.map((c) => c.userId)));

      const profileSnaps = await Promise.all(
        uniqueUsers.map((uid) => db.doc(`users/${uid}`).get()),
      );
      const weight = uniqueUsers.reduce((acc, uid) => {
        const profile = profileSnaps.find((s) => s.id === uid)?.data();
        return acc + (profile?.profileType === 'fisher' ? FISHER_WEIGHT : 1);
      }, 0);

      if (weight < CLUSTER_MIN_WEIGHT) continue;

      const externalId = `user_cluster_${cluster.map((c) => c.id).sort().join('_')}`;
      const existingSnap = await db
        .collection('alerts')
        .where('externalId', '==', externalId)
        .limit(1)
        .get();
      if (!existingSnap.empty) continue;

      const severity = cluster.reduce(
        (acc: string, c: any) => (SEVERITY_RANK[c.severity] > SEVERITY_RANK[acc] ? c.severity : acc),
        'info',
      );
      const lat = cluster.reduce((acc: number, c: any) => acc + c.location.latitude, 0) / cluster.length;
      const lng = cluster.reduce((acc: number, c: any) => acc + c.location.longitude, 0) / cluster.length;

      await db.collection('alerts').add({
        title: CLUSTER_TITLES[cluster[0].type] ?? 'Alerta ciudadana confirmada',
        message:
          `${uniqueUsers.length} vecino(s) confirmaron un "${CLUSTER_TITLES[cluster[0].type] ?? ''}" a ${CLUSTER_RADIUS_KM} km a la redonda en los últimos ${CLUSTER_WINDOW_MIN} min. ` +
          `Severidad: ${severity}. Verificado por la comunidad.`,
        severity,
        source: 'user_cluster',
        coordinates: { latitude: lat, longitude: lng },
        radiusKm: CLUSTER_RADIUS_KM,
        active: true,
        sentBy: 'system',
        externalId,
        createdAt: FieldValue.serverTimestamp(),
      });

      const clusterIds = cluster.map((c: any) => c.id);
      await Promise.all(
        cluster.map((c: any) =>
          db.doc(`alertReports/${c.id}`).update({
            status: 'verified',
            verifiedAt: FieldValue.serverTimestamp(),
            clusteredWith: clusterIds,
          }),
        ),
      );
    }
  },
);
