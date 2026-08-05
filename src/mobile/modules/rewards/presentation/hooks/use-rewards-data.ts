import { useEffect, useState } from 'react';

import { useAuth } from '@/shared/firebase/auth-context';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { getAllRewards, getUserRedemptions } from '@/shared/firebase/rewards';

import { toClaimCard, toRewardCard, type Reward } from '../data/rewards';

export function useRewardsData() {
  const { user } = useAuth();
  const guest = !user || user.isAnonymous;
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<Reward[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    getAllRewards()
      .then((catalog) => setRewards(catalog.map(toRewardCard)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured() || guest || !user) {
      setClaims([]);
      return;
    }
    getUserRedemptions(user.uid)
      .then((redemptions) => setClaims(redemptions.map(toClaimCard)))
      .catch(() => undefined);
  }, [guest, user]);

  return { rewards, claims, guest };
}
