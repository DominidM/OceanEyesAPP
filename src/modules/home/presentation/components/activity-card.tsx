import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

export type ActivityStat = {
  label: string;
  value: string;
  color: string;
};

export function ActivityCard({ stats }: { stats: ActivityStat[] }) {
  return (
    <View style={styles.activityCard}>
      <View style={styles.statsGrid}>
        {stats.map((item, index) => (
          <View
            key={item.label}
            style={[styles.statItem, index === 1 && styles.middleStat]}
            accessibilityLabel={`${item.value} ${item.label}`}>
            <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.levelRow}>
        <Text style={styles.levelText}>Nivel: Guardian del Mar</Text>
        <AppSymbol
          name={{ ios: 'medal.fill', android: 'military_tech', web: 'workspace_premium' }}
          color={BrandColors.primary}
          size={24}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activityCard: {
    height: 158,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: Spacing.four,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statsGrid: {
    height: 47,
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  middleStat: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(44, 44, 44, 0.12)',
  },
  statValue: {
    fontFamily: Fonts.label,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 32,
  },
  statLabel: {
    color: 'rgba(44, 44, 44, 0.62)',
    fontFamily: Fonts.label,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 15,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  levelRow: {
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  levelText: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
