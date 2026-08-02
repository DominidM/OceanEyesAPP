import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

import { SurfaceColors } from '../theme';

export function SyncWarning({ onSync }: { onSync?: () => void }) {
  return (
    <View style={styles.syncPanel}>
      <View style={styles.syncInfo}>
        <View style={styles.syncIconWrap}>
          <AppSymbol
            name={{ ios: 'wifi.exclamationmark', android: 'wifi_off', web: 'wifi_off' }}
            color={BrandColors.primary}
            size={24}
          />
        </View>
        <View style={styles.syncCopy}>
          <Text style={styles.syncTitle}>Reportes sin sincronizar</Text>
          <Text style={styles.syncDescription}>2 reportes esperan conexion</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onSync}
        style={({ pressed }) => [styles.syncButton, pressed && styles.pressed]}>
        <AppSymbol
          name={{ ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }}
          color="#FFFFFF"
          size={13}
        />
        <Text style={styles.syncButtonText}>Sincronizar ahora</Text>
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  },
  syncDescription: {
    color: SurfaceColors.mutedText,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
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
    backgroundColor: BrandColors.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
