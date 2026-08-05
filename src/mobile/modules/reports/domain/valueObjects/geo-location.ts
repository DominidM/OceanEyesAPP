import { InvalidReportError } from '../exceptions/report-errors';

export type GeoLocation = {
  readonly latitude: number;
  readonly longitude: number;
  readonly address?: string;
};

export function createGeoLocation(latitude: number, longitude: number, address?: string): GeoLocation {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new InvalidReportError(`Latitud inválida: ${latitude}`);
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new InvalidReportError(`Longitud inválida: ${longitude}`);
  }
  return { latitude, longitude, ...(address ? { address } : {}) };
}
