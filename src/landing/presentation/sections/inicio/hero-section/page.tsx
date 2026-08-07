import React from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const heroBg = require('../../../../../../assets/images/IMAGEN-BAJO-MAR.jpg');

type HeroSectionProps = {
  onFeaturesPress: () => void;
};

export function HeroSection({ onFeaturesPress }: HeroSectionProps) {
  const { isMobile, isTablet } = useBreakpoints();

  return (
    <View style={[styles.section, isMobile && styles.sectionMobile]}>
      <View style={styles.background}>
        <Image source={heroBg} style={styles.bgImage} contentFit="cover" />
        <View style={styles.overlay} />
      </View>

      <View style={[styles.content, isMobile && styles.contentMobile, isTablet && styles.contentTablet]}>
        <View style={[styles.bottom, (isMobile || isTablet) && styles.bottomStacked]}>
          <View style={styles.info}>
            <Text style={[styles.title, isMobile && styles.titleMobile, isTablet && styles.titleTablet]}>
              <Text style={styles.titleOcean}>Ocean</Text>
              <Text style={styles.titleEye}>Eyes</Text>
            </Text>
            <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
              App Móvil para Reportar Pesca ilegal en Tiempo Real
            </Text>
            <Text style={[styles.description, (isMobile || isTablet) && styles.descriptionFull]}>
              Empodera a pescadores y comunidades costeras para proteger los océanos. Reporta,
              monitorea y recibe recompensas por cuidar el mar. Únete a la red de vigilancia marina
              más grande del Perú y contribuye activamente a la conservación de nuestros recursos
              marinos. Cada reporte cuenta, cada acción marca la diferencia.
            </Text>
          </View>

          <View style={[styles.actions, isMobile && styles.actionsMobile]}>
            <Pressable style={[styles.infoBtn, isMobile && styles.btnMobile]} onPress={onFeaturesPress}>
              <Text style={styles.infoBtnText}>Ver más</Text>
            </Pressable>
            <Pressable
              style={[styles.downloadBtn, isMobile && styles.btnMobile]}
              onPress={() => router.push('/descargas')}
            >
              <Text style={styles.downloadBtnText}>Descargar</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.scrollDown} onPress={onFeaturesPress}>
          <Text style={styles.scrollDownIcon}>▼</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    position: 'relative',
    minHeight: 760,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sectionMobile: {
    minHeight: 680,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: 1600,
    marginHorizontal: 'auto' as unknown as number,
    paddingHorizontal: Spacing.six,
    paddingBottom: 120,
  },
  contentMobile: {
    paddingHorizontal: Spacing.three,
    paddingBottom: 96,
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
    fontSize: 80,
    lineHeight: 80,
    fontFamily: Fonts.headline,
    fontStyle: 'italic',
    fontWeight: '300',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  titleMobile: {
    fontSize: 44,
    lineHeight: 44,
  },
  titleTablet: {
    fontSize: 60,
    lineHeight: 60,
  },
  titleOcean: {
    fontWeight: '300',
    color: '#FFFFFF',
  },
  titleEye: {
    fontWeight: '600',
    color: BrandColors.secondary,
  },
  subtitle: {
    fontSize: 20,
    color: '#98B9B1',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitleMobile: {
    fontSize: 17,
    lineHeight: 24,
  },
  description: {
    fontSize: 17,
    lineHeight: 27,
    color: '#FFFFFF',
    opacity: 0.95,
    maxWidth: '75%' as unknown as number,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  descriptionFull: {
    maxWidth: '100%',
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
    paddingTop: Spacing.five,
  },
  actionsMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    width: '100%',
    paddingTop: Spacing.three,
  },
  btnMobile: {
    width: '100%',
    minWidth: 0,
  },
  infoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    minWidth: 200,
  },
  infoBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 17,
    fontFamily: Fonts.body,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#4ADE80',
    minWidth: 200,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 17,
    fontFamily: Fonts.body,
  },
  scrollDown: {
    position: 'absolute',
    bottom: 40,
    left: '50%' as unknown as number,
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -20,
  },
  scrollDownIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});
