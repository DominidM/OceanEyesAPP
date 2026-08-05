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
import { levelLabelFor } from '../data/rewards';
import { useRewardsData } from '../hooks/use-rewards-data';
import { RewardsColors } from '../theme';

export function RewardsSection() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const { rewards, claims, guest } = useRewardsData();
  const [tab, setTab] = useState<RewardsTab>('recompensas');
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const items = tab === 'recompensas' ? rewards : claims;

  const balance = profile?.pointsBalance;
  const levelLabel = guest || !profile ? undefined : levelLabelFor(profile.totalPointsEarned);
  const progress =
    guest || !profile
      ? undefined
      : { label: 'Recompensas canjeadas', value: String(claims.length), fill: Math.min(claims.length / 10, 1) };

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
        <PointsCard
          guest={guest}
          onLogin={() => router.push('/mobile/login')}
          balance={balance}
          levelLabel={levelLabel}
          progress={progress}
        />

        <SectionTabs active={tab} onChange={setTab} />

        <View style={styles.list}>
          {items.length > 0 ? (
            items.map((reward) => (
              <RewardItem key={reward.id} reward={reward} claimed={tab === 'recientes'} />
            ))
          ) : tab === 'recientes' ? (
            <View style={styles.emptyCard}>
              <AppSymbol
                name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }}
                color={RewardsColors.textMuted}
                size={28}
              />
              <Text style={styles.emptyTitle}>Sin canjes todavía</Text>
              <Text style={styles.emptyText}>
                {guest
                  ? 'Inicia sesión para ver y canjear tus recompensas.'
                  : 'Cuando canjees una recompensa, aparecerá aquí.'}
              </Text>
              {guest ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/mobile/login')}
                  style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}>
                  <Text style={styles.emptyButtonLabel}>Iniciar sesión</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Sin recompensas disponibles</Text>
              <Text style={styles.emptyText}>Vuelve pronto; pronto habrá nuevas recompensas.</Text>
            </View>
          )}
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
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: RewardsColors.border,
    backgroundColor: RewardsColors.surface,
  },
  emptyTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
  },
  emptyText: {
    color: RewardsColors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  emptyButton: {
    marginTop: 8,
    minWidth: 140,
    height: 40,
    borderRadius: 9999,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
  },
  emptyButtonLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    includeFontPadding: false,
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
