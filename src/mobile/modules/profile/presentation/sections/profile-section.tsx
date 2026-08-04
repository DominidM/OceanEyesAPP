import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { SectionHeader } from '@/shared/components/section-header';
import { useAuth } from '@/shared/firebase/auth-context';
import { shadow } from '@/shared/utils/shadows';

export function ProfileSection() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const guest = !user || user.isAnonymous;

  return (
    <>
      <SectionHeader title="Perfil" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        {guest ? (
          <View style={styles.placeholderCard}>
            <AppSymbol name={{ ios: 'person.crop.circle.badge.questionmark.fill', android: 'person', web: 'person' }} color={BrandColors.primary} size={34} />
            <Text style={styles.placeholderTitle}>Inicia sesión</Text>
            <Text style={styles.placeholderText}>
              Para ver tu perfil, puntos y recompensas, inicia sesión con tu cuenta.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/mobile/login')}
              style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
              <Text style={styles.loginButtonLabel}>Iniciar sesión</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderTitle}>Proximamente</Text>
            <Text style={styles.placeholderText}>
              Tu perfil estará disponible en una próxima versión.
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  placeholderCard: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    padding: Spacing.four,
    gap: Spacing.two,
    ...shadow('subtle'),
  },
  placeholderTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    includeFontPadding: false,
  },
  placeholderText: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    includeFontPadding: false,
  },
  loginButton: {
    alignItems: 'center',
    marginTop: Spacing.one,
    borderRadius: 999,
    paddingVertical: Spacing.two,
    backgroundColor: BrandColors.primary,
  },
  loginButtonLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
});
