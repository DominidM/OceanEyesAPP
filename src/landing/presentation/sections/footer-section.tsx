import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

export function FooterSection() {
  return (
    <View style={styles.footer}>
      <Text style={styles.brand}>OceanEyes</Text>
      <Text style={styles.copy}>© {new Date().getFullYear()} OceanEyes. Todos los derechos reservados.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  brand: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.headline,
    fontSize: 16,
    fontWeight: '700',
  },
  copy: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.body,
    fontSize: 13,
    opacity: 0.72,
  },
});
