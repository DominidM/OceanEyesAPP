import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

export function DownloadSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Descarga OceanEyes hoy</Text>
      <Text style={styles.subtitle}>
        Disponible para iOS y Android. La app es gratuita para toda la comunidad costera.
      </Text>
      <View style={styles.badges}>
        <Text style={styles.badge}>App Store</Text>
        <Text style={styles.badge}>Google Play</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
  },
  title: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.72,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  badge: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: BrandColors.primary,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three - 4,
  },
});
