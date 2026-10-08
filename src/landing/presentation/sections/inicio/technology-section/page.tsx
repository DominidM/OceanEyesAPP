import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { headingProps } from '@landing/presentation/components/heading';
import { Reveal } from '@landing/presentation/components/reveal';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const entornoImg =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/f_auto,q_auto,w_1200/v1786166245/entorno-sucio_qzywtp.png';
const bajoMarImg =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/f_auto,q_auto,w_1200/v1786166250/hero_m3t2al.jpg';
const phoneImg =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1791492694/d88a56f0-ff3c-4168-999a-9628752204b1.png';

/**
 * Intrinsic ratio of the login mockup above (900 × 1778 px).
 *
 * `expo-image` on web renders a container `<div>` with an absolutely
 * positioned `<img>` inside, so the container never derives its height from
 * the picture: without an explicit height (or ratio) it collapses, and with a
 * height taken from the surrounding layout the screenshot gets cropped.
 * Pinning the ratio keeps the mockup phone-shaped and fully visible.
 */
const LOGIN_MOCKUP_ASPECT_RATIO = 900 / 1778;

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
        <Reveal delay={0} duration={650}>
          <Text
            {...headingProps(2)}
            style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}
          >
            Tecnología e Innovación
          </Text>
        </Reveal>
        <Reveal delay={90} duration={600}>
          <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]}>
            Herramientas inteligentes para proteger el ecosistema marino desde la costa hasta el
            mar abierto.
          </Text>
        </Reveal>
      </View>

      <View style={[styles.content, isMobile && styles.contentMobile]}>
        <View style={styles.cardsColumn}>
          {cards.map((card, index) => (
            <Reveal
              key={card.id}
              delay={index * 80}
              duration={650}
              style={[styles.card, isMobile && styles.cardMobile]}
            >
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
            </Reveal>
          ))}
        </View>

        <View style={[styles.phoneColumn, isMobile && styles.phoneColumnMobile]}>
          <Reveal
            direction="none"
            scale={0.97}
            delay={160}
            duration={700}
            style={styles.phoneWrap}
          >
            <Image source={phoneImg} style={styles.phoneImage} contentFit="contain" />
          </Reveal>
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
  },
  phoneColumnMobile: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: '100%',
    alignSelf: 'center',
  },
  phoneWrap: {
    /* Phone-proportioned frame: height is driven by the screenshot itself
       (width 100% + height auto), never by the surrounding row/column. */
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(152,185,177,0.35)',
    padding: Spacing.two,
  },
  phoneImage: {
    width: '100%',
    aspectRatio: LOGIN_MOCKUP_ASPECT_RATIO,
    borderRadius: 18,
  },
});
