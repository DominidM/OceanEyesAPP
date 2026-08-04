import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

export function LandingFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.copy}>
        © {new Date().getFullYear()} OceanEyes. Todos los derechos reservados.
      </Text>
      <Pressable
        onPress={() => Linking.openURL('https://sg-technology.solvegrades.workers.dev/')}
      >
        <Text style={styles.builtBy}>
          Designed & Built by <Text style={styles.builtByBrand}>SOLVEGRADES</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0C1C2B',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.five,
  },
  copy: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.body,
    fontSize: 13,
    opacity: 0.72,
  },
  builtBy: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  builtByBrand: {
    color: BrandColors.secondary,
    fontWeight: '600',
  },
});
