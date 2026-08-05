import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'fisher' | 'citizen' | 'admin';
export type ProfileType = 'fisher' | 'citizen';
export type AccountStatus = 'active' | 'suspended';

export type UserProfile = {
  role: UserRole;
  profileType: ProfileType;
  displayName?: string;
  email: string;
  dni?: string;
  phone?: string;
  walletAddress?: string;
  pointsBalance: number;
  totalPointsEarned: number;
  verifiedReportsCount: number;
  status: AccountStatus;
  deviceHash?: string;
  banReason?: string;
  bannedBy?: string;
  bannedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/* ── Reportes (3 categorías del hackathon) ── */

export type ReportCategory = 'pesca_ilegal' | 'basura_marina' | 'variacion_mar';

export const REPORT_CATEGORIES: Record<ReportCategory, { label: string; points: number }> = {
  pesca_ilegal: { label: 'Pesca ilegal', points: 100 },
  basura_marina: { label: 'Basura en el mar u orillas', points: 50 },
  variacion_mar: { label: 'Variación del mar', points: 30 },
};

export type ReportStatus = 'pendiente' | 'en_revision' | 'verificado' | 'descartado';

export type ReportInput = {
  category: ReportCategory;
  title: string;
  description?: string;
  isAnonymous: boolean;
  deviceHash?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photoURLs?: string[];
};

export type Report = {
  id: string;
  userId: string;
  category: ReportCategory;
  title: string;
  description?: string;
  isAnonymous: boolean;
  deviceHash?: string;
  location?: { latitude: number; longitude: number; address?: string };
  photoURLs: string[];
  status: ReportStatus;
  pointsAwarded: number;
  txHash?: string;
  createdAt: Timestamp;
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  rejectionReason?: string;
};

/* ── Recompensas ── */

export type Reward = {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  stock: number | null;
  active: boolean;
  sponsor?: string;
  imageURL?: string;
  createdAt: Timestamp;
};

/* ── Canjes ── */

export type RedemptionStatus = 'pendiente' | 'entregado' | 'cancelado';

export type Redemption = {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: RedemptionStatus;
  claimedAt: Timestamp;
  deliveredAt?: Timestamp;
};

/* ── Transacciones de puntos ── */

export type PointTransactionType = 'report_verified' | 'redemption' | 'bonus';

export type PointTransaction = {
  id: string;
  userId: string;
  type: PointTransactionType;
  amount: number;
  reportId?: string;
  rewardId?: string;
  balanceBefore: number;
  balanceAfter: number;
  txHash?: string;
  createdAt: Timestamp;
};
