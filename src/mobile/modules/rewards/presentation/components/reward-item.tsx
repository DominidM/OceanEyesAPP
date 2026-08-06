import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { Reward } from '../data/rewards';
import { RewardsColors } from '../theme';
import { shadow } from '@/shared/utils/shadows';

type RewardItemProps = {
  reward: Reward;
  claimed?: boolean;
};

export function RewardItem({ reward, claimed }: RewardItemProps) {
  const subdued = Boolean(reward.locked) || Boolean(claimed);
  const iconColor = subdued ? RewardsColors.textMuted : RewardsColors.accent;
  const buttonLabel = reward.locked ? 'Bloqueado' : claimed ? 'Cobrado' : 'Canjear';

  return (
    <View style={[styles.card, subdued && styles.cardSubdued]}>
      <View style={[styles.iconBox, subdued && styles.iconBoxSubdued]}>
        <AppSymbol name={reward.icon} color={iconColor} size={26} />
      </View>

      <View style={styles.copy}>
        <AppText style={styles.title}>{reward.title}</AppText>
        <AppText style={styles.subtitle}>{reward.subtitle}</AppText>

        <View style={styles.pointsRow}>
          <View style={[styles.pointsDot, { backgroundColor: iconColor }]} />
          <AppText style={[styles.pointsText, { color: iconColor }]}>{reward.points} pts</AppText>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={subdued}
        style={[styles.button, subdued && styles.buttonSubdued]}>
        <AppText style={[styles.buttonText, subdued && styles.buttonTextSubdued]}>
          {buttonLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: RewardsColors.cardBorder,
    backgroundColor: RewardsColors.surface,
    ...shadow('subtle'),
  },
  cardSubdued: {
    borderStyle: 'dashed',
    borderColor: RewardsColors.borderDashed,
    backgroundColor: RewardsColors.surfaceMuted,
    opacity: 0.6,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RewardsColors.surfaceMuted,
  },
  iconBoxSubdued: {
    backgroundColor: 'rgba(44, 44, 44, 0.08)',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  subtitle: {
    marginTop: 4,
    color: RewardsColors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    includeFontPadding: false,
  },
  pointsRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsDot: {
    width: 13.74,
    height: 10.32,
    borderRadius: 3,
  },
  pointsText: {
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    includeFontPadding: false,
  },
  button: {
    minWidth: 80,
    height: 36,
    borderRadius: 9999,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RewardsColors.accent,
  },
  buttonSubdued: {
    backgroundColor: RewardsColors.borderDashed,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  buttonTextSubdued: {
    color: RewardsColors.textMuted,
  },
});
