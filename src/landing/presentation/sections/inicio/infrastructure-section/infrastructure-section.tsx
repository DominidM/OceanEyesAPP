import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

const securityImg = require('../../../../../../assets/images/infrastructure/seguridad-celular.jpg');

const features = [
  {
    icon: '🔒',
    title: 'Encriptación Extremo a Extremo',
    description: 'Los reportes están totalmente protegidos para resguardar la identidad.',
    color: '#3B82F6',
  },
  {
    icon: '📍',
    title: 'GPS en Tiempo Real',
    description: 'Etiquetado de ubicación preciso para las autoridades.',
    color: BrandColors.secondary,
  },
];

export function InfrastructureSection() {
  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.left}>
          <Image source={securityImg} style={styles.image} contentFit="cover" />
        </View>

        <View style={styles.right}>
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🛡️</Text>
            <Text style={styles.title}>Infraestructura Tecnológica Segura</Text>
          </View>

          <View style={styles.features}>
            {features.map((f) => (
              <View key={f.title} style={styles.feature}>
                <Text style={[styles.featureIcon, { color: f.color }]}>{f.icon}</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDescription}>{f.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.five,
    backgroundColor: BrandColors.tertiary,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 320,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  left: {
    flex: 1,
    minHeight: 320,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  right: {
    flex: 1.2,
    padding: Spacing.four,
    gap: Spacing.three,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerIcon: {
    fontSize: 34,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 30,
    color: '#0D1B2A',
    fontWeight: '700',
    flex: 1,
  },
  features: {
    gap: Spacing.three,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 20,
    width: 34,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    color: '#0D1B2A',
    fontWeight: '700',
    fontFamily: Fonts.body,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#5A7684',
    lineHeight: 21,
    fontFamily: Fonts.body,
  },
});
