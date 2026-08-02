import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBxf9pePOXQW2CcWUkuoQVvDHA3Fn6u1vA3os0gRCH9EJS9iJ2-3uZpo0-E3-nzcUGax74Rr3nF_xx2K2pD6SsdlL7UrL_7cQjQV99U0tTa97KdVujdzGSQ1thE7vIVjt_zxy8BNd74WVy-YWALUCx_0HgElexxPNhUZB5ZrPB-8ZjpjpuS2vu8TpNNHypdKd7hH-2KqFK-d31CaglzyUeqEMaUZL1v7Dw4c-cUtShB0HznECr0YvQ4l6nQI47AdLYklRdqrO2Eo-g';

export type MapPin = {
  left: number;
  top: number;
};

export function MapPreview({ pins }: { pins: MapPin[] }) {
  return (
    <View style={styles.mapCard}>
      <Image source={{ uri: MAP_IMAGE }} contentFit="cover" style={styles.mapImage} />
      <View style={styles.mapFallback}>
        <View style={[styles.mapBand, styles.mapBandOne]} />
        <View style={[styles.mapBand, styles.mapBandTwo]} />
        <View style={[styles.mapBand, styles.mapBandThree]} />
        <View style={styles.coastLine} />
        <View style={styles.gridLineVertical} />
        <View style={styles.gridLineHorizontal} />

        {pins.map((pin) => (
          <View key={`${pin.left}-${pin.top}`} style={[styles.mapPin, pin]} />
        ))}
      </View>

      <View style={styles.mapOverlay}>
        <Pressable
          accessibilityRole="button"
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
    height: 128,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    position: 'relative',
    marginTop: 36,
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  mapFallback: {
    ...StyleSheet.absoluteFillObject,
  },
  mapBand: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
  },
  mapBandOne: {
    left: -84,
    top: -78,
    backgroundColor: 'rgba(19, 78, 94, 0.18)',
  },
  mapBandTwo: {
    right: -96,
    top: -42,
    backgroundColor: 'rgba(152, 185, 177, 0.68)',
  },
  mapBandThree: {
    left: 96,
    bottom: -158,
    backgroundColor: 'rgba(239, 235, 227, 0.9)',
  },
  coastLine: {
    position: 'absolute',
    left: '41%',
    top: -18,
    width: 42,
    height: 184,
    borderRadius: 21,
    backgroundColor: 'rgba(239, 235, 227, 0.82)',
    transform: [{ rotate: '14deg' }],
  },
  gridLineVertical: {
    position: 'absolute',
    left: '64%',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(19, 78, 94, 0.22)',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '51%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(19, 78, 94, 0.2)',
  },
  mapPin: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BrandColors.primary,
    borderWidth: 2,
    borderColor: BrandColors.tertiary,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
