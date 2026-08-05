import { InvalidReportError } from '../exceptions/report-errors';

export type ReportCategoryId = 'pesca_ilegal' | 'basura_marina' | 'variacion_mar';

export const REPORT_CATEGORIES: Record<ReportCategoryId, { label: string; points: number }> = {
  pesca_ilegal: { label: 'Pesca ilegal', points: 100 },
  basura_marina: { label: 'Basura en el mar u orillas', points: 50 },
  variacion_mar: { label: 'Variación del mar', points: 30 },
};

export function assertReportCategory(value: string): asserts value is ReportCategoryId {
  if (!REPORT_CATEGORIES[value as ReportCategoryId]) {
    throw new InvalidReportError(`Categoría de reporte inválida: ${value}`);
  }
}

export function reportCategoryLabel(id: ReportCategoryId): string {
  return REPORT_CATEGORIES[id].label;
}

export function reportCategoryPoints(id: ReportCategoryId): number {
  return REPORT_CATEGORIES[id].points;
}
