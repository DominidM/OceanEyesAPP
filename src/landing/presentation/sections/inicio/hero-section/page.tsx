import React, { useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { headingProps } from '@landing/presentation/components/heading';
import { Reveal } from '@landing/presentation/components/reveal';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';
import { webTextStyle } from '@landing/styles/web-types';

const heroBg =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/f_auto,q_auto,w_1600/v1786166250/hero_m3t2al.jpg';

/** Short value proposition shown above the description (all breakpoints). */
const TAGLINE = 'Vigilancia ciudadana para proteger nuestros mares.';

/** Condensed hero paragraph: same message, less vertical bulk on mobile. */
const SHORT_DESCRIPTION =
  'Reporta pesca ilegal en tiempo real, adjunta evidencia y sigue cada caso desde tu celular.';
const FULL_DESCRIPTION =
  'Empodera a pescadores y comunidades costeras para proteger los océanos. Reporta, monitorea y recibe recompensas por cuidar el mar.';

const CTA_PRIMARY_TEXT = '#0B2E1F';

/* Responsive type scale: keeps "OceanEyes" on a single line from 320px up. */
const titleMobile = webTextStyle({
  fontSize: 'clamp(36px, 10.5vw, 46px)',
  lineHeight: 'clamp(40px, 11.5vw, 52px)',
});
const titleTablet = webTextStyle({
  fontSize: 'clamp(48px, 7.5vw, 64px)',
  lineHeight: 'clamp(54px, 8vw, 70px)',
});
const titleDesktop = webTextStyle({
  fontSize: 'clamp(64px, 5.5vw, 88px)',
  lineHeight: 'clamp(68px, 5.8vw, 94px)',
});
const taglineMobile = webTextStyle({
  fontSize: 'clamp(15.5px, 4.2vw, 18px)',
  lineHeight: 'clamp(23px, 6vw, 27px)',
});
const taglineDesktop = webTextStyle({
  fontSize: 'clamp(18px, 1.6vw, 22px)',
  lineHeight: 'clamp(27px, 2.2vw, 32px)',
});
const descriptionMobile = webTextStyle({
  fontSize: 'clamp(14.5px, 3.9vw, 16px)',
  lineHeight: 'clamp(22px, 5.8vw, 25px)',
});
const descriptionDesktop = webTextStyle({
  fontSize: 'clamp(16px, 1.25vw, 18px)',
  lineHeight: 'clamp(26px, 1.9vw, 30px)',
});

type HeroSectionProps = {
  onFeaturesPress: () => void;
};

function DownloadCta({ stacked }: { stacked: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Descargar la aplicación OceanEyes"
      onPress={() => router.push('/descargas')}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.cta,
        styles.ctaPrimary,
        stacked && styles.ctaStacked,
        (hovered || pressed) && styles.ctaPrimaryHovered,
        pressed && styles.ctaPressed,
      ]}
    >
      <FontAwesome5 name="download" size={16} color={CTA_PRIMARY_TEXT} />
      <Text style={[styles.ctaLabel, styles.ctaPrimaryLabel]}>Descargar aplicación</Text>
    </Pressable>
  );
}

function LearnMoreCta({ stacked, onPress }: { stacked: boolean; onPress: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Conocer más sobre OceanEyes"
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.cta,
        styles.ctaSecondary,
        stacked && styles.ctaStacked,
        hovered && styles.ctaSecondaryHovered,
        pressed && styles.ctaPressed,
      ]}
    >
      <Text style={styles.ctaLabel}>Conocer OceanEyes</Text>
      <FontAwesome5 name="arrow-down" size={15} color="#FFFFFF" />
    </Pressable>
  );
}

export function HeroSection({ onFeaturesPress }: HeroSectionProps) {
  const { isMobile, isTablet } = useBreakpoints();
  const isStacked = isMobile || isTablet;
  const [cueHovered, setCueHovered] = useState(false);

  return (
    <View id="oe-hero" style={styles.section}>
      <View style={styles.background}>
        <Image
          source={heroBg}
          style={styles.bgImage}
          contentFit="cover"
          priority="high"
          aria-hidden
        />
        <LinearGradient
          colors={['rgba(6,20,28,0.72)', 'rgba(6,20,28,0.38)', 'rgba(6,20,28,0.82)']}
          locations={[0, 0.45, 1]}
          style={styles.overlay}
        />
        <LinearGradient
          colors={['rgba(239,235,227,0)', 'rgba(239,235,227,0.6)']}
          style={styles.bottomFade}
        />
      </View>

      <View
        style={[
          styles.content,
          isMobile && styles.contentMobile,
          isTablet && styles.contentTablet,
        ]}
      >
        <View style={[styles.bottom, isStacked && styles.bottomStacked]}>
          <View style={styles.info}>
            <Reveal delay={0} duration={700}>
              <Text
                {...headingProps(1)}
                style={[
                  styles.title,
                  isMobile && titleMobile,
                  isTablet && titleTablet,
                  !isStacked && titleDesktop,
                ]}
              >
                <Text style={styles.titleOcean}>Ocean</Text>
                <Text style={styles.titleEye}>Eyes</Text>
              </Text>
            </Reveal>

            <Reveal delay={90} duration={600}>
              <Text style={[styles.tagline, isMobile ? taglineMobile : taglineDesktop]}>
                {TAGLINE}
              </Text>
            </Reveal>

            <Reveal delay={160} duration={600}>
              <Text
                style={[
                  styles.description,
                  isMobile ? descriptionMobile : descriptionDesktop,
                  isTablet && styles.descriptionWide,
                ]}
              >
                {isMobile ? SHORT_DESCRIPTION : FULL_DESCRIPTION}
              </Text>
            </Reveal>
          </View>

          <Reveal
            direction="up"
            delay={240}
            duration={600}
            style={[styles.actions, isMobile && styles.actionsStacked]}
          >
            <DownloadCta stacked={isMobile} />
            <LearnMoreCta stacked={isMobile} onPress={onFeaturesPress} />
          </Reveal>
        </View>

        <Reveal delay={420} duration={600} style={styles.cueWrap}>
          <Pressable
            id="oe-scroll-cue"
            accessibilityRole="button"
            accessibilityLabel="Desplazarse a la siguiente sección"
            onPress={onFeaturesPress}
            onHoverIn={() => setCueHovered(true)}
            onHoverOut={() => setCueHovered(false)}
            style={[styles.scrollDown, cueHovered && styles.scrollDownHovered]}
            hitSlop={8}
          >
            <FontAwesome5 name="chevron-down" size={15} color="#FFFFFF" />
          </Pressable>
        </Reveal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    position: 'relative',
    minHeight: 720,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#061418',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
  },
  content: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: 1600,
    marginHorizontal: 'auto' as unknown as number,
    paddingHorizontal: Spacing.six,
    paddingTop: 110,
    paddingBottom: 120,
  },
  contentMobile: {
    paddingHorizontal: Spacing.three,
    paddingTop: 96,
    paddingBottom: 100,
  },
  contentTablet: {
    paddingHorizontal: Spacing.four,
  },
  bottom: {
    flexDirection: 'row',
    gap: Spacing.six,
    alignItems: 'flex-end',
  },
  bottomStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.four,
  },
  info: {
    flex: 1,
    gap: Spacing.three,
  },
  title: {
    fontFamily: Fonts.headline,
    fontStyle: 'italic',
    fontWeight: '300',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  titleOcean: {
    fontWeight: '300',
    color: '#FFFFFF',
  },
  titleEye: {
    fontWeight: '600',
    color: BrandColors.secondary,
  },
  tagline: {
    color: '#CFE3DD',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  description: {
    color: '#FFFFFF',
    opacity: 0.94,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  descriptionWide: {
    maxWidth: 640,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
  actionsStacked: {
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    paddingTop: Spacing.two,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minHeight: 50,
    minWidth: 230,
    transitionProperty: 'background-color, border-color, box-shadow, transform',
    transitionDuration: '220ms',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  ctaStacked: {
    width: '100%',
    minWidth: 0,
    maxWidth: 420,
  },
  ctaPressed: {
    transform: [{ translateY: 1 }],
  },
  ctaPrimary: {
    backgroundColor: '#4ADE80',
    shadowColor: '#06231A',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  ctaPrimaryHovered: {
    backgroundColor: '#5CE693',
    shadowOpacity: 0.45,
  },
  ctaPrimaryLabel: {
    color: CTA_PRIMARY_TEXT,
  },
  ctaSecondary: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  ctaSecondaryHovered: {
    backgroundColor: 'rgba(255,255,255,0.26)',
    borderColor: 'rgba(255,255,255,0.7)',
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    fontFamily: Fonts.body,
    letterSpacing: 0.1,
  },
  cueWrap: {
    position: 'absolute',
    bottom: 36,
    left: '50%' as unknown as number,
    marginLeft: -22,
  },
  scrollDown: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    transitionProperty: 'background-color, border-color',
    transitionDuration: '220ms',
  },
  scrollDownHovered: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.85)',
  },
});
