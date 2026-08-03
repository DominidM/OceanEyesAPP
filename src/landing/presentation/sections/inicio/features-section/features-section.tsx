import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { FeatureCard } from './feature-card';

const anonimoIcon = require('../../../../../../assets/icons/anonimo-icon.png');
const camaraIcon = require('../../../../../../assets/icons/camara-icon.png');
const offlineIcon = require('../../../../../../assets/icons/offline-icon.png');
const ubicacionIcon = require('../../../../../../assets/icons/ubicacion-icon.png');
const mobileOcean = require('../../../../../../assets/images/MOBILE-OCEAN.jpeg');

const features = [
  { icon: anonimoIcon, title: 'Reportes Anónimos', description: 'Tu identidad está protegida. Solo usamos DNI para validar, nunca se comparte.' },
  { icon: camaraIcon, title: 'Reporte con Foto/Video', description: 'Captura evidencia de pesca ilegal con la cámara. La app guarda ubicación GPS automáticamente.' },
  { icon: offlineIcon, title: 'Modo Offline', description: 'Reporta sin señal. La app guarda todo y sincroniza automáticamente cuando tengas internet.' },
  { icon: ubicacionIcon, title: 'Geolocalización Precisa', description: 'Cada reporte incluye coordenadas exactas y timestamp para validación de autoridades.' },
];

export function FeaturesSection() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Funcionalidades Principales</Text>
        <Text style={styles.sectionSubtitle}>
          Una app diseñada para pescadores, fácil de usar y poderosa para proteger el océano.
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.columnLeft}>
          <FeatureCard {...features[0]} />
          <View style={styles.gap} />
          <FeatureCard {...features[2]} />
        </View>

        <View style={styles.columnCenter}>
          <View style={styles.phone}>
            <View style={styles.phoneScreen}>
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
  sectionTitle: {
    fontFamily: Fonts.headline,
    fontSize: 42,
    color: BrandColors.primary,
    fontWeight: '700',
    marginBottom: Spacing.three,
    fontStyle: 'italic',
    letterSpacing: -0.5,
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
  content: {
    flexDirection: 'row',
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
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
    backgroundColor: '#0D1B2A',
    borderRadius: 40,
    padding: 10,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    borderRadius: 32,
    overflow: 'hidden',
  },
  phoneImage: {
    width: '100%',
    height: '100%',
  },
});
