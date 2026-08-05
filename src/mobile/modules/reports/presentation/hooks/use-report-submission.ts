import { useCallback, useState } from 'react';

import { signInAsGuest } from '@/shared/firebase/auth';
import { useAuth } from '@/shared/firebase/auth-context';
import { publishReportOnline, saveReportOfflineFirst } from '@/shared/firebase/reports';
import type { ReportInput } from '@/shared/firebase/types';
import { useBan } from '@/shared/identity/ban-context';
import { useConnectivity } from '@/shared/offline/connectivity-context';
import { isNetworkError } from '@/shared/offline/sync-engine';

export type SubmissionMedia = { uri: string; kind: 'photo' | 'video' };

export function useReportSubmission() {
  const { user } = useAuth();
  const { verdict } = useBan();
  const { online } = useConnectivity();
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
        // Invitado sin sesión: se crea una sesión anónima solo al momento de enviar.
        // Requiere habilitar el sign-in anónimo en Firebase Auth. Si falla (p. ej. Firebase
        // sin configurar), el reporte se encola localmente en lugar de bloquear al usuario.
        if (!user) {
          try {
            await signInAsGuest();
          } catch {
            await saveReportOfflineFirst(input, media);
            setQueued(true);
            setSubmitted(true);
            return;
          }
        }

        if (online) {
          try {
            await publishReportOnline(input, media);
            setQueued(false);
          } catch (error) {
            if (isNetworkError(error)) {
              await saveReportOfflineFirst(input, media);
              setQueued(true);
            } else {
              throw error;
            }
          }
        } else {
          await saveReportOfflineFirst(input, media);
          setQueued(true);
        }
        setSubmitted(true);
      } catch {
        setSendError('No se pudo guardar el reporte. Revisa tu conexión e inténtalo nuevamente.');
      } finally {
        setSending(false);
      }
    },
    [user, verdict, online],
  );

  const reset = useCallback(() => {
    setSending(false);
    setSendError('');
    setQueued(false);
    setSubmitted(false);
  }, []);

  return { submit, sending, sendError, queued, submitted, reset };
}
