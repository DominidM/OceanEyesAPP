import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const immutableImg =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBnFdVPukrV_P9KjWj5GtTygC5x04LQ4FcAzvi3G44k7MBUfxZ0_GW9n_GxiDLJTRe8rgDU8O6wWQcY9Hq64infSuLoLzgCo6OURwCbCpHMyEJqj87mkVHMbYKMMkkEFPAMcTI3Ea9V3ja_6ASAGWsj2hsKB0tTkcZsIWU_taI7e2lfZ6uY8IfdHBknia1gRtoIZoFiVmFPKCrzOf3PNrnQj9R7qFUPdc7nugmq0Rk4dys12pZiP1WI7A';

export function ProcedenciaSection() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={styles.section}>
      <View style={[styles.immutable, isMobile && styles.immutableMobile]}>
        <View style={styles.immutableText}>
          <Text style={styles.immutableEyebrow}>Procedencia Inmutable</Text>
          <Text style={[styles.immutableTitle, isMobile && styles.immutableTitleMobile]}>
            Anclando la confianza en aguas profundas.
          </Text>
          <Text style={[styles.immutableSubtitle, isMobile && styles.immutableSubtitleMobile]}>
            Ocean Eyes usa registros descentralizados en Arbitrum Sepolia para garantizar
            que la vigilancia ambiental permanezca intacta. Cada evento marino verificado
            queda sellado criptográficamente, creando un registro incontrovertible de la
            salud de nuestros océanos.
          </Text>
        </View>
        <View style={[styles.immutableMedia, isMobile && styles.immutableMediaMobile]}>
          <Image
            source={immutableImg}
            style={[styles.immutableImage, isMobile && styles.immutableImageMobile]}
            contentFit="cover"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  immutable: {
    flexDirection: 'row',
    gap: Spacing.six,
    alignItems: 'center',
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  immutableMobile: {
    flexDirection: 'column',
    gap: Spacing.four,
  },
  immutableText: {
    flex: 1,
    gap: Spacing.three,
  },
  immutableEyebrow: {
    fontFamily: Fonts.label,
    fontSize: 12,
    color: BrandColors.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  immutableTitle: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
    lineHeight: 46,
  },
  immutableTitleMobile: {
    fontSize: 30,
    lineHeight: 36,
  },
  immutableSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: BrandColors.neutral,
    opacity: 0.78,
    lineHeight: 26,
  },
  immutableSubtitleMobile: {
    fontSize: 15,
    lineHeight: 24,
  },
  immutableMedia: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  immutableMediaMobile: {
    width: '100%',
  },
  immutableImage: {
    width: '100%',
    height: 340,
  },
  immutableImageMobile: {
    height: 240,
  },
});
