import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { LANDING_NAV_LINKS, type LandingNavPressKey } from '@landing/config/landing-nav';

const logoImg = require('../../../../assets/images/logo-ocean-eyes-grande.png');

export type LandingHeaderProps = {
  scrolled: boolean;
  onHowItWorksPress: () => void;
  onHelpPress: () => void;
  onReportesPress: () => void;
};

export function LandingHeader({
  onHowItWorksPress,
  onHelpPress,
  onReportesPress,
  scrolled,
}: LandingHeaderProps) {
  const actions: Record<LandingNavPressKey, () => void> = {
    onHowItWorksPress,
    onHelpPress,
    onReportesPress,
  };

  const isTransparent = !scrolled;

  const handlePress = (link: typeof LANDING_NAV_LINKS[number]) => {
    if (link.href) {
      router.push(link.href);
    } else if (link.onPressKey) {
      actions[link.onPressKey]();
    }
  };

  return (
    <View style={[styles.bar, isTransparent && styles.barTransparent]}>
      <View style={styles.inner}>
        <View style={styles.brandGroup}>
          <Image source={logoImg} style={styles.logo} contentFit="contain" />
          <Text style={[styles.brand, isTransparent && styles.brandLight]}>Ocean Eyes</Text>
        </View>
        <View style={styles.rightGroup}>
          <View style={styles.links}>
            {LANDING_NAV_LINKS.map((link) => (
              <Pressable key={link.label} onPress={() => handlePress(link)} hitSlop={8}>
                <Text style={[styles.link, isTransparent && styles.linkLight]}>
                  {link.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.buttonGroup}>
            <Pressable
              style={[styles.adminLink, isTransparent && styles.adminLinkTransparent]}
              onPress={() => router.push('/admin/login')}
              hitSlop={8}
            >
              <FontAwesome5
                name="shield-alt"
                size={12}
                color={isTransparent ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.85)'}
              />
              <Text style={[styles.adminLabel, isTransparent && styles.adminLabelLight]}>Admin</Text>
            </Pressable>
            <Pressable
              style={[styles.cta, isTransparent && styles.ctaTransparent]}
              onPress={() => router.push('/descargas')}
              hitSlop={8}
            >
              <FontAwesome5
                name="download"
                size={13}
                color={isTransparent ? BrandColors.primary : BrandColors.primary}
              />
              <Text style={[styles.ctaLabel, isTransparent && styles.ctaLabelLight]}>Descargar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: BrandColors.neutral,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(19, 78, 94, 0.12)',
    transitionProperty: 'background-color, border-color',
    transitionDuration: '300ms',
  },
  barTransparent: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  inner: {
    width: '100%',
    maxWidth: 1600,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginLeft: Spacing.four,
  },
  logo: {
    width: 52,
    height: 52,
    transform: [{ scale: 1.5 }, { translateY: 2 }],
  },
  brand: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  brandLight: {
    color: '#FFFFFF',
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.five,
  },
  link: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: '500',
    opacity: 1,
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  linkLight: {
    color: 'rgba(255,255,255,0.85)',
    opacity: 1,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.tertiary,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
    transitionProperty: 'background-color',
    transitionDuration: '300ms',
  },
  ctaTransparent: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    transitionProperty: 'border-color',
    transitionDuration: '300ms',
  },
  adminLinkTransparent: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  adminLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  adminLabelLight: {
    color: 'rgba(255,255,255,0.85)',
  },
  ctaLabel: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  ctaLabelLight: {
    color: BrandColors.primary,
  },
});
