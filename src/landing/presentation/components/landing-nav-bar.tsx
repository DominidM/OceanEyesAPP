import React from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { LANDING_NAV_LINKS, type LandingNavPressKey } from '@landing/config/landing-nav';

export type LandingNavBarProps = Record<LandingNavPressKey, () => void>;

export function LandingNavBar({
  onFeaturesPress,
  onHowItWorksPress,
  onDownloadPress,
}: LandingNavBarProps) {
  const actions: Record<LandingNavPressKey, () => void> = {
    onFeaturesPress,
    onHowItWorksPress,
    onDownloadPress,
  };

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Text style={styles.brand}>OceanEyes</Text>
        <View style={styles.links}>
          {LANDING_NAV_LINKS.map((link) => (
            <Pressable key={link.label} onPress={actions[link.onPressKey]} hitSlop={8}>
              <Text style={styles.link}>{link.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.adminLink} onPress={() => router.push('/admin/login')} hitSlop={8}>
          <Text style={styles.adminLabel}>Admin</Text>
        </Pressable>
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
  adminLink: {
    borderColor: BrandColors.primary,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  adminLabel: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
  },
  ctaLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
  },
});
