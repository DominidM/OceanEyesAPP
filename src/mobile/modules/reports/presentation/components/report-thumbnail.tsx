import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppSymbol, type SymbolName } from '@/shared/components/app-symbol';
import { BrandColors } from '@/constants/theme';

import { SurfaceColors } from '../theme';

export function ReportThumbnail({ icon }: { icon: SymbolName }) {
  return (
    <View style={styles.thumbnail}>
      <View style={styles.thumbSea} />
      <View style={styles.thumbHorizon} />
      <View style={styles.thumbIcon}>
        <AppSymbol name={icon} color="#FFFFFF" size={28} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: SurfaceColors.border,
  },
  thumbSea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 48,
    backgroundColor: BrandColors.secondary,
  },
  thumbHorizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 36,
    backgroundColor: 'rgba(19, 78, 94, 0.25)',
  },
  thumbIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
