import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
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
