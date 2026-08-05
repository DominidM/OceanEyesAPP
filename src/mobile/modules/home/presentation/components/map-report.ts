import type { Report as FirestoreReport, ReportCategory, ReportStatus } from '@/shared/firebase/types';

export type MapReport = {
  id: string;
  latitude: number;
  longitude: number;
  category: ReportCategory;
  status: ReportStatus;
  title: string;
  description?: string;
  createdAt: number;
  address?: string;
};

export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  pesca_ilegal: '#C0392B',
  basura_marina: '#F59E0B',
  variacion_mar: '#2563EB',
};

export const STATUS_OPACITY: Record<ReportStatus, number> = {
  pendiente: 0.55,
  en_revision: 0.75,
  verificado: 1,
  descartado: 0.3,
};

export function toMapReport(report: FirestoreReport): MapReport | null {
  const latitude = report.location?.latitude;
  const longitude = report.location?.longitude;
  if (latitude == null || longitude == null) return null;
  return {
    id: report.id,
    latitude,
    longitude,
    category: report.category,
    status: report.status,
    title: report.title,
    description: report.description,
    createdAt: report.createdAt?.toMillis?.() ?? Date.now(),
    address: report.location?.address,
  };
}

export function isMapReport(report: MapReport | null): report is MapReport {
  return report != null;
}
