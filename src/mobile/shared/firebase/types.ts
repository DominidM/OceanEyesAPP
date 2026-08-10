import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'fisher' | 'citizen' | 'admin' | 'municipal';
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
  onChainStatus?: 'awarded' | 'skipped_no_signer' | 'skipped_no_wallet' | 'failed';
  onChainError?: string;
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

/* ── Alertas ── */

export type AlertSeverity = 'info' | 'warning' | 'danger';

export type AlertSource = 'admin' | 'usgs' | 'noaa' | 'user_cluster' | 'municipal';

export type Alert = {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  source: AlertSource;
  coordinates?: { latitude: number; longitude: number };
  radiusKm?: number;
  active: boolean;
  createdAt: Timestamp;
  sentBy: string;
  externalId?: string;
};

export type AlertReportType =
  | 'retroceso_mar'
  | 'oleaje_extremo'
  | 'contaminacion'
  | 'otro';

export type AlertReportStatus = 'pending' | 'verified' | 'rejected';

export type AlertReport = {
  id: string;
  userId: string;
  type: AlertReportType;
  description: string;
  photoURL?: string;
  location: { latitude: number; longitude: number };
  severity: AlertSeverity;
  status: AlertReportStatus;
  createdAt: Timestamp;
  verifiedAt?: Timestamp;
  clusteredWith?: string[];
};

/* ── Municipalidades (Fase 2E) ── */

export type MunicipalityStatus = 'pending' | 'active' | 'rejected';

export type Municipality = {
  id: string;
  name: string;
  province: string;
  region: string;
  address?: string;
  contactName?: string;
  contactEmail?: string;
  phone?: string;
  status: MunicipalityStatus;
  ownerUid: string;
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectedReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/* ── Organizaciones / ONGs (Fase 2E) ── */

export type Organization = {
  id: string;
  name: string;
  category: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  verified: boolean;
  logoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/* ── Campañas municipales (Fase 2E) ── */

export type Campaign = {
  id: string;
  municipalityId: string;
  municipalityName?: string;
  title: string;
  description: string;
  location?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  active: boolean;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
