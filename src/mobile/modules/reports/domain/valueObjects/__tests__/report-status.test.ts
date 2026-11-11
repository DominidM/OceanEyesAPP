import { assertReportStatus, REPORT_STATUSES } from '../report-status';
import { InvalidReportError } from '../../exceptions/report-errors';

describe('report status', () => {
  it('acepta todos los estados válidos', () => {
    for (const s of REPORT_STATUSES) {
      expect(() => assertReportStatus(s)).not.toThrow();
    }
  });

  it('rechaza un estado desconocido', () => {
    expect(() => assertReportStatus('borrado')).toThrow(InvalidReportError);
  });
});