// Validación de evidencias antes de subirlas (RNF-09): tipo MIME permitido y tamaño ≤ 25 MB.
// Coincide con storage.rules y con el preset de Cloudinary (scripts/create-cloudinary-preset.sh).

export const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

export type MediaKind = 'photo' | 'video' | 'audio';

const MIME_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.aac': 'audio/aac',
  '.wav': 'audio/wav',
  '.caf': 'audio/x-caf',
};

export const ALLOWED_MIME_TYPES: Record<MediaKind, readonly string[]> = {
  photo: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  video: ['video/mp4', 'video/quicktime', 'video/x-m4v'],
  // expo-audio graba .m4a; los videos de audio de iOS pueden reportarse como mp4.
  audio: ['audio/mp4', 'audio/x-m4a', 'audio/mpeg', 'audio/aac', 'audio/wav', 'audio/x-caf', 'video/mp4'],
};

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediaValidationError';
  }
}

export function extensionOfUri(uri: string): string {
  const path = uri.split(/[?#]/)[0];
  const dot = path.lastIndexOf('.');
  const slash = path.lastIndexOf('/');
  return dot > slash ? path.slice(dot).toLowerCase() : '';
}

export function mimeFromUri(uri: string): string | null {
  return MIME_BY_EXTENSION[extensionOfUri(uri)] ?? null;
}

function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type MediaCheck = { ok: true; mimeType: string } | { ok: false; reason: string };

/**
 * `size` y `mimeType` vienen del picker cuando están disponibles; si no hay MIME se deduce de la
 * extensión. Un tamaño desconocido (undefined) no bloquea aquí: se vuelve a comprobar antes de subir.
 */
export function checkMediaFile(input: { uri: string; kind: MediaKind; size?: number | null; mimeType?: string | null }): MediaCheck {
  const mimeType = (input.mimeType || mimeFromUri(input.uri) || '').toLowerCase();
  if (!mimeType || !ALLOWED_MIME_TYPES[input.kind].includes(mimeType)) {
    return { ok: false, reason: `Tipo de archivo no permitido (${mimeType || extensionOfUri(input.uri) || 'desconocido'}).` };
  }
  if (typeof input.size === 'number' && input.size > MAX_MEDIA_BYTES) {
    return {
      ok: false,
      reason: `El archivo pesa ${formatMegabytes(input.size)}; el máximo es ${formatMegabytes(MAX_MEDIA_BYTES)}.`,
    };
  }
  return { ok: true, mimeType };
}

export function assertMediaFile(input: { uri: string; kind: MediaKind; size?: number | null; mimeType?: string | null }): string {
  const result = checkMediaFile(input);
  if (!result.ok) throw new MediaValidationError(result.reason);
  return result.mimeType;
}
