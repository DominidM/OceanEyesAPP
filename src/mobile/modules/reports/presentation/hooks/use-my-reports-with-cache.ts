import { useCallback, useEffect, useState } from 'react';

import { isFirebaseConfigured } from '@/shared/firebase/config';
import { getMyReports } from '@/shared/firebase/reports';
import type { Report as FirestoreReport } from '@/shared/firebase/types';
import { getCached, setCached } from '@/shared/offline/read-cache';
import { getPendingReports, subscribeOutbox, type PendingReport } from '@/shared/offline/outbox';

export function useMyReportsWithCache<T>(
  cacheKey: string,
  transform: (reports: FirestoreReport[]) => T[],
): { reports: T[]; queued: PendingReport[]; refresh: () => void } {
  const [reports, setReports] = useState<T[]>([]);
  const [queued, setQueued] = useState<PendingReport[]>([]);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    (async () => {
      const cached = await getCached<T[]>(cacheKey);
      if (cached?.length) setReports(cached);
      if (!isFirebaseConfigured()) return;
      try {
        const items = await getMyReports();
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
