import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

import { firestore } from '@/shared/firebase/app';
import { createAlert } from '@/shared/firebase/alerts';
import { createNoaaAdapter } from './noaa.adapter';
import type { ExternalAlertDTO, ExternalAlertSource } from './types';
import { createUsgsAdapter } from './usgs.adapter';

const adapters: ExternalAlertSource[] = [createUsgsAdapter(), createNoaaAdapter()];

async function alreadyIngested(externalId: string): Promise<boolean> {
  const q = query(
    collection(firestore, 'alerts'),
    where('externalId', '==', externalId),
    limit(1),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function ingestExternalAlerts(): Promise<{ ingested: number; total: number }> {
  let total = 0;
  let ingested = 0;

  for (const adapter of adapters) {
    let fetched: ExternalAlertDTO[];
    try {
      fetched = await adapter.fetch();
    } catch {
      continue;
    }

    total += fetched.length;

    for (const alert of fetched) {
      if (await alreadyIngested(alert.externalId)) continue;

      try {
        await createAlert({
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          source: alert.source,
          coordinates: alert.coordinates,
          radiusKm: alert.radiusKm,
          sentBy: 'system',
          externalId: alert.externalId,
        });
        ingested++;
      } catch {
        // skip duplicates
      }
    }
  }

  return { ingested, total };
}
