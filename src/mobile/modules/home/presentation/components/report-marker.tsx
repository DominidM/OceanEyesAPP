import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CATEGORY_COLORS, STATUS_OPACITY, type MapReport } from './map-report';

type ReportMarkerProps = {
  report: MapReport;
  selected: boolean;
  onPress: () => void;
};

export function ReportMarker({ report, selected, onPress }: ReportMarkerProps) {
  const scale = useSharedValue(1);
  const ring = useSharedValue(0);
  const color = CATEGORY_COLORS[report.category] ?? '#134E5E';
  const opacity = STATUS_OPACITY[report.status] ?? 1;

  useEffect(() => {
    if (selected) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 7, stiffness: 240 }),
        withSpring(1.18, { damping: 10, stiffness: 220 }),
      );
      ring.value = withRepeat(withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) }), -1, false);
    } else {
      cancelAnimation(ring);
      cancelAnimation(scale);
      ring.value = 0;
      scale.value = withSpring(1, { damping: 12, stiffness: 220 });
    }
  }, [selected, scale, ring]);

  const pinScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ring.value, [0, 1], [0.7, 2.2]) }],
    opacity: interpolate(ring.value, [0, 1], [0.6, 0]),
  }));

  return (
    <Marker
      coordinate={{ latitude: report.latitude, longitude: report.longitude }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={selected}
      onPress={onPress}>
      <View style={styles.wrapper}>
        <Animated.View style={[styles.ring, { borderColor: color }, ringStyle]} />
        <Animated.View style={[{ opacity }, pinScaleStyle, styles.pinGroup]}>
          <View style={[styles.tip, { backgroundColor: color }]} />
          <View style={[styles.head, { backgroundColor: color }]}>
            <View style={styles.headInner} />
          </View>
        </Animated.View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 30,
    height: 36,
  },
  pinGroup: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  head: {
    position: 'absolute',
    top: 2,
    left: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  headInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  tip: {
    position: 'absolute',
    top: 16,
    left: 9,
    width: 12,
    height: 12,
    transform: [{ rotate: '45deg' }],
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 3,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
  },
});
