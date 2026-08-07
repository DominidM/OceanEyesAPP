import type { User } from 'firebase/auth';

import type { ReportDto } from '@/modules/reports/application/dto/report.dto';
import type { ReportDb } from '@/modules/reports/infrastructure/adapters';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { getPendingReports, subscribeOutbox, type PendingReport } from '@/shared/offline/outbox';
import { getCached, setCached } from '@/shared/offline/read-cache';
import { ViewModel } from '@/shared/viewmodels/view-model';

export type ReportsListDeps<T> = {
  db: ReportDb;
  getUser: () => User | null;
  cacheKey: string;
  transform: (reports: ReportDto[]) => T[];
};

export type ReportsListState<T> = {
  reports: T[];
  queued: PendingReport[];
};

export class ReportsListViewModel<T> extends ViewModel<ReportsListState<T>, ReportsListDeps<T>> {
  private unsubscribeOutbox: (() => void) | null = null;
  private started = false;

  constructor(deps: ReportsListDeps<T>) {
    super({ reports: [], queued: [] }, deps);
  }

  start = () => {
    if (this.started) return;
    this.started = true;
    this.unsubscribeOutbox = subscribeOutbox(() => {
      void this.loadQueued();
    });
    void this.load();
    void this.loadQueued();
  };

  refresh = () => {
    void this.load();
  };

  override sync(): void {
    this.start();
  }

  private load = async () => {
    const { cacheKey, transform, getUser, db } = this.deps;
    const cached = await getCached<T[]>(cacheKey);
    if (cached?.length) this.setState({ reports: cached });
    const user = getUser();
    if (!isFirebaseConfigured() || !user) return;
    try {
      const items = await db.getMyReports(user.uid);
      const cards = transform(items);
      this.setState({ reports: cards });
      await setCached(cacheKey, cards);
    } catch {
      // keep cached data
    }
  };

  private loadQueued = async () => {
    try {
      this.setState({ queued: await getPendingReports() });
    } catch {
      // ignore
    }
  };

  override dispose(): void {
    this.unsubscribeOutbox?.();
    this.unsubscribeOutbox = null;
    super.dispose();
  }
}
