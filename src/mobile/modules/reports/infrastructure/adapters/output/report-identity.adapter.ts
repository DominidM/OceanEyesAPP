import { firebaseAuth } from '@/shared/firebase/app';
import { signInAsGuest } from '@/shared/firebase/auth';
import { getDeviceHash } from '@/shared/identity/device-id';

import type { ReportIdentityPort } from '@/modules/reports/domain/ports/report-identity';

export class ReportIdentityAdapter implements ReportIdentityPort {
  async ensureSignedIn(): Promise<boolean> {
    if (firebaseAuth?.currentUser) return true;
    if (!firebaseAuth) return false;
    try {
      await signInAsGuest();
      return true;
    } catch {
      return false;
    }
  }

  async getDeviceHash(): Promise<string | null> {
    return getDeviceHash();
  }
}
