import { useCallback, useEffect, useState } from 'react';

import type { ReportDto } from '@/modules/reports/application/dto/report.dto';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { useAuth } from '@/shared/firebase/auth-context';
import { useDb } from '@/shared/hooks/use-db';
import { getCached, setCached } from '@/shared/offline/read-cache';
import { getPendingReports, subscribeOutbox, type PendingReport } from '@/shared/offline/outbox';

export function useMyReportsWithCache<T>(
  cacheKey: string,
  transform: (reports: ReportDto[]) => T[],
): { reports: T[]; queued: PendingReport[]; refresh: () => void } {
  const [reports, setReports] = useState<T[]>([]);
  const [queued, setQueued] = useState<PendingReport[]>([]);
  const [nonce, setNonce] = useState(0);
  const { user } = useAuth();
  const db = useDb('reports');

  useEffect(() => {
    (async () => {
      const cached = await getCached<T[]>(cacheKey);
      if (cached?.length) setReports(cached);
      if (!isFirebaseConfigured() || !user) return;
      try {
        const items = await db.getMyReports(user.uid);
        const cards = transform(items);
        setReports(cards);
        await setCached(cacheKey, cards);
      } catch {
        // keep cached data
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  useEffect(() => {
    const loadQueued = () => {
      getPendingReports().then(setQueued).catch(() => undefined);
    };
    loadQueued();
    return subscribeOutbox(loadQueued);
  }, []);

  const refresh = useCallback(() => setNonce((value) => value + 1), []);

  return { reports, queued, refresh };
}
