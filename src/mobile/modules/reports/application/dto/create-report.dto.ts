import type { SubmissionMedia } from '../../domain/ports/report-media';
import type { ReportCategoryId } from '../../domain/valueObjects/report-category';

export type CreateReportCommand = {
  category: ReportCategoryId;
  title: string;
  description?: string;
  isAnonymous: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  media?: SubmissionMedia[];
};
