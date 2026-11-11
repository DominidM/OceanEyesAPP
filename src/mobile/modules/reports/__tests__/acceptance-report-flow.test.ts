import { createGeoLocation } from '../domain/valueObjects/geo-location';
import { assertReportCategory, reportCategoryPoints } from '../domain/valueObjects/report-category';
import { assertReportStatus } from '../domain/valueObjects/report-status';

describe('Aceptación: flujo de creación de reporte (6.2.2)', () => {
  it('valida un reporte completo de pesca ilegal en Lima', () => {
    const category = 'pesca_ilegal';
    assertReportCategory(category);

    const status = 'pendiente';
    assertReportStatus(status);

    const location = createGeoLocation(-12.0464, -77.0428, 'Lima');
    expect(location.latitude).toBeGreaterThanOrEqual(-90);
    expect(location.longitude).toBeLessThanOrEqual(180);

    const points = reportCategoryPoints(category as any);
    expect(points).toBe(100);

    // El reporte queda consistente: categoría válida, estado inicial pendiente,
    // ubicación válida y puntos asignados.
    expect(status).toBe('pendiente');
  });

  it('rechaza un reporte con categoría o ubicación inválida', () => {
    expect(() => assertReportCategory('no_existe')).toThrow();
    expect(() => createGeoLocation(999, 0)).toThrow();
  });
});