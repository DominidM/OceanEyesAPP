import { useMemo } from 'react';

import type { ReportDb } from '@/modules/reports/infrastructure/adapters';
import { getReportDb } from '@/modules/reports/infrastructure/adapters';

export type DbSlices = {
  reports: ReportDb;
};

const DB_REGISTRY: { [K in keyof DbSlices]: () => DbSlices[K] } = {
  reports: getReportDb,
};

export function useDb<K extends keyof DbSlices>(slice: K): DbSlices[K] {
  return useMemo(() => DB_REGISTRY[slice](), [slice]);
}
