import React from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

const heroBg = require('../../../../../../assets/images/IMAGEN-BAJO-MAR.jpg');

type HeroSectionProps = {
  onFeaturesPress: () => void;
  onDownloadPress: () => void;
};

export function HeroSection({ onFeaturesPress, onDownloadPress }: HeroSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.background}>
        <Image source={heroBg} style={styles.bgImage} contentFit="cover" />
        <View style={styles.overlay} />
      </View>

      <View style={styles.content}>
        <View style={styles.bottom}>
          <View style={styles.info}>
            <Text style={styles.title}>
              <Text style={styles.titleOcean}>Ocean</Text>
              <Text style={styles.titleEye}>Eye</Text>
            </Text>
            <Text style={styles.subtitle}>App Móvil para Reportar Pesca ilegal en Tiempo Real</Text>
            <Text style={styles.description}>
              Empodera a pescadores y comunidades costeras para proteger los océanos. Reporta,
              monitorea y recibe recompensas por cuidar el mar. Únete a la red de vigilancia marina
              más grande del Perú y contribuye activamente a la conservación de nuestros recursos
              marinos. Cada reporte cuenta, cada acción marca la diferencia.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.infoBtn} onPress={onFeaturesPress}>
              <Text style={styles.infoBtnText}>Ver más</Text>
            </Pressable>
            <Pressable style={styles.downloadBtn} onPress={onDownloadPress}>
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
    minHeight: '100vh' as unknown as number,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
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
  bottom: {
    flexDirection: 'row',
    gap: Spacing.six,
    alignItems: 'flex-end',
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
    paddingTop: Spacing.five,
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
