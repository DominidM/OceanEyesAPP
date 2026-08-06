import React from 'react';
import {StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

import type { ActivityItem } from '../data/rewards';
import { RewardsColors } from '../theme';

export function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <AppSymbol name={item.icon} color={BrandColors.primary} size={16} />
      </View>
      <View style={styles.rowTextWrap}>
        <AppText style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </AppText>
        <AppText style={styles.rowDate}>{item.date}</AppText>
      </View>
      <AppText style={[styles.rowDelta, item.positive ? styles.rowDeltaPos : styles.rowDeltaNeg]}>
        {item.delta}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 78, 94, 0.1)',
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    color: RewardsColors.textBottom,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
  },
  rowDate: {
    marginTop: 1,
    color: RewardsColors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    includeFontPadding: false,
  },
  rowDelta: {
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    includeFontPadding: false,
  },
  rowDeltaPos: {
    color: '#047857',
  },
  rowDeltaNeg: {
    color: '#B91C1C',
  },
});
