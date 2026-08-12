import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

const SPLASH_DURATION = 2300;
const ACCENT = '#13B6EC';

function OceanEye() {
  return (
    <View style={styles.logoShell}>
      <View style={styles.logoGlass}>
        <Svg width={84} height={84} viewBox="0 0 84 84" accessibilityLabel="Ocean Eyes">
          <Path
            d="M8 38C17 24 28 17 42 17s25 7 34 21c-9 14-20 21-34 21S17 52 8 38Z"
            fill="none"
            stroke={ACCENT}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          <Path d="M42 27a11 11 0 1 0 0 22 11 11 0 0 0 0-22Z" fill={ACCENT} />
          <Path
            d="M14 58c7-6 14-6 21 0s14 6 21 0 14-6 21 0M18 68c6-5 12-5 18 0s12 5 18 0 12-5 18 0"
            fill="none"
            stroke={ACCENT}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </Svg>
      </View>
    </View>
  );
}

function BottomWave() {
  return (
    <Svg style={styles.bottomWave} width="100%" height={150} viewBox="0 0 430 150" preserveAspectRatio="none">
      <Path
        d="M0 66C58 48 93 42 143 55c52 14 82 29 137 5 59-25 95-12 150 4v86H0Z"
        fill={ACCENT}
        opacity={0.16}
      />
      <Path
        d="M0 98c65-23 113-19 169 1 54 19 97 17 143-2 45-18 78-13 118-2v55H0Z"
        fill="#BDEFFC"
        opacity={0.08}
      />
    </Svg>
  );
}

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const started = useRef(false);
  const content = useSharedValue(0);
  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);
  const overlay = useSharedValue(1);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: content.value,
    transform: [
      { translateY: 14 * (1 - content.value) },
      { scale: 0.9 + content.value * 0.1 },
    ],
  }));
  const progressStyle = useAnimatedStyle(() => ({
    width: 192 * progress.value,
  }));
  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));

  const startAnimation = useCallback(() => {
    if (started.current) return;
    started.current = true;

    content.value = withTiming(1, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
    rotation.value = withRepeat(
      withTiming(1, {
        duration: 850,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.System,
      }),
      -1,
    );
    progress.value = withDelay(
      250,
      withTiming(1, {
        duration: 1450,
        easing: Easing.inOut(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );
    overlay.value = withDelay(
      SPLASH_DURATION - 420,
      withTiming(
        0,
        {
          duration: 420,
          easing: Easing.inOut(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        },
        (finished) => {
          'worklet';
          if (finished) scheduleOnRN(setVisible, false);
        },
      ),
    );
  }, [content, overlay, progress, rotation]);

  const handleLayout = useCallback(() => {
    SplashScreen.hideAsync().finally(startAnimation);
  }, [startAnimation]);

  if (!visible) return null;

  return (
    <Animated.View onLayout={handleLayout} pointerEvents="none" style={[styles.overlay, overlayStyle]}>
      <StatusBar style="light" />
      <LinearGradient colors={['#092E42', '#0D4960', '#1E7087']} style={StyleSheet.absoluteFill} />
      <View style={styles.glowTop} />
      <BottomWave />

      <Animated.View style={[styles.brand, contentStyle]}>
        <OceanEye />
        <Text style={styles.title}>OCEAN EYES</Text>
        <Text style={styles.subtitle}>Protegiendo nuestros océanos</Text>
      </Animated.View>

      <View style={styles.loadingArea}>
        <Animated.View style={[styles.spinner, spinnerStyle]} />
        <Text style={styles.loadingText}>CARGANDO</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 1000,
  },
  glowTop: {
    position: 'absolute',
    top: '13%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(19,182,236,0.07)',
  },
  brand: {
    alignItems: 'center',
    marginTop: -72,
  },
  logoShell: {
    width: 144,
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 72,
    backgroundColor: 'rgba(19,182,236,0.10)',
    shadowColor: ACCENT,
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  logoGlass: {
    width: 116,
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 58,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    marginTop: 27,
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 4.5,
  },
  subtitle: {
    marginTop: 7,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  loadingArea: {
    position: 'absolute',
    bottom: 58,
    alignItems: 'center',
    zIndex: 2,
  },
  spinner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: 'rgba(19,182,236,0.22)',
    borderTopColor: ACCENT,
  },
  loadingText: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  progressTrack: {
    width: 192,
    height: 4,
    marginTop: 22,
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: ACCENT,
  },
  bottomWave: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
  },
});
