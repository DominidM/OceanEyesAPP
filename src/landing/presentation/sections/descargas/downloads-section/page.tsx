import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

export function DescargasSection() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={[styles.section, isMobile && styles.sectionMobile]}>
      <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
        Elegí tu plataforma
      </Text>
      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        <View style={[styles.card, isMobile && styles.cardMobile]}>
          <FontAwesome5 name="android" size={48} color="#3DDC84" />
          <Text style={styles.cardTitle}>Android APK</Text>
          <Text style={styles.cardMeta}>v2.1.0 · 48 MB · Android 8+</Text>
          <Text style={styles.cardDesc}>
            Descargá el APK directamente e instalá la app en tu dispositivo Android.
          </Text>
          <Pressable style={styles.btn} onPress={() => Linking.openURL('https://mega.nz/file/mgBwhIQa#AWoGGu7jnNjX5F5zcX9YzSz2g9GdkISo5nK-CBRTOHs')}>
            <FontAwesome5 name="download" size={14} color={BrandColors.tertiary} />
            <Text style={styles.btnText}>Descargar APK</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    alignItems: 'center',
    backgroundColor: BrandColors.tertiary,
  },
  sectionMobile: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  sectionTitle: {
    fontFamily: Fonts.headline,
    fontSize: 36,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
    marginBottom: Spacing.six,
  },
  sectionTitleMobile: {
    fontSize: 28,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.five,
    justifyContent: 'center',
    maxWidth: 900,
    width: '100%',
  },
  gridMobile: {
    gap: Spacing.four,
  },
  card: {
    flex: 1,
    minWidth: 300,
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
    borderTopWidth: 4,
    borderTopColor: BrandColors.secondary,
  },
  cardMobile: {
    minWidth: 0,
    width: '100%',
    padding: Spacing.four,
  },
  cardTitle: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
    marginTop: Spacing.one,
  },
  cardMeta: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: BrandColors.secondary,
    fontWeight: '500',
  },
  cardDesc: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: BrandColors.neutral,
    opacity: 0.72,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: 999,
    marginTop: Spacing.two,
  },
  btnText: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
  },
});
