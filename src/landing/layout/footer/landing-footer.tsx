import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

export function LandingFooter() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={[styles.footer, isMobile && styles.footerMobile]}>
      <Text style={[styles.copy, isMobile && styles.copyMobile]}>
        © {new Date().getFullYear()} OceanEyes. Todos los derechos reservados.
      </Text>
      <Pressable
        onPress={() => Linking.openURL('https://solvegrades.com/')}
      >
        <Text style={[styles.builtBy, isMobile && styles.builtByMobile]}>
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
  footerMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  copy: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.body,
    fontSize: 13,
    opacity: 0.72,
  },
  copyMobile: {
    textAlign: 'center',
  },
  builtBy: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  builtByMobile: {
    textAlign: 'center',
  },
  builtByBrand: {
    color: BrandColors.secondary,
    fontWeight: '600',
  },
});
