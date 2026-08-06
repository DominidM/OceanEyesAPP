import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

export function HistoryHeader({ onSeeAll }: { onSeeAll?: () => void }) {
  return (
    <View style={styles.historyHeader}>
      <AppText style={styles.historyTitle}>Historial</AppText>
      <Pressable accessibilityRole="button" onPress={onSeeAll}>
        <AppText style={styles.seeAllText}>Ver todos</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  historyHeader: {
    width: '100%',
    height: 55,
    paddingTop: 24,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.45,
  },
  seeAllText: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
