import type { ReportDto } from '../dto/report.dto';

export type ReportDtoSubscription = (reports: ReportDto[]) => void;

export interface ReportQueries {
  getMyReports(userId: string): Promise<ReportDto[]>;
  getAllReports(): Promise<ReportDto[]>;
  getReportById(reportId: string): Promise<ReportDto | null>;
  subscribe(callback: ReportDtoSubscription): () => void;
  subscribeMyReports(userId: string, callback: ReportDtoSubscription): () => void;
}
