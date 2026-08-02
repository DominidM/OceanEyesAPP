import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';
import { SectionHeader } from '@/shared/components/section-header';

import { PointsCard } from '../components/points-card';
import { RecentFooter } from '../components/recent-footer';
import { RewardItem } from '../components/reward-item';
import { SectionTabs, RewardsTab } from '../components/section-tabs';
import { RECENT_CLAIMS, REWARDS } from '../data/rewards';

export function RewardsSection() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<RewardsTab>('recompensas');

  const items = tab === 'recompensas' ? REWARDS : RECENT_CLAIMS;

  return (
    <View style={styles.root}>
      <SectionHeader title="Recompensas" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        <PointsCard />

        <SectionTabs active={tab} onChange={setTab} />

        <View style={styles.list}>
          {items.map((reward) => (
            <RewardItem
              key={reward.id}
              reward={reward}
              claimed={tab === 'recientes'}
            />
          ))}
        </View>

        <RecentFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.tertiary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    gap: 16,
  },
  list: {
    gap: 16,
  },
});
