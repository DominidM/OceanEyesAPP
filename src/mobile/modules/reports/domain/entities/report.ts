import { InvalidReportError } from '../exceptions/report-errors';
import { createGeoLocation, type GeoLocation } from '../valueObjects/geo-location';
import { assertReportCategory, type ReportCategoryId } from '../valueObjects/report-category';
import type { ReportStatus } from '../valueObjects/report-status';

export type ReportId = string;

export type NewReport = {
  category: ReportCategoryId;
  title: string;
  description: string | null;
  isAnonymous: boolean;
  deviceHash: string | null;
  location: GeoLocation | null;
};

export type Report = {
  readonly id: ReportId;
  readonly userId: string;
  readonly category: ReportCategoryId;
  readonly title: string;
  readonly description: string | null;
  readonly isAnonymous: boolean;
  readonly deviceHash: string | null;
  readonly location: GeoLocation | null;
  readonly photoURLs: readonly string[];
  readonly status: ReportStatus;
  readonly pointsAwarded: number;
  readonly txHash: string | null;
  readonly createdAt: Date;
  readonly submittedAt: Date;
  readonly reviewedAt: Date | null;
  readonly reviewedBy: string | null;
  readonly rejectionReason: string | null;
};

export function createNewReport(input: {
  category: ReportCategoryId;
  title: string;
  description?: string | null;
  isAnonymous: boolean;
  deviceHash?: string | null;
  location?: { latitude: number; longitude: number; address?: string } | null;
}): NewReport {
  assertReportCategory(input.category);
  if (!input.title || !input.title.trim()) {
    throw new InvalidReportError('El título es obligatorio.');
  }
  return {
    category: input.category,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    isAnonymous: input.isAnonymous,
    deviceHash: input.deviceHash ?? null,
    location: input.location
      ? createGeoLocation(input.location.latitude, input.location.longitude, input.location.address)
      : null,
  };
}
