export type SubmissionMedia = {
  uri: string;
  kind: 'photo' | 'video';
};

export type StagedMedia = {
  localUri: string;
  kind: 'photo' | 'video' | 'audio';
};

export type SubmissionAudio = {
  uri: string;
  durationMillis: number;
};

export type StagedAudio = {
  localUri: string;
  durationMillis: number;
};

export interface ReportMediaPort {
  stageAll(media: SubmissionMedia[]): Promise<StagedMedia[]>;
  stageAudio(audio: SubmissionAudio): Promise<StagedAudio>;
}