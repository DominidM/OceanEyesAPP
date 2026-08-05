import type { NewReport } from '../entities/report';
import type { StagedMedia } from './report-media';

export type QueuedReport = {
  id: string;
};

export interface ReportOutboxPort {
  enqueue(newReport: NewReport, media: StagedMedia[]): Promise<QueuedReport>;
}
