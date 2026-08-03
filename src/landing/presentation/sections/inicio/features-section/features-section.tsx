import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { FeatureCard } from './feature-card';

const anonimoIcon = require('../../../../../../assets/icons/anonimo-icon.png');
const camaraIcon = require('../../../../../../assets/icons/camara-icon.png');
const offlineIcon = require('../../../../../../assets/icons/offline-icon.png');
const ubicacionIcon = require('../../../../../../assets/icons/ubicacion-icon.png');
const alertaIcon = require('../../../../../../assets/icons/alerta-icon.png');
const aguaIcon = require('../../../../../../assets/icons/agua-icon.png');

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
              <Text style={styles.phoneHeader}>Ocean Eyes</Text>
              <View style={styles.phoneContent}>
                <View style={styles.phoneBtnPrimary}>
                  <Image source={alertaIcon} style={styles.phoneBtnIcon} contentFit="contain" />
                  <Text style={styles.phoneBtnTextPrimary}>{'REPORTAR\nPESCA ILEGAL'}</Text>
                </View>
                <View style={styles.phoneBtnSecondary}>
                  <Image source={aguaIcon} style={styles.phoneBtnIcon} contentFit="contain" />
                  <Text style={styles.phoneBtnTextSecondary}>{'MEJOR CALIDAD\nDEL AGUA'}</Text>
                </View>
              </View>
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
    fontSize: 40,
    color: BrandColors.primary,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  sectionSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: BrandColors.neutral,
    opacity: 0.72,
    textAlign: 'center',
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
    backgroundColor: BrandColors.primary,
    borderRadius: 32,
    padding: 12,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#134E5E',
    borderRadius: 24,
    overflow: 'hidden',
  },
  phoneHeader: {
    paddingTop: 24,
    paddingBottom: 10,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: Fonts.body,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  phoneContent: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    paddingTop: Spacing.three,
  },
  phoneBtnPrimary: {
    width: '100%',
    maxWidth: 220,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    minHeight: 85,
  },
  phoneBtnSecondary: {
    width: '100%',
    maxWidth: 220,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minHeight: 85,
  },
  phoneBtnIcon: {
    width: 28,
    height: 28,
  },
  phoneBtnTextPrimary: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
    fontFamily: Fonts.label,
    color: '#FFFFFF',
  },
  phoneBtnTextSecondary: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
    fontFamily: Fonts.label,
    color: '#FFFFFF',
  },
});
