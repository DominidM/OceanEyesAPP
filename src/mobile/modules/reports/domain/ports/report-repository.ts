import type { NewReport, Report, ReportId } from '../entities/report';
import type { SubmissionAudio, SubmissionMedia } from './report-media';

export type InsertReportResult = {
  reportId: ReportId;
  queued: boolean;
  mediaWarning?: string | null;
};

export type InsertReportOptions = {
  online?: boolean;
};

export type ReportSubscription = (reports: Report[]) => void;

export interface ReportRepository {
  insert(
    newReport: NewReport,
    media?: SubmissionMedia[],
    options?: InsertReportOptions,
    audio?: SubmissionAudio | null,
  ): Promise<InsertReportResult>;
  findById(reportId: ReportId): Promise<Report | null>;
  findMyReports(userId: string): Promise<Report[]>;
  findAll(): Promise<Report[]>;
  subscribe(callback: ReportSubscription): () => void;
  subscribeMyReports(userId: string, callback: ReportSubscription): () => void;
}
