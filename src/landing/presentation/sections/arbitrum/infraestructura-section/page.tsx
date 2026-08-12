import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const INFRA_CARDS = [
  {
    id: 1,
    icon: 'bolt',
    title: 'Alto Rendimiento',
    description:
      'Procesa grandes volúmenes de telemetría sin latencia, asegurando actualizaciones de vigilancia en tiempo real. Las transacciones se confirman en segundos, manteniendo el monitoreo marino siempre activo.',
  },
  {
    id: 2,
    icon: 'shield-alt',
    title: 'Prueba Criptográfica',
    description:
      'Hereda la seguridad de Ethereum para garantizar la autenticidad de cada anomalía marina reportada. Cada registro queda firmado y verificado por la red, sin depender de una sola entidad.',
  },
  {
    id: 3,
    icon: 'leaf',
    title: 'Bajo Impacto',
    description:
      'Consumo energético minimizado, alineado con nuestra misión de preservación ambiental. Los rollups procesan miles de operaciones con una fracción de la energía de otras redes.',
  },
];

export function InfraestructuraSection() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={styles.section}>
      <View style={[styles.band, isMobile && styles.bandMobile]}>
        <View style={styles.inner}>
          <View style={[styles.header, isMobile && styles.headerMobile]}>
            <Text style={[styles.title, isMobile && styles.titleMobile]}>
              Infraestructura
            </Text>
            <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
              Construido sobre rollups escalables y de alta eficiencia.
            </Text>
          </View>

          <View style={[styles.cards, isMobile && styles.cardsMobile]}>
            {INFRA_CARDS.map((item) => (
              <View key={item.id} style={[styles.card, isMobile && styles.cardMobile]}>
                <View style={styles.cardHeader}>
                  <FontAwesome5 name={item.icon} size={30} color={BrandColors.secondary} />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                <Text style={styles.cardDescription}>{item.description}</Text>
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
    width: '100%',
  },
  band: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
    marginBottom: Spacing.six,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
  },
  bandMobile: {
    paddingHorizontal: Spacing.three,
  },
  inner: {
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: Spacing.six,
    width: '100%',
  },
  headerMobile: {
    marginBottom: Spacing.five,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    color: BrandColors.primary,
    fontWeight: '700',
    marginBottom: Spacing.three,
    fontStyle: 'italic',
    textAlign: 'left',
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
    textAlign: 'left',
  },
  subtitleMobile: {
    fontSize: 16,
  },
  cards: {
    flexDirection: 'row',
    gap: Spacing.five,
    width: '100%',
  },
  cardsMobile: {
    flexDirection: 'column',
    gap: Spacing.four,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(192,200,203,0.5)',
    padding: Spacing.five,
    gap: Spacing.three,
  },
  cardMobile: {
    padding: Spacing.four,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  cardTitle: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    color: BrandColors.primary,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: '#40484B',
    lineHeight: 24,
    fontFamily: Fonts.body,
  },
});
