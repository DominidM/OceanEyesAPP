import { Directory, File, Paths } from 'expo-file-system';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '@/shared/firebase/app';

export type StagedMedia = {
  localUri: string;
  kind: 'photo' | 'video';
};

function outboxDirectory(): Directory {
  const dir = new Directory(Paths.document, 'outbox');
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

function extensionFor(uri: string, kind: 'photo' | 'video'): string {
  try {
    const extension = new File(uri).extension;
    if (extension) return extension;
  } catch {
    /* ignore */
  }
  return kind === 'video' ? '.mp4' : '.jpg';
}

function mimeFromExtension(ext: string, kind: 'photo' | 'video'): string {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.heic':
      return 'image/heic';
    case '.webp':
      return 'image/webp';
    case '.mov':
      return 'video/quicktime';
    case '.m4v':
      return 'video/x-m4v';
    case '.mp4':
      return 'video/mp4';
    default:
      return kind === 'video' ? 'video/mp4' : 'image/jpeg';
  }
}

export async function stageMedia(uri: string, kind: 'photo' | 'video'): Promise<string> {
  const extension = extensionFor(uri, kind);
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
  const destination = new File(outboxDirectory(), name);
  new File(uri).copy(destination);
  return destination.uri;
}

export async function removeStagedMedia(uris: string[]): Promise<void> {
  for (const uri of uris) {
    try {
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch {
      /* ignore */
    }
  }
}

export async function uploadMediaToStorage(options: {
  localUri: string;
  kind: 'photo' | 'video';
  reportId: string;
  mediaId: string;
}): Promise<string> {
  const extension = extensionFor(options.localUri, options.kind);
  const path = `reports/${options.reportId}/${options.mediaId}${extension}`;
  const storageRef = ref(storage, path);
  const contentType = mimeFromExtension(extension, options.kind);
  await uploadBytes(storageRef, new File(options.localUri), { contentType });
  return getDownloadURL(storageRef);
}
