export type SubmissionMedia = {
  uri: string;
  kind: 'photo' | 'video';
};

export type StagedMedia = {
  localUri: string;
  kind: 'photo' | 'video';
};

export interface ReportMediaPort {
  stageAll(media: SubmissionMedia[]): Promise<StagedMedia[]>;
}
