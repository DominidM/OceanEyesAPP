import { useEffect, useRef, useState } from 'react';

import { isFirebaseConfigured } from '@/shared/firebase/config';
import { subscribeReports } from '@/shared/firebase/reports';
import type { Report as FirestoreReport } from '@/shared/firebase/types';

export function useLiveReports<T = FirestoreReport>(
  transform?: (reports: FirestoreReport[]) => T[],
): { reports: T[]; loading: boolean } {
  const [reports, setReports] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    const unsubscribe = subscribeReports((items) => {
      const map = transformRef.current;
      setReports(map ? map(items) : (items as unknown as T[]));
    });
    setLoading(false);
    return unsubscribe;
  }, []);

  return { reports, loading };
}
