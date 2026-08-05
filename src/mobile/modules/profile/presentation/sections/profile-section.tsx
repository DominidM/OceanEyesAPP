import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { SectionHeader } from '@/shared/components/section-header';
import { useAuth } from '@/shared/firebase/auth-context';
import { logout } from '@/shared/firebase/auth';
import { useGuestStatus } from '@/shared/hooks/use-guest-status';
import type { ProfileType } from '@/shared/firebase/types';
import { shadow } from '@/shared/utils/shadows';

const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  fisher: 'Pescador',
  citizen: 'Ciudadano',
};

export function ProfileSection() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile } = useAuth();

  const guest = useGuestStatus();

  const handleLogout = async () => {
    await logout();
    router.replace('/mobile/login');
  };

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
          <View style={styles.profileCard}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <AppSymbol name={{ ios: 'person.fill', android: 'person', web: 'person' }} color={BrandColors.tertiary} size={22} />
              </View>
              <View style={styles.nameWrap}>
                <Text style={styles.placeholderTitle}>{profile?.displayName || user?.displayName || 'Usuario'}</Text>
                <Text style={styles.profileType}>
                  {profile ? PROFILE_TYPE_LABELS[profile.profileType] : ''}
                </Text>
              </View>
            </View>

            {profile?.email ? (
              <View style={styles.infoRow}>
                <AppSymbol name={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }} color={BrandColors.primary} size={16} />
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
            ) : null}

            {profile?.dni ? (
              <View style={styles.infoRow}>
                <AppSymbol name={{ ios: 'creditcard.fill', android: 'badge', web: 'badge' }} color={BrandColors.primary} size={16} />
                <Text style={styles.infoValue}>DNI {profile.dni}</Text>
              </View>
            ) : null}

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile?.pointsBalance ?? 0}</Text>
                <Text style={styles.statLabel}>Puntos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile?.totalPointsEarned ?? 0}</Text>
                <Text style={styles.statLabel}>Ganados</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile?.verifiedReportsCount ?? 0}</Text>
                <Text style={styles.statLabel}>Verificados</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleLogout}
              style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
              <Text style={styles.logoutButtonLabel}>Cerrar sesión</Text>
            </Pressable>
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
  profileCard: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    padding: Spacing.four,
    gap: Spacing.three,
    ...shadow('subtle'),
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
  },
  nameWrap: {
    flex: 1,
    gap: 2,
  },
  profileType: {
    color: BrandColors.primary,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  infoValue: {
    flex: 1,
    color: 'rgba(44, 44, 44, 0.8)',
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '400',
    includeFontPadding: false,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E1D9',
    backgroundColor: '#FAF6F1',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    gap: 2,
  },
  statValue: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    includeFontPadding: false,
  },
  statLabel: {
    color: 'rgba(44, 44, 44, 0.6)',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '400',
    includeFontPadding: false,
  },
  logoutButton: {
    alignItems: 'center',
    marginTop: Spacing.one,
    borderRadius: 999,
    paddingVertical: Spacing.two,
    backgroundColor: '#FEE2E2',
  },
  logoutButtonLabel: {
    color: '#B91C1C',
    fontFamily: Fonts.label,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
});
