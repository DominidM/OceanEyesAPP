import type { ReportDto } from '@/modules/reports/application/dto/report.dto';
import type { ReportCategory, ReportStatus } from '@/shared/firebase/types';

import { REPORT_CATEGORIES } from '@/shared/firebase/types';

export type MapReport = {
  id: string;
  latitude: number;
  longitude: number;
  category: ReportCategory;
  status: ReportDto['status'];
  title: string;
  description?: string;
  createdAt: number;
  address?: string;
  customIcon?: string;
};

export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  pesca_ilegal: '#C0392B',
  basura_marina: '#F59E0B',
  variacion_mar: '#2563EB',
  derrame_hidrocarburos: '#7F1D1D',
  fauna_herida: '#DB2777',
  redes_fantasmas: '#0891B2',
  embarcacion_sospechosa: '#7C3AED',
  marea_roja: '#0F766E',
  otro: '#64748B',
};

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = Object.fromEntries(
  (Object.keys(REPORT_CATEGORIES) as ReportCategory[]).map((category) => [
    category,
    REPORT_CATEGORIES[category].label,
  ]),
) as Record<ReportCategory, string>;

export const STATUS_OPACITY: Record<ReportStatus, number> = {
  pendiente: 0.55,
  en_revision: 0.75,
  verificado: 1,
  descartado: 0.3,
};

export function toMapReport(report: ReportDto): MapReport | null {
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
    description: report.description ?? undefined,
    createdAt: new Date(report.createdAt).getTime(),
    address: report.location?.address,
    customIcon: report.customIcon ?? undefined,
  };
}

export function isMapReport(report: MapReport | null): report is MapReport {
  return report != null;
}
