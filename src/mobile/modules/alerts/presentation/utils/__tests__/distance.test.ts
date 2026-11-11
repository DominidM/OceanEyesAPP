import { haversineKm, formatDistance } from '../distance';

describe('distance utils', () => {
  it('haversineKm devuelve ~0 para el mismo punto', () => {
    expect(haversineKm(-12.0464, -77.0428, -12.0464, -77.0428)).toBeCloseTo(0, 5);
  });

  it('haversineKm calcula distancia entre Lima y Callao (~10 km)', () => {
    const d = haversineKm(-12.0464, -77.0428, -12.0565, -77.1181);
    expect(d).toBeGreaterThan(5);
    expect(d).toBeLessThan(20);
  });

  it('formatDistance usa metros para <1km', () => {
    expect(formatDistance(0.5)).toBe('500 m');
  });

  it('formatDistance usa km con un decimal para >=1km', () => {
    expect(formatDistance(2.34)).toBe('2.3 km');
  });
});