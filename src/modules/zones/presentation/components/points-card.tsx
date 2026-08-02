import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppFonts as Fonts } from '@/constants/theme';
import { LEVEL_BADGE, POINTS_BALANCE, PROGRESS } from '../data/rewards';
import { RewardsColors } from '../theme';
const arrowIcon: SymbolName = { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' };

export function PointsCard() {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.balanceCol}>
          <Text style={styles.balanceLabel}>Saldo de puntos</Text>
          <Text style={styles.balanceValue}>{POINTS_BALANCE}</Text>
        </View>

        <View style={styles.levelPill}>
          <View style={styles.levelDot} />
          <Text style={styles.levelText}>{LEVEL_BADGE}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statText}>{PROGRESS.label}</Text>
        <Text style={styles.statText}>{PROGRESS.value}</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${PROGRESS.fill * 100}%` }]} />
      </View>

      <Pressable accessibilityRole="button" style={styles.button}>
        <Text style={styles.buttonText}>Canjear puntos</Text>
        <AppSymbol name={arrowIcon} color={RewardsColors.accent} size={14} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: RewardsColors.cardSolid,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  balanceCol: {
    flex: 1,
  },
  balanceLabel: {
    color: RewardsColors.textSoft,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  balanceValue: {
    marginTop: 4,
    color: RewardsColors.text,
    fontFamily: Fonts.headline,
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -1.8,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  levelDot: {
    width: 10.5,
    height: 10.5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  levelText: {
    color: RewardsColors.text,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statsRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 0.9,
  },
  statText: {
    color: RewardsColors.text,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  track: {
    marginTop: 8,
    height: 12,
    borderRadius: 9999,
    backgroundColor: RewardsColors.track,
    overflow: 'hidden',
  },
  fill: {
    height: 12,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 24,
    height: 48,
    borderRadius: 9999,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    color: RewardsColors.accent,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
