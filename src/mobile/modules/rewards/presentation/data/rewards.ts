import type { SymbolName } from '@/shared/components/app-symbol';
import type { Redemption, Reward as FirestoreReward } from '@/shared/firebase/types';

export type Reward = {
  id: string;
  title: string;
  subtitle: string;
  points: string;
  icon: SymbolName;
  locked?: boolean;
};

export function toRewardCard(reward: FirestoreReward): Reward {
  return {
    id: reward.id,
    title: reward.title,
    subtitle: reward.description ?? reward.sponsor ?? 'Recompensa OceanEyes',
    points: String(reward.pointsCost),
    icon: rewardIconFor(reward.title),
    locked: reward.stock === 0,
  };
}

export function toClaimCard(redemption: Redemption): Reward {
  const date = redemption.claimedAt?.toDate?.() ?? new Date();
  return {
    id: redemption.id,
    title: 'Recompensa canjeada',
    subtitle: `Canjeado ${date.toLocaleDateString()}`,
    points: String(redemption.pointsSpent),
    icon: { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' },
  };
}

export function levelLabelFor(totalPoints: number): string {
  const name = 'Guardián del Mar';
  if (totalPoints >= 1000) return `Nivel 5 ${name}`;
  if (totalPoints >= 500) return `Nivel 4 ${name}`;
  if (totalPoints >= 300) return `Nivel 3 ${name}`;
  if (totalPoints >= 100) return `Nivel 2 ${name}`;
  return `Nivel 1 ${name}`;
}

function rewardIconFor(title: string): SymbolName {
  const t = title.toLowerCase();
  if (t.includes('combustible')) {
    return { ios: 'fuelpump.fill', android: 'local-gas-station', web: 'local-gas-station' };
  }
  if (t.includes('red')) {
    return { ios: 'network', android: 'share', web: 'share' };
  }
  if (t.includes('limpieza') || t.includes('kit')) {
    return { ios: 'trash.fill', android: 'cleaning-services', web: 'cleaning-services' };
  }
  if (t.includes('curso')) {
    return { ios: 'book.fill', android: 'menu-book', web: 'menu-book' };
  }
  if (t.includes('boya')) {
    return { ios: 'location.fill', android: 'my-location', web: 'my-location' };
  }
  return { ios: 'gift.fill', android: 'redeem', web: 'redeem' };
}
