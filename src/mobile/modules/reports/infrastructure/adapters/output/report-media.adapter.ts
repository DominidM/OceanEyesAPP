import { stageMedia } from '@/shared/offline/media';

import type { ReportMediaPort, StagedMedia, SubmissionMedia } from '@/modules/reports/domain/ports/report-media';

export class ReportMediaAdapter implements ReportMediaPort {
  async stageAll(media: SubmissionMedia[]): Promise<StagedMedia[]> {
    const staged: StagedMedia[] = [];
    for (const item of media) {
      try {
        staged.push({ localUri: await stageMedia(item.uri, item.kind), kind: item.kind });
      } catch {
        staged.push({ localUri: item.uri, kind: item.kind });
      }
    }
    return staged;
  }
}
