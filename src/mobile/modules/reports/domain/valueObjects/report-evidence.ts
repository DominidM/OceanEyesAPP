/**
 * Estado de la evidencia de un reporte: compara los archivos que el usuario adjuntó al crearlo
 * (`mediaExpected`) con los que quedaron enlazados en el documento.
 */
export type EvidenceStatus = 'sin_medios' | 'completa' | 'incompleta' | 'sin_evidencia';

export type EvidenceFields = {
  photoURLs?: string[] | null;
  audioURL?: string | null;
  mediaExpected?: number | null;
};

export function attachedMediaCount(report: EvidenceFields): number {
  return (report.photoURLs?.length ?? 0) + (report.audioURL ? 1 : 0);
}

export function getEvidenceStatus(report: EvidenceFields): EvidenceStatus {
  const attached = attachedMediaCount(report);
  // Reportes anteriores a mediaExpected: se asume que lo adjunto es todo lo que hubo.
  const expected = Math.max(report.mediaExpected ?? attached, attached);
  if (expected === 0) return 'sin_medios';
  if (attached === 0) return 'sin_evidencia';
  if (attached < expected) return 'incompleta';
  return 'completa';
}

export function evidenceLabel(report: EvidenceFields): string | null {
  const status = getEvidenceStatus(report);
  const attached = attachedMediaCount(report);
  const expected = Math.max(report.mediaExpected ?? attached, attached);
  switch (status) {
    case 'sin_evidencia':
      return 'Sin evidencia';
    case 'incompleta':
      return `Evidencia incompleta (${attached} de ${expected})`;
    default:
      return null;
  }
}
