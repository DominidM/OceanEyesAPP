import type { Report } from '../../domain/entities/report';
import { reportCategoryLabel, type ReportCategoryId } from '../../domain/valueObjects/report-category';
import type { ReportStatus } from '../../domain/valueObjects/report-status';

export type ReportDto = {
  id: string;
  category: ReportCategoryId;
  categoryLabel: string;
  title: string;
  description: string | null;
  isAnonymous: boolean;
  location: { latitude: number; longitude: number; address?: string } | null;
  photoURLs: string[];
  audioURL: string | null;
  audioDurationMillis: number | null;
  status: ReportStatus;
  pointsAwarded: number;
  txHash: string | null;
  createdAt: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  customIcon: string | null;
};

export type CreateReportResultDto = {
  reportId: string;
  queued: boolean;
  mediaWarning?: string | null;
};

export function mapReportToDto(report: Report): ReportDto {
  return {
    id: report.id,
    category: report.category,
    categoryLabel: reportCategoryLabel(report.category),
    title: report.title,
    description: report.description,
    isAnonymous: report.isAnonymous,
    location: report.location,
    photoURLs: [...report.photoURLs],
    audioURL: report.audioURL,
    audioDurationMillis: report.audioDurationMillis,
    status: report.status,
    pointsAwarded: report.pointsAwarded,
    txHash: report.txHash,
    createdAt: report.createdAt.toISOString(),
    submittedAt: report.submittedAt.toISOString(),
    reviewedAt: report.reviewedAt ? report.reviewedAt.toISOString() : null,
    reviewedBy: report.reviewedBy,
    customIcon: report.customIcon,
  };
}
