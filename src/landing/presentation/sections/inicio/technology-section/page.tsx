import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const entornoImg = require('../../../../../../assets/images/technology/entorno-sucio.png');
const bajoMarImg = 'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786166250/hero_m3t2al.jpg';

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
  const { isMobile } = useBreakpoints();

  return (
    <View style={[styles.section, isMobile && styles.sectionMobile]}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
          Tecnología e Innovación
        </Text>
        <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]}>
          Herramientas inteligentes para proteger el ecosistema marino desde la costa hasta el mar abierto.
        </Text>
      </View>

      <View style={[styles.content, isMobile && styles.contentMobile]}>
        <View style={styles.cardsColumn}>
          {cards.map((card) => (
            <View key={card.id} style={[styles.card, isMobile && styles.cardMobile]}>
              <View style={[styles.cardImage, isMobile && styles.cardImageMobile]}>
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

        <View style={[styles.phoneColumn, isMobile && styles.phoneColumnMobile]}>
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
  sectionMobile: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
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
    gap: Spacing.five,
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'stretch',
  },
  contentMobile: {
    flexDirection: 'column',
    gap: Spacing.five,
  },
  cardsColumn: {
    flex: 3,
    gap: Spacing.five,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderTopWidth: 4,
    borderTopColor: BrandColors.secondary,
    padding: Spacing.five,
    flexDirection: 'column',
  },
  cardMobile: {
    padding: Spacing.four,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: Spacing.four,
  },
  cardImageMobile: {
    height: 160,
    marginBottom: Spacing.three,
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
    minHeight: 420,
  },
  phoneColumnMobile: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: '100%',
    height: 300,
    minHeight: 0,
  },
  placeholder: {
    width: '100%',
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(152,185,177,0.45)',
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
