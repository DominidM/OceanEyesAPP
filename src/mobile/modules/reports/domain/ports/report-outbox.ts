import type { NewReport } from '../entities/report';
import type { StagedAudio, StagedMedia } from './report-media';

export type QueuedReport = {
  id: string;
};

export interface ReportOutboxPort {
  enqueue(newReport: NewReport, media: StagedMedia[], audio?: StagedAudio | null): Promise<QueuedReport>;
}
