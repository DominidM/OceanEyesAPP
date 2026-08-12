import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { firestore } from './app';
import type { PointTransaction, Redemption, RedemptionStatus, Reward } from './types';

/* ── Catálogo de recompensas ── */

export async function getAllRewards(): Promise<Reward[]> {
  const snapshot = await getDocs(
    query(collection(firestore, 'rewards'), where('active', '==', true), orderBy('pointsCost', 'asc')),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Reward);
}

export async function getRewardById(rewardId: string): Promise<Reward | null> {
  const { getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(firestore, 'rewards', rewardId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Reward) : null;
}

export async function createReward(input: Omit<Reward, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(firestore, 'rewards'), {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateReward(rewardId: string, changes: Partial<Pick<Reward, 'title' | 'description' | 'pointsCost' | 'stock' | 'active' | 'sponsor' | 'imageURL'>>): Promise<void> {
  const { deleteField } = await import('firebase/firestore');
  const data: Record<string, any> = { ...changes, updatedAt: serverTimestamp() };
  if ('stock' in changes && changes.stock === null) data.stock = deleteField();
  await updateDoc(doc(firestore, 'rewards', rewardId), data);
}

export async function deleteReward(rewardId: string): Promise<void> {
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(firestore, 'rewards', rewardId));
}

/* ── Canje de recompensas ── */

export async function redeemReward(userId: string, rewardId: string): Promise<string> {
  const rewardRef = doc(firestore, 'rewards', rewardId);
  const userRef = doc(firestore, 'users', userId);

  const redemptionId = await runTransaction(firestore, async (tx) => {
    const rewardSnap = await tx.get(rewardRef);
    const userSnap = await tx.get(userRef);

    if (!rewardSnap.exists() || !userSnap.exists()) {
      throw new Error('Recompensa o usuario no encontrado.');
    }

    const reward = rewardSnap.data() as Reward;
    const user = userSnap.data() as { pointsBalance: number };

    if (!reward.active) throw new Error('Esta recompensa no está disponible.');
    if (reward.stock !== null && reward.stock <= 0) throw new Error('Recompensa agotada.');
    if (user.pointsBalance < reward.pointsCost) throw new Error('Puntos insuficientes.');

    if (reward.stock !== null) {
      tx.update(rewardRef, { stock: increment(-1) });
    }

    tx.update(userRef, { pointsBalance: increment(-reward.pointsCost) });

    const redemptionRef = doc(collection(firestore, 'redemptions'));
    tx.set(redemptionRef, {
      userId,
      rewardId,
      pointsSpent: reward.pointsCost,
      status: 'pendiente',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const txRef = doc(collection(firestore, 'pointTransactions'));
    tx.set(txRef, {
      userId,
      type: 'redemption',
      amount: -reward.pointsCost,
      rewardId,
      balanceBefore: user.pointsBalance,
      balanceAfter: user.pointsBalance - reward.pointsCost,
      createdAt: serverTimestamp(),
    });

    return redemptionRef.id;
  });

  return redemptionId;
}

export async function getUserRedemptions(userId: string): Promise<Redemption[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, 'redemptions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Redemption);
}

export async function getAllRedemptions(): Promise<Redemption[]> {
  const snapshot = await getDocs(
    query(collection(firestore, 'redemptions'), orderBy('createdAt', 'desc')),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Redemption);
}

export async function updateRedemptionStatus(
  redemptionId: string,
  status: RedemptionStatus,
  cancelReason?: string,
): Promise<void> {
  const data: Record<string, any> = { status, updatedAt: serverTimestamp() };

  switch (status) {
    case 'confirmado':
      data.confirmedAt = serverTimestamp();
      break;
    case 'enviado':
      data.shippedAt = serverTimestamp();
      break;
    case 'entregado':
      data.deliveredAt = serverTimestamp();
      break;
    case 'cancelado':
      data.cancelledAt = serverTimestamp();
      if (cancelReason) data.cancelReason = cancelReason;
      break;
  }

  await updateDoc(doc(firestore, 'redemptions', redemptionId), data);
}

/* ── Historial de puntos ── */

export async function getUserPointTransactions(userId: string): Promise<PointTransaction[]> {
  const snapshot = await getDocs(
    query(
      collection(firestore, 'pointTransactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as PointTransaction);
}

export function subscribeReportPointTransactions(
  reportIds: string[],
  callback: (transactions: PointTransaction[]) => void,
): () => void {
  if (reportIds.length === 0) {
    callback([]);
    return () => undefined;
  }

  const byReport = new Map<string, PointTransaction[]>();
  const publish = () => callback(
    [...byReport.values()]
      .flat()
      .filter((tx) => tx.type === 'report_verified')
      .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)),
  );
  const unsubscribes = reportIds.map((reportId) => onSnapshot(
    query(collection(firestore, 'pointTransactions'), where('reportId', '==', reportId)),
    (snapshot) => {
      byReport.set(reportId, snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as PointTransaction));
      publish();
    },
    (error) => console.warn(`No se pudieron cargar las transacciones del reporte ${reportId}`, error),
  ));
  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
}
