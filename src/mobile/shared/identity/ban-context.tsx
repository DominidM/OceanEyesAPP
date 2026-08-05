import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/shared/firebase/auth-context';
import { isDeviceBanned } from '@/shared/firebase/bans';
import { getDeviceHash } from '@/shared/identity/device-id';

export type BanVerdict = 'ok' | 'account_suspended' | 'device_banned' | 'checking';

type BanContextValue = {
  verdict: BanVerdict;
  reason: string | null;
  checking: boolean;
};

const BanContext = createContext<BanContextValue>({ verdict: 'checking', reason: null, checking: true });

export function BanProvider({ children }: React.PropsWithChildren) {
  const { profile } = useAuth();
  const [verdict, setVerdict] = useState<BanVerdict>('checking');
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (profile?.status === 'suspended') {
        setVerdict('account_suspended');
        setReason(profile.banReason ?? 'Tu cuenta ha sido suspendida.');
        return;
      }

      const hash = await getDeviceHash();
      if (cancelled) return;
      if (!hash) {
        setVerdict('ok');
        setReason(null);
        return;
      }

      const banned = await isDeviceBanned(hash);
      if (cancelled) return;
      if (banned) {
        setVerdict('device_banned');
        setReason('Este dispositivo está bloqueado para enviar reportes.');
      } else {
        setVerdict('ok');
        setReason(null);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  return (
    <BanContext.Provider
      value={{ verdict, reason, checking: verdict === 'checking' }}
    >
      {children}
    </BanContext.Provider>
  );
}

export function useBan() {
  return useContext(BanContext);
}
