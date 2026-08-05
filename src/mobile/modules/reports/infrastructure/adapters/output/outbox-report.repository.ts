import { enqueueReport, type PendingMedia } from '@/shared/offline/outbox';

import type { NewReport } from '@/modules/reports/domain/entities/report';
import type { QueuedReport, ReportOutboxPort } from '@/modules/reports/domain/ports/report-outbox';
import { newReportToInput } from './mappers/report.mapper';

export class OutboxReportRepository implements ReportOutboxPort {
  async enqueue(newReport: NewReport, media: PendingMedia[]): Promise<QueuedReport> {
    const pending = await enqueueReport(newReportToInput(newReport), media);
    return { id: pending.id };
  }
}
