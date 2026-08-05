import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppFonts as Fonts } from '@/constants/theme';
import { RewardsColors } from '../theme';
import { shadow } from '@/shared/utils/shadows';
const arrowIcon: SymbolName = { ios: 'arrow.right', android: 'arrow-forward', web: 'arrow-forward' };

export type PointsProgress = {
  label: string;
  value: string;
  fill: number;
};

export function PointsCard({
  guest = false,
  onLogin,
  balance,
  levelLabel,
  progress,
}: PointsCardProps) {
  const balanceText = guest || balance == null ? '—' : balance.toLocaleString('es-PE');
  const levelText = guest ? 'Invitado' : levelLabel ?? 'Guardián del Mar';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.balanceCol}>
          <Text style={styles.balanceLabel}>{guest ? 'Inicia sesión' : 'Saldo de puntos'}</Text>
          <Text style={styles.balanceValue}>{balanceText}</Text>
        </View>

        <View style={styles.levelPill}>
          <View style={styles.levelDot} />
          <Text style={styles.levelText}>{levelText}</Text>
        </View>
      </View>

      {!guest && progress ? (
        <>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>{progress.label}</Text>
            <Text style={styles.statText}>{progress.value}</Text>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress.fill * 100}%` }]} />
          </View>
        </>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={guest ? onLogin : undefined}
        style={styles.button}>
        <Text style={styles.buttonText}>{guest ? 'Inicia sesión para canjear' : 'Canjear puntos'}</Text>
        <AppSymbol
          name={guest ? { ios: 'lock.fill', android: 'lock', web: 'lock' } : arrowIcon}
          color={RewardsColors.accent}
          size={14}
        />
      </Pressable>
    </View>
  );
}

type PointsCardProps = {
  guest?: boolean;
  onLogin?: () => void;
  balance?: number;
  levelLabel?: string;
  progress?: PointsProgress;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: RewardsColors.cardSolid,
    ...shadow('lift'),
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
    color: RewardsColors.textDim,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  balanceValue: {
    marginTop: 4,
    color: RewardsColors.text,
    fontFamily: Fonts.headline,
    fontSize: 35,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -1.8,
    includeFontPadding: false,
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
    includeFontPadding: false,
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
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
});
