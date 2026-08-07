import React, { useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts, Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { LANDING_NAV_LINKS, type LandingNavPressKey } from '@landing/config/landing-nav';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

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
  const { isMobile } = useBreakpoints();
  const [menuOpen, setMenuOpen] = useState(false);

  const actions: Record<LandingNavPressKey, () => void> = {
    onHowItWorksPress,
    onHelpPress,
    onReportesPress,
  };

  const isTransparent = !scrolled;

  const handlePress = (link: (typeof LANDING_NAV_LINKS)[number]) => {
    setMenuOpen(false);
    if (link.href) {
      router.push(link.href);
    } else if (link.onPressKey) {
      actions[link.onPressKey]();
    }
  };

  return (
    <View style={[styles.bar, (isTransparent && !menuOpen) && styles.barTransparent]}>
      <View style={[styles.inner, isMobile && styles.innerMobile]}>
        <View style={styles.brandGroup}>
          <Image source={logoImg} style={styles.logo} contentFit="contain" />
          <Text style={[styles.brand, isTransparent && styles.brandLight]}>Ocean Eyes</Text>
        </View>

        {isMobile ? (
          <Pressable
            style={[styles.menuBtn, isTransparent && !menuOpen && styles.menuBtnTransparent]}
            onPress={() => setMenuOpen((open) => !open)}
            hitSlop={8}
          >
            <FontAwesome5
              name={menuOpen ? 'times' : 'bars'}
              size={18}
              color="rgba(255,255,255,0.9)"
            />
          </Pressable>
        ) : (
          <View style={styles.rightGroup}>
            <View style={styles.links}>
              {LANDING_NAV_LINKS.map((link) => (
                <Pressable key={link.label} onPress={() => handlePress(link)} hitSlop={8}>
                  <Text style={[styles.link, isTransparent && styles.linkLight]}>{link.label}</Text>
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
                  color="rgba(255,255,255,0.85)"
                />
                <Text style={[styles.adminLabel, isTransparent && styles.adminLabelLight]}>
                  Admin
                </Text>
              </Pressable>
              <Pressable
                style={[styles.cta, isTransparent && styles.ctaTransparent]}
                onPress={() => router.push('/descargas')}
                hitSlop={8}
              >
                <FontAwesome5 name="download" size={13} color={BrandColors.primary} />
                <Text style={[styles.ctaLabel, isTransparent && styles.ctaLabelLight]}>
                  Descargar
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {isMobile && menuOpen && (
        <View style={styles.dropdown}>
          {LANDING_NAV_LINKS.map((link) => (
            <Pressable key={link.label} onPress={() => handlePress(link)} hitSlop={4}>
              <Text style={styles.dropdownLink}>{link.label}</Text>
            </Pressable>
          ))}
          <View style={styles.dropdownDivider} />
          <Pressable
            style={styles.dropdownAdmin}
            onPress={() => {
              setMenuOpen(false);
              router.push('/admin/login');
            }}
            hitSlop={4}
          >
            <FontAwesome5 name="shield-alt" size={13} color={BrandColors.primary} />
            <Text style={styles.dropdownAdminLabel}>Admin</Text>
          </Pressable>
          <Pressable
            style={styles.dropdownCta}
            onPress={() => {
              setMenuOpen(false);
              router.push('/descargas');
            }}
            hitSlop={4}
          >
            <FontAwesome5 name="download" size={14} color="#FFFFFF" />
            <Text style={styles.dropdownCtaLabel}>Descargar</Text>
          </Pressable>
        </View>
      )}
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
  innerMobile: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
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
    fontFamily: AppFonts.body,
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
    fontFamily: AppFonts.label,
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
    fontFamily: AppFonts.label,
    fontSize: 14,
    fontWeight: '700',
    transitionProperty: 'color',
    transitionDuration: '300ms',
  },
  ctaLabelLight: {
    color: BrandColors.primary,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menuBtnTransparent: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(19, 78, 94, 0.12)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    gap: Spacing.two + 2,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  dropdownLink: {
    color: '#2C2C2C',
    fontFamily: AppFonts.body,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: Spacing.two + 2,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: 'rgba(19, 78, 94, 0.12)',
    marginVertical: Spacing.two,
  },
  dropdownAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderColor: 'rgba(19, 78, 94, 0.25)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  dropdownAdminLabel: {
    color: BrandColors.primary,
    fontFamily: AppFonts.label,
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BrandColors.primary,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  dropdownCtaLabel: {
    color: '#FFFFFF',
    fontFamily: AppFonts.label,
    fontSize: 14,
    fontWeight: '700',
  },
});
