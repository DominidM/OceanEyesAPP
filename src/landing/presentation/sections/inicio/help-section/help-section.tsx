import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

const barco1 = require('../../../../../../assets/images/help/barco-1.jpg');
const barco2 = require('../../../../../../assets/images/help/barco-2.jpg');
const barco3 = require('../../../../../../assets/images/help/barco-3.jpg');
const barco4 = require('../../../../../../assets/images/help/barco-4.jpg');

const helpActions = [
  { id: 1, image: barco1, icon: '📋', title: 'Reporta Actividades', description: 'Si observas actividades sospechosas, repórtalas a las autoridades.' },
  { id: 2, image: barco2, icon: '📢', title: 'Difunde Información', description: 'Comparte información sobre la pesca ilegal y educa a tu comunidad.' },
  { id: 3, image: barco3, icon: '🌿', title: 'Reduce tu Huella Marina', description: 'Evita plásticos de un solo uso y especies en riesgo para proteger los océanos.' },
  { id: 4, image: barco4, icon: '✍️', title: 'Firma Peticiones', description: 'Apoya iniciativas que promuevan leyes más estrictas contra la pesca ilegal.' },
];

export function HelpSection() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>¿Cómo Puedes Ayudar?</Text>
        <Text style={styles.subtitle}>
          Cada acción cuenta. Aquí te mostramos cómo puedes hacer la diferencia.
        </Text>
      </View>

      <View style={styles.grid}>
        {helpActions.map((action) => (
          <View key={action.id} style={styles.item}>
            <View style={styles.imageWrap}>
              <Image source={action.image} style={styles.image} contentFit="cover" />
              <View style={styles.imageOverlay} />
            </View>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{action.icon}</Text>
                <Text style={styles.cardTitle}>{action.title}</Text>
              </View>
              <Text style={styles.cardDescription}>{action.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.five,
  },
  header: {
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  item: {
    flexGrow: 1,
    flexBasis: 280,
    gap: Spacing.three,
  },
  imageWrap: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.three,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 18,
    color: BrandColors.primary,
    fontWeight: '600',
    fontFamily: Fonts.body,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#5A7684',
    lineHeight: 22,
    fontFamily: Fonts.body,
  },
});
