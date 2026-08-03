import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

type StatCardProps = {
  label: string;
  value: string;
  accent?: string;
};

export function StatCard({ label, value, accent = BrandColors.primary }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: Spacing.one,
    padding: Spacing.four,
  },
  value: {
    fontFamily: Fonts.headline,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  label: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    opacity: 0.72,
  },
});
