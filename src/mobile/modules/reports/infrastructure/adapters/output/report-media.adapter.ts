import { stageMedia } from '@/shared/offline/media';

import type {
  ReportMediaPort,
  StagedAudio,
  StagedMedia,
  SubmissionAudio,
  SubmissionMedia,
} from '@/modules/reports/domain/ports/report-media';

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

  async stageAudio(audio: SubmissionAudio): Promise<StagedAudio> {
    try {
      const localUri = await stageMedia(audio.uri, 'audio');
      return { localUri, durationMillis: audio.durationMillis };
    } catch {
      return { localUri: audio.uri, durationMillis: audio.durationMillis };
    }
  }
}
