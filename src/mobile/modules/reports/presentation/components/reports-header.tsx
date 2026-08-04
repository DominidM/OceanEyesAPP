import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { SectionHeader } from '@/shared/components/section-header';

import { SurfaceColors } from '../theme';
import { shadow } from '@/shared/utils/shadows';

export type ReportChip = {
  label: string;
  count?: number;
  active?: boolean;
  onPress?: () => void;
};

type ReportsHeaderProps = {
  chips: ReportChip[];
};

export function ReportsHeader({ chips }: ReportsHeaderProps) {
  return (
    <SectionHeader title="Reportes">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContent}>
        {chips.map((chip) => (
          <Pressable
            key={chip.label}
            accessibilityRole="button"
            onPress={chip.onPress}
            style={[styles.chip, chip.active ? styles.chipActive : styles.chipInactive]}>
            <Text style={[styles.chipText, chip.active ? styles.chipTextActive : styles.chipTextInactive]}>
              {chip.label}
            </Text>
            {chip.count ? (
              <View style={styles.chipCount}>
                <Text style={styles.chipCountText}>{chip.count}</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </SectionHeader>
  );
}

const styles = StyleSheet.create({
  chipScroll: {
    height: 60,
  },
  chipContent: {
    paddingHorizontal: 12,
    paddingTop: 2,
    gap: 12,
  },
  chip: {
    height: 36,
    borderRadius: 9999,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chipActive: {
    paddingHorizontal: 20,
    backgroundColor: BrandColors.primary,
    ...shadow('subtle'),
  },
  chipInactive: {
    backgroundColor: SurfaceColors.pale,
  },
  chipText: {
    fontFamily: Fonts.label,
    fontSize: 14,
    lineHeight: 21,
    includeFontPadding: false,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipTextInactive: {
    color: BrandColors.neutral,
    fontWeight: '500',
  },
  chipCount: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
  },
  chipCountText: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 15,
    includeFontPadding: false,
  },
});
