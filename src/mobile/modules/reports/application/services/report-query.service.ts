import type { ReportRepository } from '../../domain/ports/report-repository';
import { mapReportToDto, type ReportDto } from '../dto/report.dto';
import type { ReportDtoSubscription, ReportQueries } from '../ports/report-queries.port';

export class ReportQueryService implements ReportQueries {
  constructor(private readonly repository: ReportRepository) {}

  async getMyReports(userId: string): Promise<ReportDto[]> {
    const reports = await this.repository.findMyReports(userId);
    return reports.map(mapReportToDto);
  }

  async getAllReports(): Promise<ReportDto[]> {
    const reports = await this.repository.findAll();
    return reports.map(mapReportToDto);
  }

  async getReportById(reportId: string): Promise<ReportDto | null> {
    const report = await this.repository.findById(reportId);
    return report ? mapReportToDto(report) : null;
  }

  subscribe(callback: ReportDtoSubscription): () => void {
    return this.repository.subscribe((reports) => callback(reports.map(mapReportToDto)));
  }

  subscribeMyReports(userId: string, callback: ReportDtoSubscription): () => void {
    return this.repository.subscribeMyReports(userId, (reports) => callback(reports.map(mapReportToDto)));
  }
}
