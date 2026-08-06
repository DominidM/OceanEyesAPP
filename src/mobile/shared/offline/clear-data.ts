import { removeAllStagedMedia } from './media';
import { clearOutbox } from './outbox';
import { clearCachedData } from './read-cache';

export async function clearLocalData(): Promise<void> {
  await clearOutbox();
  await removeAllStagedMedia();
  await clearCachedData();
}
