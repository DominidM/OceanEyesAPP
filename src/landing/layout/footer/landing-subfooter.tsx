import { Link } from 'expo-router';
import React from 'react';
import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const logoImg = 'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786169052/logotipo_q2mkhv.png';

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Cómo funciona', href: '/#features' },
  { label: 'FAQ', href: '/faq' },
];

const rutasLinks = [
  { label: 'Municipalidades', href: '/municipio' },
  { label: 'Descubre tu Rol', href: '/descubre-tu-rol' },
  { label: 'Arbitrum', href: '/arbitrum' },
  { label: 'Descargas', href: '/descargas' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contacto', href: '/contacto' },
];

const socialLinks = [
  { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/solvegrades/' },
];

export function LandingSubfooter() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={[styles.subfooter, isMobile && styles.subfooterMobile]}>
      <View style={[styles.inner, isMobile && styles.innerMobile]}>
        <View style={[styles.brandCol, isMobile && styles.brandColMobile]}>
          <Image source={logoImg} style={styles.logo} contentFit="contain" />
          <Text style={styles.brandName}>Ocean Eyes</Text>
          <Text style={styles.brandDesc}>
            Protegiendo los océanos del Perú desde 2026. Tecnología ciudadana al servicio de la
            conservación marina.
          </Text>
        </View>

        <View style={[styles.navCol, isMobile && styles.colHalf]}>
          <Text style={styles.colTitle}>Navegación</Text>
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href as any}>
              <Text style={styles.navLink}>{link.label}</Text>
            </Link>
          ))}
        </View>

        <View style={[styles.rutasCol, isMobile && styles.colHalf]}>
          <Text style={styles.colTitle}>Rutas</Text>
          {rutasLinks.map((link) => (
            <Link key={link.label} href={link.href as any}>
              <Text style={styles.navLink}>{link.label}</Text>
            </Link>
          ))}
        </View>

        <View style={[styles.contactCol, isMobile && styles.colHalf]}>
          <Text style={styles.colTitle}>Contacto</Text>
          <Text style={styles.contactText}>contacto@oceaneyes.pe</Text>
          <Text style={styles.contactText}>+51 987 654 321</Text>
          <Text style={styles.contactText}>Lima, Perú</Text>
        </View>

        <View style={[styles.socialCol, isMobile && styles.colHalf]}>
          <Text style={styles.colTitle}>Redes Sociales</Text>
          <View style={styles.socialRow}>
            {socialLinks.map((s) => (
              <Pressable
                key={s.name}
                style={styles.socialBtn}
                onPress={() => Linking.openURL(s.url)}
              >
                <FontAwesome5 name={s.icon} size={18} color="#FFFFFF" />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  subfooter: {
    backgroundColor: BrandColors.neutral,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    borderTopWidth: 1,
    borderTopColor: 'rgba(152,185,177,0.3)',
  },
  subfooterMobile: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  inner: {
    flexDirection: 'row',
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
    gap: Spacing.six,
    flexWrap: 'wrap',
  },
  innerMobile: {
    gap: Spacing.five,
  },
  brandCol: {
    flex: 2.5,
    minWidth: 240,
    gap: Spacing.three,
  },
  brandColMobile: {
    flex: 0,
    flexBasis: '100%',
    minWidth: 0,
  },
  colHalf: {
    flex: 1,
    flexBasis: '45%',
    minWidth: 0,
  },
  logo: {
    width: 52,
    height: 52,
  },
  brandName: {
    fontFamily: Fonts.headline,
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  brandDesc: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    maxWidth: 320,
  },
  navCol: {
    flex: 1,
    minWidth: 140,
    gap: Spacing.two,
  },
  colTitle: {
    fontFamily: Fonts.headline,
    fontSize: 15,
    color: BrandColors.secondary,
    fontWeight: '700',
    marginBottom: Spacing.one,
    fontStyle: 'italic',
  },
  navLink: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 28,
  },
  contactCol: {
    flex: 1.5,
    minWidth: 180,
    gap: Spacing.two,
  },
  contactText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 28,
  },
  rutasCol: {
    flex: 1,
    minWidth: 120,
    gap: Spacing.two,
  },
  socialCol: {
    flex: 1,
    minWidth: 140,
    gap: Spacing.two,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
