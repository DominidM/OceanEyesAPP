import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

import { SurfaceColors } from '../theme';

export type ReportStat = {
  label: string;
  value: string;
  icon?: SymbolName;
};

export function StatsStrip({ stats }: { stats: ReportStat[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.statsScroll}
      contentContainerStyle={styles.statsContent}>
      {stats.map((item) => (
        <View key={item.label} style={styles.statCard}>
          <View style={styles.statLabelRow}>
            <Text style={styles.statLabel}>{item.label}</Text>
            {item.icon ? <AppSymbol name={item.icon} color={BrandColors.primary} size={11} /> : null}
          </View>
          <Text style={styles.statValue}>{item.value}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsScroll: {
    width: '100%',
    height: 116,
  },
  statsContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  statCard: {
    width: 140,
    height: 84,
    padding: 16,
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SurfaceColors.border,
    backgroundColor: SurfaceColors.card,
  },
  statLabelRow: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: SurfaceColors.mutedText,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statValue: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
});
