import { Directory, File, Paths } from 'expo-file-system';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from '@/shared/firebase/app';

export type StagedMedia = {
  localUri: string;
  kind: 'photo' | 'video' | 'audio';
};

function outboxDirectory(): Directory {
  const dir = new Directory(Paths.document, 'outbox');
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

function extensionFor(uri: string, kind: 'photo' | 'video' | 'audio'): string {
  try {
    const extension = new File(uri).extension;
    if (extension) return extension;
  } catch {
    /* ignore */
  }
  if (kind === 'audio') return '.m4a';
  return kind === 'video' ? '.mp4' : '.jpg';
}

function mimeFromExtension(ext: string, kind: 'photo' | 'video' | 'audio'): string {
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
    case '.m4a':
      return 'audio/mp4';
    case '.caf':
      return 'audio/x-caf';
    case '.mp3':
      return 'audio/mpeg';
    case '.wav':
      return 'audio/wav';
    case '.aac':
      return 'audio/aac';
    default:
      if (kind === 'audio') return 'audio/mp4';
      return kind === 'video' ? 'video/mp4' : 'image/jpeg';
  }
}

export async function stageMedia(uri: string, kind: 'photo' | 'video' | 'audio'): Promise<string> {
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

export async function removeAllStagedMedia(): Promise<void> {
  try {
    const dir = new Directory(Paths.document, 'outbox');
    if (dir.exists) dir.delete();
  } catch {
    /* ignore */
  }
}

async function localFileToBlob(localUri: string, contentType: string): Promise<Blob> {
  const fromFileUri = async () => {
    const response = await fetch(localUri);
    if (!response.ok) throw new Error(`No se pudo leer el archivo (${response.status})`);
    return response.blob();
  };
  try {
    return await fromFileUri();
  } catch {
    const base64 = await new File(localUri).base64();
    const response = await fetch(`data:${contentType};base64,${base64}`);
    return response.blob();
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
  const file = new File(options.localUri);
  if (!file.exists) {
    throw new Error(`No se encontró el archivo multimedia: ${options.localUri}`);
  }
  const blob = await localFileToBlob(options.localUri, contentType);
  await uploadBytes(storageRef, blob, { contentType });
  return getDownloadURL(storageRef);
}
