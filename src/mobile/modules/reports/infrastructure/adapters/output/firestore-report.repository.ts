import { doc, getDoc } from 'firebase/firestore';

import { firestore } from '@/shared/firebase/app';
import {
  getAllReports,
  getMyReports,
  publishReportOnline,
  subscribeReports,
} from '@/shared/firebase/reports';
import type { Report as FirestoreReport } from '@/shared/firebase/types';
import { isNetworkError } from '@/shared/offline/sync-engine';

import type { NewReport, Report, ReportId } from '@/modules/reports/domain/entities/report';
import type { ReportMediaPort, SubmissionMedia } from '@/modules/reports/domain/ports/report-media';
import type { ReportOutboxPort } from '@/modules/reports/domain/ports/report-outbox';
import type {
  InsertReportOptions,
  InsertReportResult,
  ReportRepository,
  ReportSubscription,
} from '@/modules/reports/domain/ports/report-repository';
import { newReportToInput, toDomainReport } from './mappers/report.mapper';

export class FirestoreReportRepository implements ReportRepository {
  constructor(
    private readonly media: ReportMediaPort,
    private readonly outbox: ReportOutboxPort,
  ) {}

  async insert(
    newReport: NewReport,
    media?: SubmissionMedia[],
    options?: InsertReportOptions,
  ): Promise<InsertReportResult> {
    const online = options?.online ?? true;
    if (online) {
      try {
        const reportId = await publishReportOnline(newReportToInput(newReport), media ?? []);
        return { reportId, queued: false };
      } catch (error) {
        if (!isNetworkError(error)) throw error;
      }
    }
    return this.queue(newReport, media ?? []);
  }

  async findById(reportId: ReportId): Promise<Report | null> {
    const snapshot = await getDoc(doc(firestore, 'reports', reportId));
    if (!snapshot.exists()) return null;
    return toDomainReport({ id: snapshot.id, ...snapshot.data() } as FirestoreReport);
  }

  async findMyReports(userId: string): Promise<Report[]> {
    const raw = await getMyReports();
    return raw.filter((report) => report.userId === userId).map(toDomainReport);
  }

  async findAll(): Promise<Report[]> {
    const raw = await getAllReports();
    return raw.map(toDomainReport);
  }

  subscribe(callback: ReportSubscription): () => void {
    return subscribeReports((reports) => callback(reports.map(toDomainReport)));
  }

  subscribeMyReports(userId: string, callback: ReportSubscription): () => void {
    return subscribeReports((reports) =>
      callback(reports.filter((report) => report.userId === userId).map(toDomainReport)),
    );
  }

  private async queue(newReport: NewReport, media: SubmissionMedia[]): Promise<InsertReportResult> {
    const staged = await this.media.stageAll(media);
    const pending = await this.outbox.enqueue(newReport, staged);
    return { reportId: pending.id, queued: true };
  }
}
