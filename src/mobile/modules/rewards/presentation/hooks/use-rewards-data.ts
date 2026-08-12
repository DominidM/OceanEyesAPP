import { useEffect, useState } from 'react';

import { useAuth } from '@/shared/firebase/auth-context';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { getAllRewards, getUserRedemptions } from '@/shared/firebase/rewards';

import { toClaimCard, toRewardCard, type Reward } from '../data/rewards';

export function useRewardsData() {
  const { user } = useAuth();
  const guest = !user;
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<Reward[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    getAllRewards()
      .then((catalog) => setRewards(catalog.map(toRewardCard)))
      .catch((e) => console.error('[Rewards] No se pudieron cargar:', e));
  }, [refreshKey]);

  useEffect(() => {
    if (!isFirebaseConfigured() || guest || !user) {
      setClaims([]);
      return;
    }
    getUserRedemptions(user.uid)
      .then((redemptions) => setClaims(redemptions.map(toClaimCard)))
      .catch((e) => console.error('[Rewards] No se pudieron cargar los canjes:', e));
  }, [guest, user, refreshKey]);

  return { rewards, claims, guest, refresh };
}
