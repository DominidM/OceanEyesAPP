import { File } from 'expo-file-system';

import { uploadMediaToStorage } from './media';

export type CloudinaryKind = 'photo' | 'audio';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

function extensionOf(uri: string): string {
  try {
    const ext = new File(uri).extension;
    if (ext) return ext.toLowerCase();
  } catch {
    /* ignore */
  }
  return '';
}

function mimeFromExtension(ext: string, kind: CloudinaryKind): string {
  if (kind === 'audio') {
    switch (ext) {
      case '.mp3':
        return 'audio/mpeg';
      case '.wav':
        return 'audio/wav';
      case '.aac':
        return 'audio/aac';
      case '.m4a':
      case '.mp4':
        return 'audio/mp4';
      case '.caf':
        return 'audio/x-caf';
      default:
        return 'audio/mp4';
    }
  }
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.heic':
      return 'image/heic';
    default:
      return 'image/jpeg';
  }
}

async function readAsDataUri(localUri: string, kind: CloudinaryKind): Promise<string> {
  const ext = extensionOf(localUri);
  const mime = mimeFromExtension(ext, kind);
  const file = new File(localUri);
  if (!file.exists) {
    throw new Error(`No se encontró el archivo a subir: ${localUri}`);
  }
  const base64 = await file.base64();
  return `data:${mime};base64,${base64}`;
}

async function uploadToCloudinary(options: {
  localUri: string;
  kind: CloudinaryKind;
  reportId: string;
  mediaId: string;
}): Promise<string> {
  const file = await readAsDataUri(options.localUri, options.kind);
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('public_id', `reports/${options.reportId}/${options.mediaId}`);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const response = await fetch(endpoint, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Cloudinary upload falló (${response.status}): ${text}`);
  }
  const data = (await response.json()) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error('Cloudinary no devolvió una URL segura.');
  }
  return data.secure_url;
}

/**
 * Sube el medio a Cloudinary. Si Cloudinary no está configurado (env), cae
 * a Firebase Storage para no romper el flujo actual.
 */
export async function uploadReportMedia(options: {
  localUri: string;
  kind: CloudinaryKind;
  reportId: string;
  mediaId: string;
}): Promise<string> {
  if (!isCloudinaryConfigured()) {
    return uploadMediaToStorage({
      localUri: options.localUri,
      kind: options.kind === 'audio' ? 'video' : 'photo',
      reportId: options.reportId,
      mediaId: options.mediaId,
    });
  }
  return uploadToCloudinary(options);
}
