import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

import { SurfaceColors } from '../theme';

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
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <AppSymbol
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            color={BrandColors.neutral}
            size={22}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Reportes</Text>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 133,
    borderBottomWidth: 1,
    borderBottomColor: SurfaceColors.border,
    backgroundColor: 'rgba(239, 235, 227, 0.95)',
    zIndex: 2,
  },
  headerTop: {
    height: 72,
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    paddingRight: 48,
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  chipScroll: {
    height: 60,
  },
  chipContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  chipInactive: {
    backgroundColor: SurfaceColors.pale,
  },
  chipText: {
    fontFamily: Fonts.label,
    fontSize: 14,
    lineHeight: 21,
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
  },
});
