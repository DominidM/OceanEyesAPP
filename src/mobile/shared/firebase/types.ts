import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'admin';
export type ProfileType = 'fisher' | 'citizen' | 'other';
export type AccountStatus = 'active' | 'suspended';

export type UserProfile = {
  role: UserRole;
  profileType: ProfileType;
  displayName?: string;
  email: string;
  phone?: string;
  pointsBalance: number;
  totalPointsEarned: number;
  verifiedReportsCount: number;
  status: AccountStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type ReportCategory =
  | 'illegal_fishing'
  | 'deforestation'
  | 'pollution'
  | 'protected_species'
  | 'suspicious_activity'
  | 'other';

export type ReportStatus = 'pending' | 'in_review' | 'verified' | 'rejected';
export type ReportVisibility = 'public' | 'restricted' | 'private';

export type ReportInput = {
  category: ReportCategory;
  title: string;
  description?: string;
  isAnonymous: boolean;
  visibility: ReportVisibility;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  evidence?: { uri: string; type: 'image' | 'video' }[];
};

export type Report = ReportInput & {
  id: string;
  userId: string;
  status: ReportStatus;
  evidenceCount: number;
  pointsAwarded: number;
  createdAt: Timestamp;
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  rejectionReason?: string;
};
