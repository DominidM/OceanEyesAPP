import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Fonts as TypeFonts, Spacing } from '@landing/config/theme';

type HeroSectionProps = {
  onDownloadPress?: () => void;
};

export function HeroSection({ onDownloadPress }: HeroSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>Vigilancia ciudadana del mar</Text>
      <Text style={styles.headline}>Protege el océano, reporta en segundos</Text>
      <Text style={styles.subtitle}>
        OceanEyes te permite denunciar pesca ilegal y medir la calidad del agua, ganar
        recompensas y seguir la actividad de tu comunidad costera desde tu teléfono.
      </Text>
      <View style={styles.actions}>
        <Pressable style={styles.primary} onPress={onDownloadPress} hitSlop={8}>
          <Text style={styles.primaryLabel}>Descargar la app</Text>
        </Pressable>
        <View style={styles.badges}>
          <Text style={styles.badge}>App Store</Text>
          <Text style={styles.badge}>Google Play</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    alignItems: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
    paddingTop: 88,
    paddingBottom: 96,
  },
  eyebrow: {
    color: BrandColors.secondary,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.8,
    textTransform: 'uppercase',
  },
  headline: {
    color: BrandColors.primary,
    fontFamily: TypeFonts.serif,
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 64,
    letterSpacing: -1.2,
    textAlign: 'center',
  },
  subtitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 560,
    textAlign: 'center',
    opacity: 0.72,
  },
  actions: {
    alignItems: 'center',
    gap: Spacing.four,
    marginTop: Spacing.three,
  },
  primary: {
    backgroundColor: BrandColors.primary,
    borderRadius: 999,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three + 2,
  },
  primaryLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  badge: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(19, 78, 94, 0.3)',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
