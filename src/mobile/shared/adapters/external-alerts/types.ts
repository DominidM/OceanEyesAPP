import type { AlertSeverity } from '@/shared/firebase/types';

export interface ExternalAlertDTO {
  externalId: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  source: 'usgs' | 'noaa';
  coordinates?: { latitude: number; longitude: number };
  radiusKm?: number;
  rawTimestamp: Date;
}

export interface ExternalAlertSource {
  sourceName: 'usgs' | 'noaa';
  fetch(): Promise<ExternalAlertDTO[]>;
}
