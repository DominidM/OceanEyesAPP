import React from 'react';
import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

const logoImg = require('../../../../../../assets/images/logo-ocean-eyes-grande.png');

const socialLinks = [
  { name: 'Facebook', url: 'https://facebook.com', icon: 'f' },
  { name: 'Instagram', url: 'https://instagram.com', icon: 'ig' },
  { name: 'TikTok', url: 'https://tiktok.com', icon: 'tk' },
  { name: 'X', url: 'https://x.com', icon: 'x' },
];

export function ContactSection() {
  return (
    <View style={styles.section}>
      <View style={styles.container}>
        <Image source={logoImg} style={styles.logo} contentFit="contain" />

        <Text style={styles.name}>Ocean Eyes</Text>

        <Text style={styles.text}>
          Estamos comprometidos con la protección de nuestros océanos y la preservación de la vida
          marina del Perú. Tu voz importa: cada reporte, cada consulta y cada idea nos ayuda a
          construir un futuro más sostenible para nuestras costas.
        </Text>

        <Text style={styles.text}>
          ¿Tienes alguna pregunta?{'\n'}
          ¿Quieres reportar algo urgente?{'\n'}
          ¿Deseas colaborar con nosotros?
        </Text>

        <Text style={styles.cta}>
          Contáctanos, estamos aquí para escucharte.
        </Text>

        <View style={styles.social}>
          {socialLinks.map((s) => (
            <Pressable
              key={s.name}
              style={styles.socialLink}
              onPress={() => Linking.openURL(s.url)}
            >
              <Text style={styles.socialIcon}>{s.icon}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    backgroundColor: BrandColors.primary,
  },
  container: {
    maxWidth: 900,
    marginHorizontal: 'auto' as unknown as number,
    alignSelf: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.five,
  },
  logo: {
    width: 180,
    height: 180,
  },
  name: {
    fontFamily: Fonts.headline,
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  text: {
    fontFamily: Fonts.body,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 17,
    lineHeight: 29,
    textAlign: 'center',
    maxWidth: 760,
  },
  cta: {
    fontFamily: Fonts.body,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  social: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  socialLink: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Fonts.body,
  },
});
