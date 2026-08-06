import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { RewardsColors } from '../theme';
import { shadow } from '@/shared/utils/shadows';

export type RewardsTab = 'recompensas' | 'recientes';

const TABS: { key: RewardsTab; label: string }[] = [
  { key: 'recompensas', label: 'Recompensas' },
  { key: 'recientes', label: 'Recientes' },
];

type SectionTabsProps = {
  active: RewardsTab;
  onChange: (tab: RewardsTab) => void;
};

export function SectionTabs({ active, onChange }: SectionTabsProps) {
  return (
    <View style={styles.tabs}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}>
            <AppText style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    height: 36,
    borderRadius: 9999,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: BrandColors.primary,
    ...shadow('subtle'),
  },
  tabInactive: {
    backgroundColor: RewardsColors.surfaceMuted,
  },
  tabText: {
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    includeFontPadding: false,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
