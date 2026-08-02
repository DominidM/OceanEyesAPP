import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

export function TopBar() {
  return (
    <View style={styles.topBar}>
      <View style={styles.brandGroup}>
        <View style={styles.logoMark}>
          <AppSymbol
            name={{ ios: 'water.waves', android: 'waves', web: 'waves' }}
            color={BrandColors.primary}
            size={24}
          />
        </View>
        <Text style={styles.brandName}>Ocean Eyes</Text>
      </View>

      <View style={styles.headerActions}>
        <StatusPill />
        <PendingBadge />
      </View>
    </View>
  );
}

function StatusPill() {
  return (
    <View style={styles.statusRow}>
      <View style={styles.onlineDot} />
      <Text style={styles.onlineText}>Online</Text>
    </View>
  );
}

function PendingBadge() {
  return (
    <View style={styles.pendingBadge}>
      <Text style={styles.pendingText}>2 reportes pendientes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 70,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.tertiary,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 0,
  },
  logoMark: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    width: 64,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
  },
  onlineText: {
    color: '#2E7D32',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  pendingBadge: {
    height: 38,
    borderRadius: 9999,
    backgroundColor: 'rgba(19, 78, 94, 0.12)',
    paddingLeft: 12,
    paddingRight: 32,
    paddingVertical: 4,
    justifyContent: 'center',
    flexShrink: 1,
  },
  pendingText: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 15,
    letterSpacing: -0.25,
    textTransform: 'uppercase',
  },
});
