import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityRow } from '../components/activity-row';
import { toActivityItem } from '../data/rewards';
import { usePointTransactions } from '../hooks/use-point-transactions';
import { useRewardsData } from '../hooks/use-rewards-data';
import { RewardsColors } from '../theme';

const backIcon: SymbolName = { ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' };
const clockIcon: SymbolName = { ios: 'clock.fill', android: 'schedule', web: 'schedule' };

export function RecentActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { transactions, loading, guest } = usePointTransactions();
  const { rewards } = useRewardsData();

  const rewardTitleById = useMemo(
    () => new Map(rewards.map((reward) => [reward.id, reward.title])),
    [rewards],
  );

  const items = useMemo(
    () =>
      transactions.map((tx) =>
        toActivityItem(tx, tx.rewardId ? rewardTitleById.get(tx.rewardId) : undefined),
      ),
    [transactions, rewardTitleById],
  );

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <AppSymbol name={backIcon} color={BrandColors.primary} size={22} />
        </Pressable>
        <AppText style={styles.topBarTitle}>Actividad reciente</AppText>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={BrandColors.primary} size="large" />
          </View>
        ) : items.length > 0 ? (
          <View style={styles.card}>
            {items.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </View>
        ) : (
          <View style={styles.stateCard}>
            <AppSymbol name={clockIcon} color={RewardsColors.textMuted} size={28} />
            <AppText style={styles.stateTitle}>Sin actividad todavía</AppText>
            <AppText style={styles.stateText}>
              {guest
                ? 'Inicia sesión para ver tu actividad de puntos.'
                : 'Cuando verifiques reportes o canjees recompensas, aparecerá aquí.'}
            </AppText>
            {guest ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/mobile/login')}
                style={({ pressed }) => [styles.stateButton, pressed && styles.pressed]}>
                <AppText style={styles.stateButtonLabel}>Iniciar sesión</AppText>
              </Pressable>
            ) : null}
          </View>
        )}
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
  body: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D9CFC5',
    backgroundColor: 'rgba(239, 235, 227, 0.95)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  topBarSpacer: {
    width: 40,
  },
  card: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: RewardsColors.border,
    backgroundColor: RewardsColors.surface,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  stateCard: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: RewardsColors.border,
    backgroundColor: RewardsColors.surface,
  },
  stateTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
  },
  stateText: {
    color: RewardsColors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  stateButton: {
    marginTop: 8,
    minWidth: 140,
    height: 40,
    borderRadius: 9999,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
  },
  stateButtonLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
