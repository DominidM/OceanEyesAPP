import React from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const benefits = [
  { icon: 'lock', text: 'Sin manipulación' },
  { icon: 'file-contract', text: 'Respaldo inmutable' },
  { icon: 'eye', text: 'Verificable' },
];

export function ArbitrumSection() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={[styles.section, isMobile && styles.sectionMobile]}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
          Seguridad de tus Recompensas
        </Text>
        <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]}>
          Tus puntos por reportar quedan blindados con contratos inteligentes que imposibilitan alterar el historial.
        </Text>
      </View>

      <View style={[styles.pills, isMobile && styles.pillsMobile]}>
        {benefits.map((item) => (
          <View key={item.text} style={styles.pill}>
            <FontAwesome5 name={item.icon} size={13} color={BrandColors.primary} />
            <Text style={styles.pillText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.cta, isMobile && styles.ctaMobile]}
        onPress={() => router.push('/arbitrum')}
        hitSlop={8}
      >
        <Text style={styles.ctaLabel}>Conocer cómo usamos Arbitrum</Text>
        <FontAwesome5 name="arrow-right" size={14} color="#FFFFFF" />
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
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
    fontSize: 40,
    color: BrandColors.primary,
    fontWeight: '700',
    marginBottom: Spacing.three,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionTitleMobile: {
    fontSize: 30,
  },
  sectionSubtitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: BrandColors.neutral,
    opacity: 0.72,
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: 700,
    lineHeight: 26,
  },
  sectionSubtitleMobile: {
    fontSize: 16,
    lineHeight: 24,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.six,
    maxWidth: 900,
    alignSelf: 'center',
  },
  pillsMobile: {
    gap: Spacing.two,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(152,185,177,0.2)',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pillText: {
    fontFamily: Fonts.label,
    fontSize: 13,
    color: BrandColors.primary,
    fontWeight: '600',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: BrandColors.primary,
    borderRadius: 999,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    alignSelf: 'center',
  },
  ctaMobile: {
    width: '100%',
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
  },
});