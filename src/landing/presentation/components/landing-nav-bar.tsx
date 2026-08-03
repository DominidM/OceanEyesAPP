import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

const navLinks = ['Características', 'Cómo funciona', 'Descargar'];

type LandingNavBarProps = {
  onDownloadPress?: () => void;
};

export function LandingNavBar({ onDownloadPress }: LandingNavBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Text style={styles.brand}>OceanEyes</Text>
        <View style={styles.links}>
          {navLinks.map((link) => (
            <Text key={link} style={styles.link}>
              {link}
            </Text>
          ))}
        </View>
        <Pressable style={styles.cta} onPress={onDownloadPress} hitSlop={8}>
          <Text style={styles.ctaLabel}>Descargar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: BrandColors.tertiary,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(19, 78, 94, 0.12)',
  },
  inner: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
  },
  brand: {
    color: BrandColors.primary,
    fontFamily: Fonts.headline,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.five,
  },
  link: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.72,
  },
  cta: {
    backgroundColor: BrandColors.primary,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
  },
  ctaLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
  },
});
