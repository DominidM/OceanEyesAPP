import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const barco1 = require('../../../../../../assets/images/help/barco-1.jpg');
const barco2 = require('../../../../../../assets/images/help/barco-2.jpg');
const barco3 = require('../../../../../../assets/images/help/barco-3.jpg');
const barco4 = require('../../../../../../assets/images/help/barco-4.jpg');

const helpActions = [
  { id: 1, image: barco1, icon: 'exclamation-circle', title: 'Reporta Actividades', description: 'Si observas embarcaciones, redes ilegales o cualquier actividad sospechosa en zonas marinas protegidas, repórtalas de inmediato a las autoridades competentes.' },
  { id: 2, image: barco2, icon: 'share-alt', title: 'Difunde Información', description: 'Comparte datos verificados sobre la pesca ilegal en redes sociales y educa a tu comunidad sobre el impacto de esta práctica en nuestros ecosistemas.' },
  { id: 3, image: barco3, icon: 'seedling', title: 'Reduce tu Huella Marina', description: 'Evita plásticos de un solo uso, consume especies de pesca sostenible y reduce tu huella de carbono para proteger la biodiversidad de nuestros océanos.' },
  { id: 4, image: barco4, icon: 'pen', title: 'Firma Peticiones', description: 'Apoya y firma iniciativas ciudadanas que promuevan leyes más estrictas, regulación pesquera y sanciones ejemplares contra la pesca ilegal.' },
];

export function HelpSection() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={[styles.section, isMobile && styles.sectionMobile]}>
      <View style={styles.header}>
        <Text style={[styles.title, isMobile && styles.titleMobile]}>¿Cómo Puedes Ayudar?</Text>
        <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
          Cada acción cuenta. Aquí te mostramos cómo puedes hacer la diferencia.
        </Text>
      </View>

      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {helpActions.map((action, index) => (
          <React.Fragment key={action.id}>
            {index > 0 && !isMobile && <View style={styles.divider} />}
            <View style={[styles.item, isMobile && styles.itemMobile]}>
              <View style={[styles.imageWrap, isMobile && styles.imageWrapMobile]}>
                <Image source={action.image} style={styles.image} contentFit="cover" />
                <View style={styles.imageOverlay} />
              </View>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <FontAwesome5 name={action.icon} size={20} color={BrandColors.primary} />
                  <Text style={styles.cardTitle}>{action.title}</Text>
                </View>
                <Text style={styles.cardDescription}>{action.description}</Text>
              </View>
            </View>
          </React.Fragment>
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
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
  },
  sectionMobile: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  header: {
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
    marginBottom: Spacing.six,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    color: BrandColors.primary,
    fontWeight: '700',
    marginBottom: Spacing.three,
    fontStyle: 'italic',
  },
  titleMobile: {
    fontSize: 30,
  },
  subtitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: BrandColors.neutral,
    opacity: 0.72,
    fontStyle: 'italic',
  },
  subtitleMobile: {
    fontSize: 16,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  gridMobile: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    gap: Spacing.four,
  },
  item: {
    flexGrow: 1,
    flexBasis: 300,
    gap: Spacing.three,
  },
  itemMobile: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: '100%',
  },
  imageWrap: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageWrapMobile: {
    height: 180,
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
  divider: {
    width: 1,
    marginHorizontal: Spacing.four,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(152,185,177,0.25)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.three,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  cardTitle: {
    fontSize: 18,
    color: BrandColors.primary,
    fontWeight: '600',
    fontFamily: Fonts.body,
    flex: 1,
  },
  cardDescription: {
    fontSize: 15,
    color: '#5A7684',
    lineHeight: 24,
    fontFamily: Fonts.body,
  },
});
