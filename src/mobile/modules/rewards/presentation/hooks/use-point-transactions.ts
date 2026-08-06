import { useEffect, useState } from 'react';

import { useAuth } from '@/shared/firebase/auth-context';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { getUserPointTransactions } from '@/shared/firebase/rewards';
import type { PointTransaction } from '@/shared/firebase/types';

export function usePointTransactions() {
  const { user } = useAuth();
  const guest = !user;
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured() || guest || !user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getUserPointTransactions(user.uid)
      .then((items) => {
        if (active) setTransactions(items);
      })
      .catch(() => {
        if (active) setTransactions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [guest, user]);

  return { transactions, loading, guest };
}
