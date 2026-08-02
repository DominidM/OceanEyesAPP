import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppSymbol } from '@/shared/components/app-symbol';
import { BrandColors } from '@/constants/theme';

import { SurfaceColors } from '../theme';

export type ThumbnailType = 'net' | 'boat' | 'pending';

export function ReportThumbnail({ type }: { type: ThumbnailType }) {
  return (
    <View style={styles.thumbnail}>
      <View style={styles.thumbSea} />
      <View style={styles.thumbHorizon} />
      {type === 'net' ? (
        <>
          <View style={[styles.netLine, styles.netLineOne]} />
          <View style={[styles.netLine, styles.netLineTwo]} />
          <View style={[styles.netLine, styles.netLineThree]} />
        </>
      ) : null}
      {type === 'boat' ? (
        <>
          <View style={styles.boatHull} />
          <View style={styles.boatCabin} />
        </>
      ) : null}
      {type === 'pending' ? (
        <View style={styles.pendingOverlay}>
          <AppSymbol
            name={{ ios: 'icloud.slash.fill', android: 'cloud_off', web: 'cloud_off' }}
            color="#FFFFFF"
            size={24}
          />
        </View>
      ) : null}
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
  netLine: {
    position: 'absolute',
    left: 13,
    right: 13,
    height: 2,
    borderRadius: 1,
    backgroundColor: BrandColors.primary,
  },
  netLineOne: {
    top: 34,
    transform: [{ rotate: '22deg' }],
  },
  netLineTwo: {
    top: 44,
    transform: [{ rotate: '-18deg' }],
  },
  netLineThree: {
    top: 54,
    transform: [{ rotate: '14deg' }],
  },
  boatHull: {
    position: 'absolute',
    left: 16,
    bottom: 24,
    width: 48,
    height: 13,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: BrandColors.primary,
  },
  boatCabin: {
    position: 'absolute',
    left: 31,
    bottom: 37,
    width: 20,
    height: 14,
    borderRadius: 3,
    backgroundColor: BrandColors.tertiary,
  },
  pendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.24)',
  },
});
