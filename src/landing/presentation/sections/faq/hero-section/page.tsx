import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const heroBg = require('../../../../../../assets/images/IMAGEN-BAJO-MAR.jpg');

export function FAQHero() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={[styles.hero, isMobile && styles.heroMobile]}>
      <View style={styles.heroBg}>
        <Image source={heroBg} style={styles.heroImage} contentFit="cover" />
        <View style={styles.heroOverlay} />
      </View>
      <View style={[styles.heroContent, isMobile && styles.heroContentMobile]}>
        <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
          Preguntas Frecuentes
        </Text>
        <Text style={styles.heroSubtitle}>Todo lo que necesitás saber sobre Ocean Eyes.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'relative',
    minHeight: 360,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroMobile: {
    minHeight: 280,
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
    maxWidth: 800,
  },
  heroContentMobile: {
    paddingHorizontal: Spacing.three,
  },
  heroTitle: {
    fontFamily: Fonts.headline,
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroTitleMobile: {
    fontSize: 32,
  },
  heroSubtitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: BrandColors.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});
