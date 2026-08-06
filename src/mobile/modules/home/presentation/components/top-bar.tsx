import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { useConnectivity } from '@/shared/offline/connectivity-context';
import { useSync } from '@/shared/offline/sync-context';

export function TopBar({ onPendingPress }: { onPendingPress?: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.topBar,
        {
          paddingTop: insets.top,
          height: 62 + insets.top,
        },
      ]}
    >
      <View style={styles.brandGroup}>
        <View style={styles.logoMark}>
          <AppSymbol
            name={{ ios: 'water.waves', android: 'waves', web: 'waves' }}
            color={BrandColors.primary}
            size={24}
          />
        </View>
        <AppText style={styles.brandName}>Ocean Eyes</AppText>
      </View>

      <View style={styles.headerActions}>
        <StatusPill />
        <PendingBadge onPress={onPendingPress} />
      </View>
    </View>
  );
}

function StatusPill() {
  const { online } = useConnectivity();
  return (
    <View style={styles.statusRow}>
      <View style={[styles.onlineDot, !online && styles.offlineDot]} />
      <AppText style={[styles.onlineText, !online && styles.offlineText]}>
        {online ? 'Online' : 'Offline'}
      </AppText>
    </View>
  );
}

function PendingBadge({ onPress }: { onPress?: () => void }) {
  const { pendingCount } = useSync();
  if (pendingCount === 0) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${pendingCount} reporte${pendingCount === 1 ? '' : 's'} pendiente${pendingCount === 1 ? '' : 's'}`}
      onPress={onPress}
      style={({ pressed }) => [styles.pendingBadge, pressed && styles.pendingBadgePressed]}>
      <AppSymbol
        name={{ ios: 'icloud.slash.fill', android: 'cloud-off', web: 'cloud-off' }}
        color={BrandColors.primary}
        size={14}
      />
      <AppText style={styles.pendingText} numberOfLines={1} ellipsizeMode="tail">
        {pendingCount} reporte{pendingCount === 1 ? '' : 's'} pendiente{pendingCount === 1 ? '' : 's'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D9CFC5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 235, 227, 0.95)',
    zIndex: 2,
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
    includeFontPadding: false,
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
  offlineDot: {
    backgroundColor: '#B42318',
  },
  onlineText: {
    color: '#2E7D32',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  offlineText: {
    color: '#B42318',
  },
  pendingBadge: {
    height: 32,
    borderRadius: 9999,
    backgroundColor: 'rgba(19, 78, 94, 0.12)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    maxWidth: 220,
    flexShrink: 1,
  },
  pendingBadgePressed: {
    opacity: 0.7,
  },
  pendingText: {
    flexShrink: 1,
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 15,
    letterSpacing: -0.25,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
});
