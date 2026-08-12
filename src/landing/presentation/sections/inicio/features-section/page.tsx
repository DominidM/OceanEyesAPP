import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';
import { FeatureCard } from './feature-card';

const anonimoIcon = require('../../../../../../assets/icons/anonimo-icon.png');
const camaraIcon = require('../../../../../../assets/icons/camara-icon.png');
const ubicacionIcon = require('../../../../../../assets/icons/ubicacion-icon.png');
const alertaIcon = require('../../../../../../assets/icons/alerta-icon.png');
const mobileOcean = 'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786560861/inicio_euy7tv.jpg';

const features = [
  { icon: anonimoIcon, title: 'Reportes Anónimos', description: 'Tu identidad está protegida. Solo usamos DNI para validar, nunca se comparte.' },
  { icon: camaraIcon, title: 'Reporte con Foto/Video', description: 'Captura evidencia de pesca ilegal con la cámara. La app guarda ubicación GPS automáticamente.' },
  { icon: alertaIcon, title: 'Reporte de Basura Marina', description: 'Reporta desechos y puntos de basura en tu zona para coordinar la limpieza del mar.' },
  { icon: ubicacionIcon, title: 'Geolocalización Precisa', description: 'Cada reporte incluye coordenadas exactas y timestamp para validación de autoridades.' },
];

export function FeaturesSection() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={styles.section}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
          Funcionalidades Principales
        </Text>
        <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]}>
          Una app diseñada para pescadores, fácil de usar y poderosa para proteger el océano.
        </Text>
      </View>

      {isMobile ? (
        <View style={styles.contentMobile}>
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.columnLeft}>
            <FeatureCard {...features[0]} />
            <View style={styles.gap} />
            <FeatureCard {...features[2]} />
          </View>

          <View style={styles.columnCenter}>
            <View style={styles.phone}>
              <View style={styles.phoneBezel}>
                <Image source={mobileOcean} style={styles.phoneImage} contentFit="cover" />
              </View>
            </View>
          </View>

          <View style={styles.columnRight}>
            <FeatureCard {...features[1]} />
            <View style={styles.gap} />
            <FeatureCard {...features[3]} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    backgroundColor: BrandColors.tertiary,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.six,
    paddingHorizontal: Spacing.five,
  },
  headerMobile: {
    marginBottom: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  sectionTitle: {
    fontFamily: Fonts.headline,
    fontSize: 42,
    color: BrandColors.primary,
    fontWeight: '700',
    marginBottom: Spacing.three,
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  sectionTitleMobile: {
    fontSize: 32,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: '#5A7684',
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 26,
  },
  sectionSubtitleMobile: {
    fontSize: 16,
    lineHeight: 24,
  },
  content: {
    flexDirection: 'row',
    gap: Spacing.six,
    paddingHorizontal: Spacing.five,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    flexDirection: 'column',
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 480,
  },
  columnLeft: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 0,
  },
  columnCenter: {
    width: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnRight: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 120,
  },
  gap: {
    height: 100,
  },
  phone: {
    width: 280,
    height: 560,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#EFEBE3',
    padding: 0,
  },
  phoneBezel: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    borderRadius: 30,
    padding: 8,
    overflow: 'hidden',
  },
  phoneImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
});
