import React, { useEffect, useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts, Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { LANDING_NAV_LINKS } from '@landing/config/landing-nav';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const logoImg =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/f_auto,q_auto,w_200/v1786169052/logotipo_q2mkhv.png';

const MENU_ID = 'landing-mobile-menu';
const MENU_CLOSE_DELAY = 240;

const menuBtnAria = {
  'aria-controls': MENU_ID,
} as unknown as { 'aria-controls': string };

export type LandingHeaderProps = {
  scrolled: boolean;
};

function DesktopLink({
  label,
  href,
  light,
}: {
  label: string;
  href: Href;
  light: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={() => router.push(href)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={8}
      style={styles.linkBtn}
    >
      <Text
        style={[
          styles.link,
          light && styles.linkLight,
          hovered && styles.linkHovered,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function LandingHeader({ scrolled }: LandingHeaderProps) {
  const { isMobile } = useBreakpoints();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuShown, setMenuShown] = useState(false);

  const isTransparent = !scrolled;

  /* Animated dropdown: mount first, then transition in (and the reverse on close). */
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;

    if (menuOpen) {
      setMenuMounted(true);
      const frame = requestAnimationFrame(() => setMenuShown(true));
      return () => cancelAnimationFrame(frame);
    }

    setMenuShown(false);
    const timeout = setTimeout(() => setMenuMounted(false), MENU_CLOSE_DELAY);
    return () => clearTimeout(timeout);
  }, [menuOpen]);

  /* Lock page scroll while the mobile menu is open. */
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    if (!menuOpen || typeof document === 'undefined') return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  /* Escape closes the menu. */
  useEffect(() => {
    if (!menuOpen || typeof window === 'undefined') return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <View style={[styles.bar, (isTransparent && !menuOpen) && styles.barTransparent]}>
      <View style={[styles.inner, isMobile && styles.innerMobile]}>
        <View style={[styles.brandGroup, isMobile && styles.brandGroupMobile]}>
          <Image
            source={logoImg}
            style={[styles.logo, isMobile && styles.logoMobile]}
            contentFit="contain"
            accessibilityLabel="Logotipo Ocean Eyes"
          />
          <Text style={[styles.brand, isTransparent && styles.brandLight, isMobile && styles.brandMobile]}>
            Ocean Eyes
          </Text>
        </View>

        {isMobile ? (
          <Pressable
            {...menuBtnAria}
            accessibilityRole="button"
            accessibilityLabel={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            aria-expanded={menuOpen}
            onPress={() => setMenuOpen((open) => !open)}
            hitSlop={8}
            style={[styles.menuBtn, (isTransparent && !menuOpen) && styles.menuBtnTransparent]}
          >
            <FontAwesome5
              name={menuOpen ? 'times' : 'bars'}
              size={18}
              color="rgba(255,255,255,0.92)"
            />
          </Pressable>
        ) : (
          <View style={styles.rightGroup}>
            <View style={styles.links}>
              {LANDING_NAV_LINKS.map((link) => (
                <DesktopLink key={link.label} label={link.label} href={link.href} light={isTransparent} />
              ))}
            </View>
            <View style={styles.buttonGroup}>
              <Pressable
                style={[styles.cta, isTransparent && styles.ctaTransparent]}
                onPress={() => router.push('/descargas')}
                accessibilityRole="button"
                accessibilityLabel="Descargar la aplicación"
                hitSlop={8}
              >
                <FontAwesome5 name="download" size={13} color={BrandColors.primary} />
                <Text style={styles.ctaLabel}>Descargar</Text>
              </Pressable>
              <Pressable
                style={[styles.adminLink, isTransparent && styles.adminLinkTransparent]}
                onPress={() => router.push('/admin/login')}
                accessibilityRole="button"
                accessibilityLabel="Acceso para administradores"
                hitSlop={8}
              >
                <FontAwesome5 name="shield-alt" size={12} color="rgba(255,255,255,0.85)" />
                <Text style={styles.adminLabel}>Admin</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {isMobile && menuMounted && (
        <View
          id={MENU_ID}
          style={[styles.dropdown, menuShown && styles.dropdownShown]}
        >
          {LANDING_NAV_LINKS.map((link) => (
            <Pressable
              key={link.label}
              onPress={() => {
                closeMenu();
                router.push(link.href);
              }}
              accessibilityRole="link"
              accessibilityLabel={link.label}
              hitSlop={4}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownLink}>{link.label}</Text>
            </Pressable>
          ))}
          <View style={styles.dropdownDivider} />
          <Pressable
            style={styles.dropdownCta}
            onPress={() => {
              closeMenu();
              router.push('/descargas');
            }}
            accessibilityRole="button"
            accessibilityLabel="Descargar la aplicación"
            hitSlop={4}
          >
            <FontAwesome5 name="download" size={14} color="#FFFFFF" />
            <Text style={styles.dropdownCtaLabel}>Descargar</Text>
          </Pressable>
          <Pressable
            style={styles.dropdownAdmin}
            onPress={() => {
              closeMenu();
              router.push('/admin/login');
            }}
            accessibilityRole="button"
            accessibilityLabel="Acceso para administradores"
            hitSlop={4}
          >
            <FontAwesome5 name="shield-alt" size={13} color={BrandColors.primary} />
            <Text style={styles.dropdownAdminLabel}>Admin</Text>
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
    backgroundColor: 'rgba(9,26,34,0.72)',
    backdropFilter: 'blur(14px) saturate(140%)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(152,185,177,0.22)',
    boxShadow: '0 10px 30px rgba(6,20,28,0.16)',
    transitionProperty: 'background-color, border-color, box-shadow, backdrop-filter',
    transitionDuration: '320ms',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  barTransparent: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    boxShadow: '0 0 0 rgba(6,20,28,0)',
    backdropFilter: 'blur(0px)',
  },
  inner: {
    width: '100%',
    maxWidth: 1600,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two + 6,
  },
  innerMobile: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 56,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  brandGroupMobile: {
    gap: Spacing.two + 2,
    minWidth: 0,
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
    transform: [{ scale: 1.2 }, { translateY: 0.5 }],
  },
  logoMobile: {
    width: 34,
    height: 34,
    transform: [{ scale: 1 }],
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
  brandMobile: {
    fontSize: 17,
    letterSpacing: -0.2,
  },
  brandLight: {
    color: '#FFFFFF',
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  linkBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  link: {
    color: 'rgba(255,255,255,0.82)',
    fontFamily: AppFonts.body,
    fontSize: 15,
    fontWeight: '500',
    transitionProperty: 'color, opacity, transform',
    transitionDuration: '200ms',
  },
  linkLight: {
    color: 'rgba(255,255,255,0.85)',
  },
  linkHovered: {
    color: '#FFFFFF',
    transform: [{ translateY: -1 }],
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BrandColors.tertiary,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
    transitionProperty: 'background-color, transform',
    transitionDuration: '220ms',
  },
  ctaTransparent: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  ctaLabel: {
    color: BrandColors.primary,
    fontFamily: AppFonts.label,
    fontSize: 14,
    fontWeight: '700',
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
    transitionProperty: 'border-color, background-color',
    transitionDuration: '220ms',
  },
  adminLinkTransparent: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  adminLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: AppFonts.label,
    fontSize: 13,
    fontWeight: '700',
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    transitionProperty: 'background-color, border-color',
    transitionDuration: '220ms',
  },
  menuBtnTransparent: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.24)',
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
    paddingVertical: Spacing.three,
    gap: 2,
    opacity: 0,
    transform: [{ translateY: -8 }],
    transitionProperty: 'opacity, transform',
    transitionDuration: `${MENU_CLOSE_DELAY}ms`,
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  dropdownShown: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  dropdownItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  dropdownLink: {
    color: '#17323B',
    fontFamily: AppFonts.body,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: Spacing.two,
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
    minHeight: 44,
    borderColor: 'rgba(19, 78, 94, 0.25)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    marginTop: Spacing.two,
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
    minHeight: 44,
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
