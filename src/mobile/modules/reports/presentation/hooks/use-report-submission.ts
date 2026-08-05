import { useCallback, useState } from 'react';

import type { ReportInput } from '@/shared/firebase/types';
import { useBan } from '@/shared/identity/ban-context';
import { useConnectivity } from '@/shared/offline/connectivity-context';
import { useDb } from '@/shared/hooks/use-db';

export type SubmissionMedia = { uri: string; kind: 'photo' | 'video' };

export function useReportSubmission() {
  const { verdict } = useBan();
  const { online } = useConnectivity();
  const db = useDb('reports');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [queued, setQueued] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = useCallback(
    async (input: ReportInput, media: SubmissionMedia[] = []) => {
      if (verdict !== 'ok') {
        setSendError('Tu cuenta o dispositivo está bloqueado para enviar reportes.');
        return;
      }
      setSendError('');
      setSending(true);
      try {
        const result = await db.submit(
          {
            category: input.category,
            title: input.title,
            description: input.description,
            isAnonymous: input.isAnonymous,
            location: input.location,
            media,
          },
          { online },
        );
        setQueued(result.queued);
        setSubmitted(true);
      } catch {
        setSendError('No se pudo guardar el reporte. Revisa tu conexión e inténtalo nuevamente.');
      } finally {
        setSending(false);
      }
    },
    [verdict, online, db],
  );

  const reset = useCallback(() => {
    setSending(false);
    setSendError('');
    setQueued(false);
    setSubmitted(false);
  }, []);

  return { submit, sending, sendError, queued, submitted, reset };
}
