import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

const entornoImg = require('../../../../../../assets/images/technology/entorno-sucio.png');
const bajoMarImg = require('../../../../../../assets/images/IMAGEN-BAJO-MAR.jpg');

const cards = [
  {
    id: 1,
    icon: 'map-marker-alt',
    image: entornoImg,
    title: 'Limpieza por Zonas',
    description:
      'Divide la costa en zonas geo-referenciadas para una gestión eficiente. Reportá puntos de acumulación de residuos, organizá brigadas comunitarias y monitoreá el progreso de limpieza en tiempo real. Cada zona muestra métricas de avance, residuos recolectados y voluntarios activos por sector costero.',
    tags: ['Por Zonas', 'Comunitario'],
  },
  {
    id: 2,
    icon: 'draw-polygon',
    image: bajoMarImg,
    title: 'Bordes y Perímetros',
    description:
      'Delimitá bordes costeros protegidos, marcá zonas de veda pesquera y definí perímetros de conservación marina con precisión GPS. El sistema genera alertas automáticas cuando una embarcación cruza límites restringidos, notificando en tiempo real a las autoridades portuarias y fiscalías ambientales.',
    tags: ['Geolocalizado', 'Alertas'],
  },
];

export function TechnologySection() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Tecnología e Innovación</Text>
        <Text style={styles.sectionSubtitle}>
          Herramientas inteligentes para proteger el ecosistema marino desde la costa hasta el mar abierto.
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.cardsColumn}>
          {cards.map((card) => (
            <View key={card.id} style={styles.card}>
              <View style={styles.cardImage}>
                <Image source={card.image} style={styles.cardImg} contentFit="cover" />
              </View>
              <View style={styles.cardHeader}>
                <FontAwesome5 name={card.icon} size={24} color={BrandColors.primary} />
                <Text style={styles.cardTitle}>{card.title}</Text>
              </View>
              <Text style={styles.cardDescription}>{card.description}</Text>
              <View style={styles.tags}>
                {card.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.phoneColumn}>
          <View style={styles.placeholder}>
            <FontAwesome5 name="mobile-alt" size={64} color={BrandColors.secondary} />
            <Text style={styles.placeholderTitle}>Próximamente</Text>
            <Text style={styles.placeholderSubtitle}>App Móvil</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    backgroundColor: BrandColors.tertiary,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.six,
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
    gap: Spacing.five,
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'stretch',
  },
  cardsColumn: {
    flex: 3,
    gap: Spacing.five,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderTopWidth: 4,
    borderTopColor: BrandColors.secondary,
    padding: Spacing.five,
    flexDirection: 'column',
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: Spacing.four,
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  cardTitle: {
    fontFamily: Fonts.headline,
    fontSize: 26,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  cardDescription: {
    fontSize: 16,
    color: BrandColors.neutral,
    opacity: 0.78,
    lineHeight: 26,
    fontFamily: Fonts.body,
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  tag: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    backgroundColor: 'rgba(152,185,177,0.2)',
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    color: BrandColors.primary,
    fontWeight: '600',
    fontFamily: Fonts.label,
  },
  phoneColumn: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(152,185,177,0.3)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.six,
  },
  placeholderTitle: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  placeholderSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: BrandColors.neutral,
    opacity: 0.6,
  },
});
