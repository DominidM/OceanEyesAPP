/**
 * PU-05 (cliente) Archivo no permitido / pesado — validación previa a la subida.
 * Unidad bajo prueba: src/mobile/shared/offline/media-validation.ts
 */
import { describe, expect, it } from '@jest/globals';

import {
  type MediaKind,
  assertMediaFile,
  checkMediaFile,
  MAX_MEDIA_BYTES,
  MediaValidationError,
} from '@/shared/offline/media-validation';

const MB = 1024 * 1024;

describe('PU-05 validación de archivos en el cliente', () => {
  it('el límite es 25 MB', () => {
    expect(MAX_MEDIA_BYTES).toBe(25 * MB);
  });

  const cases: [string, MediaKind, string][] = [
    ['file:///foto.jpg', 'photo', 'image/jpeg'],
    ['file:///foto.HEIC', 'photo', 'image/heic'],
    ['file:///clip.mov', 'video', 'video/quicktime'],
    ['file:///nota.m4a', 'audio', 'audio/mp4'],
  ];

  it.each(cases)('acepta %s como %s', (uri, kind, mime) => {
    expect(checkMediaFile({ uri, kind, size: 3 * MB })).toEqual({ ok: true, mimeType: mime });
  });

  it('rechaza un PDF y un ejecutable', () => {
    expect(checkMediaFile({ uri: 'file:///doc.pdf', kind: 'photo', size: 1000 }).ok).toBe(false);
    expect(checkMediaFile({ uri: 'file:///x.apk', kind: 'video', size: 1000 }).ok).toBe(false);
  });

  it('rechaza un MIME declarado que no corresponde al tipo de evidencia', () => {
    expect(checkMediaFile({ uri: 'file:///a.jpg', kind: 'photo', mimeType: 'application/pdf' }).ok).toBe(false);
    expect(checkMediaFile({ uri: 'file:///a.mp4', kind: 'photo', size: 10 }).ok).toBe(false);
  });

  it('rechaza archivos de más de 25 MB y acepta exactamente 25 MB', () => {
    const heavy = checkMediaFile({ uri: 'file:///foto.jpg', kind: 'photo', size: 25 * MB + 1 });
    expect(heavy.ok).toBe(false);
    if (!heavy.ok) expect(heavy.reason).toMatch(/máximo es 25\.0 MB/);
    expect(checkMediaFile({ uri: 'file:///foto.jpg', kind: 'photo', size: 25 * MB }).ok).toBe(true);
  });

  it('assertMediaFile lanza MediaValidationError', () => {
    expect(() => assertMediaFile({ uri: 'file:///v.mp4', kind: 'video', size: 30 * MB })).toThrow(MediaValidationError);
  });
});
