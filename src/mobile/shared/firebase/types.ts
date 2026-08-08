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
  bannedUntil?: Timestamp | null;
  deviceHash?: string;
  banReason?: string;
  bannedBy?: string;
  bannedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/* ── Reportes ── */

export type ReportCategory =
  | 'pesca_ilegal'
  | 'basura_marina'
  | 'variacion_mar'
  | 'derrame_hidrocarburos'
  | 'fauna_herida'
  | 'redes_fantasmas'
  | 'embarcacion_sospechosa'
  | 'marea_roja'
  | 'otro';

export const REPORT_CATEGORIES: Record<ReportCategory, { label: string; points: number }> = {
  pesca_ilegal: { label: 'Pesca ilegal', points: 100 },
  basura_marina: { label: 'Basura en el mar u orillas', points: 50 },
  variacion_mar: { label: 'Variación del mar', points: 30 },
  derrame_hidrocarburos: { label: 'Derrame de hidrocarburos', points: 100 },
  fauna_herida: { label: 'Fauna marina herida o varada', points: 60 },
  redes_fantasmas: { label: 'Redes o aparejos abandonados', points: 50 },
  embarcacion_sospechosa: { label: 'Embarcación sospechosa', points: 40 },
  marea_roja: { label: 'Marea roja o cambio de color del agua', points: 40 },
  otro: { label: 'Otro incidente', points: 30 },
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
  customIcon?: string;
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
  customIcon?: string;
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

export type RedemptionStatus =
  | 'pendiente'
  | 'confirmado'
  | 'en_preparacion'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

export type Redemption = {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: RedemptionStatus;
  shippingAddress?: string;
  shippingContact?: string;
  cancelReason?: string;
  adminNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;
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
