import type { ReportDto } from '../../../application/dto/report.dto';
import type { ReportDtoSubscription, ReportQueries } from '../../../application/ports/report-queries.port';
import { ReportQueryService } from '../../../application/services/report-query.service';
import { FirestoreReportRepository } from '../output/firestore-report.repository';
import { OutboxReportRepository } from '../output/outbox-report.repository';
import { ReportMediaAdapter } from '../output/report-media.adapter';

export class ReportQueryAdapter {
  constructor(private readonly queries: ReportQueries) {}

  static create(): ReportQueryAdapter {
    const media = new ReportMediaAdapter();
    const outbox = new OutboxReportRepository();
    const repository = new FirestoreReportRepository(media, outbox);
    return new ReportQueryAdapter(new ReportQueryService(repository));
  }

  getMyReports(userId: string): Promise<ReportDto[]> {
    return this.queries.getMyReports(userId);
  }

  getAllReports(): Promise<ReportDto[]> {
    return this.queries.getAllReports();
  }

  getReportById(reportId: string): Promise<ReportDto | null> {
    return this.queries.getReportById(reportId);
  }

  subscribe(callback: ReportDtoSubscription): () => void {
    return this.queries.subscribe(callback);
  }

  subscribeMyReports(userId: string, callback: ReportDtoSubscription): () => void {
    return this.queries.subscribeMyReports(userId, callback);
  }
}
