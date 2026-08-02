import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

export function HistoryHeader({ onSeeAll }: { onSeeAll?: () => void }) {
  return (
    <View style={styles.historyHeader}>
      <Text style={styles.historyTitle}>Historial</Text>
      <Pressable accessibilityRole="button" onPress={onSeeAll}>
        <Text style={styles.seeAllText}>Ver todos</Text>
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
    fontSize: 18,
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
