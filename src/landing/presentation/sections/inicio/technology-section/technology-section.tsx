import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

const boyasImg = require('../../../../../../assets/images/technology/boyas.jpg');
const entornoImg = require('../../../../../../assets/images/technology/entorno-sucio.png');
const masBoyasImg = require('../../../../../../assets/images/technology/mas-boyas.png');
const internetImg = require('../../../../../../assets/images/technology/internet.png');

const technologies = [
  {
    id: 1,
    image: entornoImg,
    title: 'Detección de Floramiento',
    description: 'Captura fotos del agua con coloración anormal (verde, roja, marrón).',
    features: ['Análisis visual automático', 'Geolocalización precisa', 'Timestamp y condiciones'],
  },
  {
    id: 2,
    image: masBoyasImg,
    title: 'Proyecto MAS BOYAS',
    description: 'Red de boyas inteligentes para monitoreo continuo de calidad del agua.',
    features: ['Sensores de pH y temperatura', 'Detección de clorofila', 'Transmisión en tiempo real'],
  },
  {
    id: 3,
    image: internetImg,
    title: 'Datos Compartidos',
    description: 'Toda la información se comparte con entidades científicas y reguladoras.',
    features: ['Reportes a IMARPE', 'Alertas a DICAPI', 'Dashboard público'],
  },
];

export function TechnologySection() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Tecnología y Colaboración</Text>
        <Text style={styles.subtitle}>
          Trabajamos con instituciones nacionales para proteger nuestros océanos.
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.main}>
          <Image source={boyasImg} style={styles.mainImage} contentFit="cover" />
          <View style={styles.mainOverlay}>
            <Text style={styles.mainTitle}>Monitoreo de Floramiento Algal</Text>
            <Text style={styles.mainDescription}>
              Ocean Eyes incluye tecnología avanzada para detectar floraciones de algas nocivas
              (HABs). Estos eventos afectan la salud marina, la pesca y las comunidades costeras.
              Con tu ayuda, podemos crear mapas en tiempo real y alertar a las autoridades.
            </Text>
          </View>
        </View>

        <View style={styles.cards}>
          {technologies.map((tech) => (
            <View key={tech.id} style={styles.card}>
              <View style={styles.cardImage}>
                <Image source={tech.image} style={styles.cardImg} contentFit="cover" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{tech.title}</Text>
                <Text style={styles.cardDescription}>{tech.description}</Text>
                <View style={styles.cardFeatures}>
                  {tech.features.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <Text style={styles.featureCheck}>✓</Text>
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    backgroundColor: '#E6F0F2',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    color: BrandColors.primary,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: BrandColors.neutral,
    opacity: 0.72,
    maxWidth: 550,
    textAlign: 'center',
  },
  content: {
    flexDirection: 'row',
    gap: Spacing.four,
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  main: {
    flex: 1,
    minHeight: 500,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  mainOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.four,
    backgroundColor: 'rgba(13,27,42,0.9)',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Fonts.body,
    marginBottom: Spacing.three,
  },
  mainDescription: {
    fontSize: 16,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.95)',
    fontFamily: Fonts.body,
  },
  cards: {
    flex: 1,
    gap: Spacing.four,
    justifyContent: 'space-between',
  },
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.three,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    flex: 1,
  },
  cardImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    flexShrink: 0,
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    gap: Spacing.one,
  },
  cardTitle: {
    fontSize: 18,
    color: '#092E42',
    fontWeight: '700',
    fontFamily: Fonts.body,
  },
  cardDescription: {
    fontSize: 14,
    color: '#5A7684',
    lineHeight: 21,
    fontFamily: Fonts.body,
  },
  cardFeatures: {
    marginTop: Spacing.one,
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureCheck: {
    color: '#10B981',
    fontSize: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#4A6572',
    fontFamily: Fonts.body,
  },
});
