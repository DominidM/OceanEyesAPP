import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { shadow } from '@/shared/utils/shadows';

const backIcon: SymbolName = { ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' };

const LEGAL_CONTENT: Record<'terms' | 'privacy', { title: string; body: string[] }> = {
  terms: {
    title: 'Términos y condiciones',
    body: [
      'Al usar OceanEyes aceptas contribuir reportes veraces sobre pesca ilegal, basura marina y variaciones del mar.',
      'Los reportes son revisados por la comunidad y pueden otorgar puntos de recompensa. El envío de información falsa puede resultar en la suspensión de tu cuenta.',
      'No está permitido usar la aplicación para acosar, difamar o publicar contenido que vulnere la privacidad de terceros.',
      'OceanEyes puede suspender o terminar cuentas que incumplan estos términos.',
    ],
  },
  privacy: {
    title: 'Política de privacidad',
    body: [
      'Recopilamos tu nombre, correo y, si lo proporcionas, teléfono y DNI, para gestionar tu cuenta y tus recompensas.',
      'Los datos de tus reportes (fotos, ubicación, descripción) se almacenan de forma segura y solo se usan para moderación y verificación.',
      'Puedes solicitar la eliminación de tus datos en cualquier momento escribiéndonos a soporte.',
      'No vendemos ni compartimos tus datos personales con terceros con fines publicitarios.',
    ],
  },
};

export function LegalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { page } = useLocalSearchParams<{ page?: string }>();
  const content = LEGAL_CONTENT[page === 'privacy' ? 'privacy' : 'terms'];

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <AppSymbol name={backIcon} color={BrandColors.primary} size={22} />
        </Pressable>
        <AppText style={styles.topBarTitle}>{content.title}</AppText>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.card}>
          {content.body.map((paragraph, index) => (
            <AppText key={index} style={styles.paragraph}>
              {paragraph}
            </AppText>
          ))}
          <AppText style={styles.updated}>Última actualización: 2026</AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.tertiary,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D9CFC5',
    backgroundColor: 'rgba(239, 235, 227, 0.95)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  topBarSpacer: {
    width: 40,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    padding: 16,
    ...shadow('subtle'),
  },
  paragraph: {
    color: 'rgba(44, 44, 44, 0.8)',
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 23,
    marginBottom: 12,
    includeFontPadding: false,
  },
  updated: {
    color: 'rgba(44, 44, 44, 0.45)',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
