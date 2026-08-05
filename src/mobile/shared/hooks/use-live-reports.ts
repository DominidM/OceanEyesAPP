import { useEffect, useRef, useState } from 'react';

import type { ReportDto } from '@/modules/reports/application/dto/report.dto';
import { useDb } from '@/shared/hooks/use-db';

export function useLiveReports<T = ReportDto>(
  transform?: (reports: ReportDto[]) => T[],
): { reports: T[]; loading: boolean } {
  const [reports, setReports] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const db = useDb('reports');

  useEffect(() => {
    const unsubscribe = db.subscribe((items) => {
      const map = transformRef.current;
      setReports(map ? map(items) : (items as unknown as T[]));
    });
    setLoading(false);
    return unsubscribe;
  }, [db]);

  return { reports, loading };
}
