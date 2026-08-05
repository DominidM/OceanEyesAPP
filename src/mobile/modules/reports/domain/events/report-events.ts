import type { ReportId } from '../entities/report';
import type { ReportCategoryId } from '../valueObjects/report-category';

export type ReportCreatedEvent = {
  type: 'report.created';
  reportId: ReportId;
  userId: string;
  category: ReportCategoryId;
  occurredAt: Date;
};

export type ReportVerifiedEvent = {
  type: 'report.verified';
  reportId: ReportId;
  userId: string;
  points: number;
  txHash?: string;
  occurredAt: Date;
};

export type ReportDomainEvent = ReportCreatedEvent | ReportVerifiedEvent;
