import { publishPendingReport } from '@/shared/firebase/reports';

import { removeStagedMedia } from './media';
import { getPendingReports, removePendingReport, updatePendingReport } from './outbox';

export type SyncState = {
  syncing: boolean;
  pendingCount: number;
  lastSyncedAt: number | null;
  lastError: string | null;
};

const MAX_ATTEMPTS = 5;
const BACKOFF_BASE_MS = 1000;
const BACKOFF_MAX_MS = 60000;

let state: SyncState = {
  syncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
  lastError: null,
};

const listeners = new Set<(snapshot: SyncState) => void>();

let getOnline: () => boolean = () => true;
let currentRun: Promise<void> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let consecutiveFailures = 0;

export function initSyncEngine(options: { getOnline: () => boolean }): void {
  getOnline = options.getOnline;
}

function emit(): void {
  const snapshot = { ...state };
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribeSync(listener: (snapshot: SyncState) => void): () => void {
  listener({ ...state });
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSyncState(): SyncState {
  return { ...state };
}

async function refreshPendingCount(): Promise<void> {
  state.pendingCount = (await getPendingReports()).length;
  emit();
}

export function requestSync(_reason?: string): Promise<void> {
  const run = async () => {
    if (currentRun) {
      await currentRun;
    }
    if (state.pendingCount === 0 || !getOnline()) return;
    if (currentRun) return;
    currentRun = runSync().finally(() => {
      currentRun = null;
    });
    await currentRun;
  };
  return run();
}

function scheduleRetry(): void {
  if (retryTimer) return;
  const delay = Math.min(BACKOFF_BASE_MS * Math.pow(2, consecutiveFailures), BACKOFF_MAX_MS);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void requestSync('backoff-retry');
  }, delay);
}

function isNetworkError(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  const message = (error as { message?: string })?.message ?? '';
  return (
    code === 'unavailable' ||
    code === 'network-request-failed' ||
    code === 'resource-exhausted' ||
    /network|internet|fetch|offline|timeout|ECONNRESET|ENOTFOUND/i.test(message)
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'No se pudo sincronizar el reporte.';
}

async function runSync(): Promise<void> {
  if (!getOnline()) {
    state.lastError = 'Sin conexión — se reanudará automáticamente.';
    await refreshPendingCount();
    return;
  }

  state.syncing = true;
  emit();

  try {
    const items = await getPendingReports();
    for (const item of items) {
      try {
        await updatePendingReport(item.id, {
          state: 'uploading',
          attempts: item.attempts + 1,
          lastError: undefined,
        });
        await publishPendingReport(item);
        await removePendingReport(item.id);
        await removeStagedMedia(item.media.map((media) => media.localUri));
        consecutiveFailures = 0;
        state.lastSyncedAt = Date.now();
        state.lastError = null;
      } catch (error) {
        if (isNetworkError(error) || !getOnline()) {
          state.lastError = 'Sin conexión — se reanudará automáticamente.';
          break;
        }
        consecutiveFailures += 1;
        const message = errorMessage(error);
        const exhausted = item.attempts + 1 >= MAX_ATTEMPTS;
        await updatePendingReport(item.id, {
          state: exhausted ? 'stuck' : 'retrying',
          lastError: message,
        });
        if (exhausted) {
          state.lastError = 'Algunos reportes no pudieron enviarse.';
        } else {
          scheduleRetry();
          state.lastError = 'Reintentando más tarde.';
        }
        break;
      }
    }
  } finally {
    state.syncing = false;
    await refreshPendingCount();
    emit();
  }
}
