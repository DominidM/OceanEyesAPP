import { InvalidReportError } from '../exceptions/report-errors';

export type ReportCategoryId =
  | 'pesca_ilegal'
  | 'basura_marina'
  | 'variacion_mar'
  | 'derrame_hidrocarburos'
  | 'fauna_herida'
  | 'redes_fantasmas'
  | 'embarcacion_sospechosa'
  | 'marea_roja'
  | 'otro';

export const REPORT_CATEGORIES: Record<ReportCategoryId, { label: string; points: number }> = {
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
