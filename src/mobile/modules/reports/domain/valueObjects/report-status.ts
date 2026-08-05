import { InvalidReportError } from '../exceptions/report-errors';

export type ReportStatus = 'pendiente' | 'en_revision' | 'verificado' | 'descartado';

export const REPORT_STATUSES: readonly ReportStatus[] = ['pendiente', 'en_revision', 'verificado', 'descartado'];

export function assertReportStatus(value: string): asserts value is ReportStatus {
  if (!REPORT_STATUSES.includes(value as ReportStatus)) {
    throw new InvalidReportError(`Estado de reporte inválido: ${value}`);
  }
}
