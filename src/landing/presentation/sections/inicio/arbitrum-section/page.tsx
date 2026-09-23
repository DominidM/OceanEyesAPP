import React from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { headingProps } from '@landing/presentation/components/heading';
import { Reveal } from '@landing/presentation/components/reveal';
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
      <LinearGradient
        colors={['rgba(152,185,177,0.18)', 'rgba(255,255,255,0)']}
        style={styles.sectionGlow}
      />
      <View style={[styles.header, styles.contentLayer]}>
        <Reveal delay={0} duration={650}>
          <Text
            {...headingProps(2)}
            style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}
          >
            Seguridad de tus Recompensas
          </Text>
        </Reveal>
        <Reveal delay={90} duration={600}>
          <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]}>
            Tus puntos por reportar quedan blindados con contratos inteligentes que imposibilitan
            alterar el historial.
          </Text>
        </Reveal>
      </View>

      <Reveal delay={170} duration={600} style={[styles.pills, styles.contentLayer, isMobile && styles.pillsMobile]}>
        {benefits.map((item) => (
          <View key={item.text} style={styles.pill}>
            <FontAwesome5 name={item.icon} size={13} color={BrandColors.primary} />
            <Text style={styles.pillText}>{item.text}</Text>
          </View>
        ))}
      </Reveal>

      <Reveal delay={250} duration={600} style={[styles.ctaWrap, styles.contentLayer]}>
        <Pressable
          style={[styles.cta, isMobile && styles.ctaMobile]}
          onPress={() => router.push('/arbitrum')}
          accessibilityRole="button"
          accessibilityLabel="Conocer cómo usamos Arbitrum"
          hitSlop={8}
        >
          <Text style={styles.ctaLabel}>Conocer cómo usamos Arbitrum</Text>
          <FontAwesome5 name="arrow-right" size={14} color="#FFFFFF" />
        </Pressable>
      </Reveal>

    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    position: 'relative',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
  },
  sectionGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  contentLayer: {
    position: 'relative',
    zIndex: 1,
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
  ctaWrap: {
    alignSelf: 'center',
    maxWidth: 900,
    width: '100%',
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