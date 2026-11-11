import { createGeoLocation } from '../geo-location';
import { InvalidReportError } from '../../exceptions/report-errors';

describe('createGeoLocation', () => {
  it('crea una ubicación válida', () => {
    const loc = createGeoLocation(-12.0464, -77.0428, 'Lima');
    expect(loc.latitude).toBe(-12.0464);
    expect(loc.longitude).toBe(-77.0428);
    expect(loc.address).toBe('Lima');
  });

  it('lanza error con latitud inválida', () => {
    expect(() => createGeoLocation(200, 0)).toThrow(InvalidReportError);
  });

  it('lanza error con longitud inválida', () => {
    expect(() => createGeoLocation(0, 400)).toThrow(InvalidReportError);
  });

  it('lanza error con NaN', () => {
    expect(() => createGeoLocation(NaN, 0)).toThrow(InvalidReportError);
  });
});