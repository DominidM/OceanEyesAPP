export interface ReportIdentityPort {
  ensureSignedIn(): Promise<boolean>;
  getDeviceHash(): Promise<string | null>;
}
