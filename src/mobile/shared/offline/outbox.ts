import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ReportInput } from '@/shared/firebase/types';

export type PendingMedia = {
  localUri: string;
  kind: 'photo' | 'video';
};

export type PendingReport = {
  id: string;
  input: ReportInput;
  media: PendingMedia[];
  remoteId?: string;
  createdAt: number;
  updatedAt: number;
  attempts: number;
  state: 'queued' | 'uploading' | 'retrying' | 'stuck';
  lastError?: string;
};

const STORAGE_KEY = '@oceaneyes/outbox/v1';

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeOutbox(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getPendingReports(): Promise<PendingReport[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingReport[]) : [];
  } catch {
    return [];
  }
}

async function persist(reports: PendingReport[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  emit();
}

export async function enqueueReport(
  input: ReportInput,
  media: PendingMedia[],
): Promise<PendingReport> {
  const now = Date.now();
  const item: PendingReport = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    input,
    media,
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    state: 'queued',
  };
  const all = await getPendingReports();
  all.unshift(item);
  await persist(all);
  return item;
}

export async function updatePendingReport(
  id: string,
  patch: Partial<Omit<PendingReport, 'id'>>,
): Promise<void> {
  const all = await getPendingReports();
  const index = all.findIndex((report) => report.id === id);
  if (index === -1) return;
  all[index] = { ...all[index], ...patch, updatedAt: Date.now() };
  await persist(all);
}

export async function removePendingReport(id: string): Promise<void> {
  const all = await getPendingReports();
  await persist(all.filter((report) => report.id !== id));
}

export async function clearOutbox(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  emit();
}
