import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

import { RealTimeMap, type MapReport } from './real-time-map';

type MapPreviewProps = {
  reports: MapReport[];
  onExpand?: () => void;
};

export function MapPreview({ reports, onExpand }: MapPreviewProps) {
  return (
    <View style={styles.mapCard}>
      <RealTimeMap reports={reports} />

      <View style={styles.mapOverlay}>
        <Pressable
          accessibilityRole="button"
          onPress={onExpand}
          style={({ pressed }) => [styles.mapButton, pressed && styles.pressed]}>
          <AppSymbol name={{ ios: 'map.fill', android: 'map', web: 'map' }} color={BrandColors.primary} size={20} />
          <Text style={styles.mapButtonText}>Ver Mapa en Tiempo Real</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    height: 160,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    position: 'relative',
    marginTop: 26,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  mapButton: {
    width: 227,
    maxWidth: '100%',
    height: 36,
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  mapButtonText: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
