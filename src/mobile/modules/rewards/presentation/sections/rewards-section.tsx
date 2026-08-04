import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { SectionHeader } from '@/shared/components/section-header';
import { useAuth } from '@/shared/firebase/auth-context';

import { PointsCard } from '../components/points-card';
import { RecentFooter } from '../components/recent-footer';
import { RewardItem } from '../components/reward-item';
import { RewardsTutorial } from '../components/rewards-tutorial';
import { SectionTabs, RewardsTab } from '../components/section-tabs';
import { RECENT_CLAIMS, REWARDS } from '../data/rewards';

export function RewardsSection() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<RewardsTab>('recompensas');
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const guest = !user || user.isAnonymous;
  const items = tab === 'recompensas' ? REWARDS : RECENT_CLAIMS;

  return (
    <View style={styles.root}>
      <SectionHeader title="Recompensas">
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setTutorialOpen(true)}
            style={({ pressed }) => [styles.tutorialButton, pressed && styles.pressed]}>
            <AppSymbol
              name={{ ios: 'questionmark.circle.fill', android: 'help', web: 'help' }}
              color={BrandColors.primary}
              size={16}
            />
            <Text style={styles.tutorialLabel}>¿Cómo funciona?</Text>
          </Pressable>
        </View>
      </SectionHeader>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        <PointsCard guest={guest} onLogin={() => router.push('/mobile/login')} />

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

      <RewardsTutorial visible={tutorialOpen} onClose={() => setTutorialOpen(false)} />
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
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingBottom: 12,
  },
  tutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(19, 78, 94, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  tutorialLabel: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
