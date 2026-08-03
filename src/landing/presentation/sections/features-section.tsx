import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

import { SectionHeader } from '../components/section-header';

const features = [
  {
    title: 'Reporte de pesca ilegal',
    description: 'Captura una foto, geolocaliza y envía tu reporte en menos de un minuto.',
  },
  {
    title: 'Calidad del agua',
    description: 'Conecta un sensor Bluetooth y mide la calidad del agua en tiempo real.',
  },
  {
    title: 'Recompensas',
    description: 'Acumula puntos por cada reporte verificado y canjéalos por beneficios.',
  },
  {
    title: 'Mapa de actividad',
    description: 'Visualiza reportes y eventos cercanos en un mapa colaborativo de la comunidad.',
  },
];

export function FeaturesSection() {
  return (
    <View style={styles.section}>
      <SectionHeader
        title="Todo para cuidar la costa"
        subtitle="Una sola app con las herramientas que pescadores y comunidades necesitan para vigilar el mar."
      />
      <View style={styles.grid}>
        {features.map((feature) => (
          <View key={feature.title} style={styles.card}>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardDescription}>{feature.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    gap: Spacing.six,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  card: {
    flexGrow: 1,
    flexBasis: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    gap: Spacing.two,
    padding: Spacing.four,
  },
  cardTitle: {
    color: BrandColors.primary,
    fontFamily: Fonts.headline,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  cardDescription: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.72,
  },
});
