import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { useSync } from '@/shared/offline/sync-context';

import { SurfaceColors } from '../theme';
import { shadow } from '@/shared/utils/shadows';

export function SyncWarning({ onSync }: { onSync?: () => void }) {
  const { pendingCount, syncing, lastError } = useSync();

  if (pendingCount === 0 && !syncing) return null;

  const countLabel = `${pendingCount} reporte${pendingCount === 1 ? '' : 's'}`;

  return (
    <View style={styles.syncPanel}>
      <View style={styles.syncInfo}>
        <View style={styles.syncIconWrap}>
          <AppSymbol
            name={{
              ios: syncing ? 'arrow.triangle.2.circlepath' : 'wifi.exclamationmark',
              android: syncing ? 'sync' : 'wifi-off',
              web: syncing ? 'sync' : 'wifi-off',
            }}
            color={BrandColors.primary}
            size={24}
          />
        </View>
        <View style={styles.syncCopy}>
          <AppText style={styles.syncTitle}>
            {syncing ? 'Sincronizando reportes...' : `${countLabel} sin sincronizar`}
          </AppText>
          <AppText style={styles.syncDescription}>
            {lastError ??
              (pendingCount > 0
                ? `${pendingCount === 1 ? 'Espera' : 'Esperan'} conexión para enviarse`
                : '')}
          </AppText>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: syncing }}
        disabled={syncing}
        onPress={onSync}
        style={({ pressed }) => [styles.syncButton, pressed && styles.pressed]}>
        <AppSymbol
          name={{ ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }}
          color="#FFFFFF"
          size={13}
        />
        <AppText style={styles.syncButtonText}>{syncing ? 'Sincronizando...' : 'Sincronizar ahora'}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  syncPanel: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    padding: 20,
    gap: 16,
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(19, 78, 94, 0.3)',
    backgroundColor: 'rgba(19, 78, 94, 0.08)',
    ...shadow('subtle'),
  },
  syncInfo: {
    width: '100%',
    height: 45,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  syncIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SurfaceColors.paleStrong,
  },
  syncCopy: {
    flex: 1,
    gap: 4,
  },
  syncTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    includeFontPadding: false,
  },
  syncDescription: {
    color: SurfaceColors.mutedText,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    includeFontPadding: false,
  },
  syncButton: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: BrandColors.primary,
    ...shadow('medium'),
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
