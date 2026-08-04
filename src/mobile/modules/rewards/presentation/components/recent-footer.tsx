import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppFonts as Fonts } from '@/constants/theme';
import { RECENT_TEXT } from '../data/rewards';
import { RewardsColors } from '../theme';

const personIcon: SymbolName = { ios: 'person.fill', android: 'person', web: 'person' };

export function RecentFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Actividad reciente</Text>
        <Text style={styles.link}>Ver todo</Text>
      </View>

      <View style={styles.bodyRow}>
        <View style={styles.avatarStack}>
          <View style={styles.avatar}>
            <AppSymbol name={personIcon} color="#6D625B" size={14} />
          </View>
          <View style={[styles.avatar, styles.avatarOverlap]}>
            <AppSymbol name={personIcon} color="#6D625B" size={14} />
          </View>
        </View>

        <Text style={styles.text}>{RECENT_TEXT}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 24,
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: RewardsColors.border,
    backgroundColor: RewardsColors.surface,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    color: RewardsColors.textBottom,
    fontFamily: Fonts.label,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  link: {
    color: RewardsColors.accent,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 39.2,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44, 44, 44, 0.08)',
  },
  avatarOverlap: {
    marginLeft: -12,
  },
  text: {
    flex: 1,
    color: RewardsColors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
