import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Image } from 'expo-image';

import { AppFonts as Fonts, BrandColors } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const logoImg = 'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786166247/logotipo_aasun4.png';

const STATUS_MESSAGES = [
  'Estableciendo conexión segura...',
  'Calibrando sensores...',
  'Accediendo a datos institucionales...',
  'Listo.',
];

const MSG_INTERVAL = 1300;
const MSG_FADE = 260;
const EXIT_DURATION = 600;
const EMERGE_DURATION = 1300;

export type LandingSplashProps = {
  duration?: number;
  onFinish: () => void;
};

export function LandingSplash({ duration = STATUS_MESSAGES.length * MSG_INTERVAL, onFinish }: LandingSplashProps) {
  const { isMobile } = useBreakpoints();
  const emerge = useRef(new Animated.Value(0)).current;
  const exitProgress = useRef(new Animated.Value(0)).current;
  const statusFade = useRef(new Animated.Value(1)).current;
  const waveA = useRef(new Animated.Value(0)).current;
  const waveB = useRef(new Animated.Value(0)).current;
  const pulseRings = useRef(Array.from({ length: 3 }, () => new Animated.Value(0))).current;

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const emergeAnim = Animated.timing(emerge, {
      toValue: 1,
      duration: EMERGE_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    emergeAnim.start();

    const waveAAnim = Animated.loop(
      Animated.timing(waveA, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    const waveBAnim = Animated.loop(
      Animated.timing(waveB, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    waveAAnim.start();
    waveBAnim.start();

    const ringAnims = pulseRings.map((ring) =>
      Animated.loop(
        Animated.timing(ring, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ),
    );
    const ringsComposed = Animated.stagger(1000, ringAnims);
    ringsComposed.start();

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        const next = prev + 1;
        return Math.min(next, STATUS_MESSAGES.length - 1);
      });
    }, MSG_INTERVAL);

    const exitTimeout = setTimeout(() => {
      clearInterval(messageInterval);
      Animated.timing(exitProgress, {
        toValue: 1,
        duration: EXIT_DURATION,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start(onFinish);
    }, duration);

    return () => {
      emergeAnim.stop();
      waveAAnim.stop();
      waveBAnim.stop();
      ringsComposed.stop();
      clearInterval(messageInterval);
      clearTimeout(exitTimeout);
    };
  }, [duration, emerge, exitProgress, onFinish, pulseRings, waveA, waveB]);

  useEffect(() => {
    if (messageIndex === 0) return;
    statusFade.setValue(0);
    Animated.timing(statusFade, {
      toValue: 1,
      duration: MSG_FADE,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [messageIndex, statusFade]);

  const containerOpacity = exitProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const containerTranslateY = exitProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -24],
  });

  const contentOpacity = emerge.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const contentTranslateY = emerge.interpolate({
    inputRange: [0, 1],
    outputRange: [44, 0],
  });

  const waveATranslate = waveA.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '-50%'],
  });

  const waveBTranslate = waveB.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '-50%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: containerOpacity, transform: [{ translateY: containerTranslateY }] },
      ]}
    >
      <LinearGradient colors={['#134E5E', '#0C1C2B']} style={styles.background} />

      <View style={styles.waves} pointerEvents="none">
        <Animated.View style={[styles.waveLayer, styles.waveLayerBack, { transform: [{ translateX: waveATranslate }] }]}>
          <Svg width="200%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <Path
              d="M0,100 C150,200 350,0 500,100 C650,200 850,0 1000,100 L1000,200 L0,200 Z"
              fill="#FFFFFF"
            />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.waveLayer, styles.waveLayerFront, { transform: [{ translateX: waveBTranslate }] }]}>
          <Svg width="200%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <Path
              d="M0,50 C200,150 300,-50 500,50 C700,150 800,-50 1000,50 L1000,200 L0,200 Z"
              fill="#FFFFFF"
            />
          </Svg>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.content,
          { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
        ]}
      >
        <View style={styles.pulseContainer}>
          {pulseRings.map((ring, index) => (
            <Animated.View
              key={index}
              style={[
                styles.pulseRing,
                {
                  opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                  transform: [
                    {
                      scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.8, 2.5] }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.logoContent}>
          <View style={[styles.logoBadge, isMobile && styles.logoBadgeMobile]}>
            <Image source={logoImg} style={[styles.logo, isMobile && styles.logoMobile]} contentFit="contain" />
          </View>
          <Text style={[styles.title, isMobile && styles.titleMobile]}>Ocean Eyes</Text>
          <Text style={styles.subtitle}>Vigilancia Marina</Text>
        </View>

        <Animated.Text style={[styles.status, isMobile && styles.statusMobile, { opacity: statusFade }]}>
          {STATUS_MESSAGES[messageIndex]}
        </Animated.Text>
      </Animated.View>

      <Text style={styles.footer}>© Ocean Eyes · Vigilancia Marina</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9990,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  waves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    opacity: 0.15,
  },
  waveLayer: {
    position: 'absolute',
    left: 0,
    width: '200%',
    height: '100%',
  },
  waveLayerBack: {
    bottom: 0,
  },
  waveLayerFront: {
    bottom: '10%',
    opacity: 0.5,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 120,
    height: 120,
    transform: [{ translateX: -60 }, { translateY: -60 }],
    zIndex: 0,
  },
  pulseRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: BrandColors.secondary,
  },
  logoContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249,249,250,0.95)',
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 8,
  },
  logoBadgeMobile: {
    width: 80,
    height: 80,
    borderRadius: 14,
    marginBottom: 16,
  },
  logo: {
    width: 72,
    height: 72,
  },
  logoMobile: {
    width: 60,
    height: 60,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  titleMobile: {
    fontSize: 30,
  },
  subtitle: {
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.secondary,
    letterSpacing: 4,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  status: {
    marginTop: 64,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '500',
    color: '#98B9B1',
    opacity: 0.7,
  },
  statusMobile: {
    marginTop: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});