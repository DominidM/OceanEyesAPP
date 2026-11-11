import {
  assertReportCategory,
  reportCategoryLabel,
  reportCategoryPoints,
  REPORT_CATEGORIES,
} from '../report-category';
import { InvalidReportError } from '../../exceptions/report-errors';

describe('report category', () => {
  it('acepta todas las categorías válidas', () => {
    for (const id of Object.keys(REPORT_CATEGORIES)) {
      expect(() => assertReportCategory(id)).not.toThrow();
    }
  });

  it('rechaza una categoría desconocida', () => {
    expect(() => assertReportCategory('basura')).toThrow(InvalidReportError);
  });

  it('devuelve etiqueta y puntos correctos', () => {
    expect(reportCategoryLabel('pesca_ilegal')).toBe('Pesca ilegal');
    expect(reportCategoryPoints('pesca_ilegal')).toBe(100);
    expect(reportCategoryPoints('otro')).toBe(30);
  });
});