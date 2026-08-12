import { enqueueReport, type PendingMedia } from '@/shared/offline/outbox';

import type { NewReport } from '@/modules/reports/domain/entities/report';
import type { QueuedReport, ReportOutboxPort } from '@/modules/reports/domain/ports/report-outbox';
import type { StagedAudio, StagedMedia } from '@/modules/reports/domain/ports/report-media';
import { newReportToInput } from './mappers/report.mapper';

export class OutboxReportRepository implements ReportOutboxPort {
  async enqueue(
    newReport: NewReport,
    media: StagedMedia[],
    audio?: StagedAudio | null,
  ): Promise<QueuedReport> {
    const pendingMedia: PendingMedia[] = media.map((item) => ({
      localUri: item.localUri,
      kind: item.kind === 'audio' ? 'video' : item.kind,
    }));
    const pending = await enqueueReport(
      newReportToInput(newReport),
      pendingMedia,
      audio ? { localUri: audio.localUri, durationMillis: audio.durationMillis } : null,
    );
    return { id: pending.id };
  }
}
