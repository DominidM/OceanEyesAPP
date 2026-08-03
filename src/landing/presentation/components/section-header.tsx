import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>OceanEyes</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  eyebrow: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  title: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 42,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  subtitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 560,
    textAlign: 'center',
    opacity: 0.72,
  },
});
