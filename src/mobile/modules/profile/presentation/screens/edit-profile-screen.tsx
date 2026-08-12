import { useRouter } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { KeyboardScrollView } from '@/shared/components/keyboard-scroll-view';
import { updateUserProfile } from '@/shared/firebase/auth';
import { useAuth } from '@/shared/firebase/auth-context';
import type { ProfileType } from '@/shared/firebase/types';
import { shadow } from '@/shared/utils/shadows';

const backIcon: SymbolName = { ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' };

function gateToLogin(router: ReturnType<typeof useRouter>) {
  Alert.alert('Inicia sesión', 'Para editar tu perfil inicia sesión con tu cuenta.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Ir a iniciar sesión', onPress: () => router.replace('/mobile/login') },
  ]);
}

export function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? user?.displayName ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [dni, setDni] = useState(profile?.dni ?? '');
  const [profileType, setProfileType] = useState<ProfileType>(profile?.profileType ?? 'citizen');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!user) {
      gateToLogin(router);
      return;
    }
    if (!displayName.trim()) {
      setError('Ingresa tu nombre o alias.');
      return;
    }
    if (dni && !/^\d{8}$/.test(dni)) {
      setError('El DNI debe tener 8 dígitos.');
      return;
    }
    setBusy(true);
    try {
      const trimmedName = displayName.trim();
      if (user.displayName !== trimmedName) {
        await updateProfile(user, { displayName: trimmedName });
      }
      await updateUserProfile(user.uid, {
        displayName: trimmedName,
        phone: phone.trim() || undefined,
        dni: dni.trim() || undefined,
        profileType,
      });
      await refreshProfile();
      router.back();
    } catch {
      setError('No se pudo guardar. Inténtalo nuevamente.');
    } finally {
      setBusy(false);
    }
  };

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
        <AppText style={styles.topBarTitle}>Editar perfil</AppText>
        <View style={styles.topBarSpacer} />
      </View>

      <KeyboardScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.card}>
          <AppText style={styles.label}>Nombre o alias</AppText>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Tu nombre o alias"
            placeholderTextColor="rgba(44, 44, 44, 0.4)"
            style={styles.input}
          />

          <AppText style={styles.label}>Teléfono</AppText>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Opcional"
            placeholderTextColor="rgba(44, 44, 44, 0.4)"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <AppText style={styles.label}>DNI</AppText>
          <TextInput
            value={dni}
            onChangeText={(value) => setDni(value.replace(/\D/g, '').slice(0, 8))}
            placeholder="Opcional, 8 dígitos"
            placeholderTextColor="rgba(44, 44, 44, 0.4)"
            keyboardType="number-pad"
            maxLength={8}
            style={styles.input}
          />

          <AppText style={styles.label}>Tipo de perfil</AppText>
          <View style={styles.typeRow}>
            {(['citizen', 'fisher'] as ProfileType[]).map((type) => {
              const active = profileType === type;
              return (
                <Pressable
                  key={type}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setProfileType(type)}
                  style={({ pressed }) => [
                    styles.typeButton,
                    active && styles.typeButtonActive,
                    pressed && styles.pressed,
                  ]}>
                  <AppText style={[styles.typeLabel, active && styles.typeLabelActive]}>
                    {type === 'citizen' ? 'Ciudadano' : 'Pescador'}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {!!error && <AppText style={styles.error}>{error}</AppText>}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={submit}
            style={({ pressed }) => [styles.submit, pressed && styles.pressed]}>
            <AppText style={styles.submitLabel}>{busy ? 'Guardando...' : 'Guardar cambios'}</AppText>
          </Pressable>
        </View>
      </KeyboardScrollView>
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
    maxWidth: 358,
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 8,
    ...shadow('subtle'),
  },
  label: {
    color: 'rgba(44, 44, 44, 0.6)',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(19, 78, 94, 0.25)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    backgroundColor: '#FAF6F1',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(19, 78, 94, 0.25)',
    borderRadius: 8,
    paddingVertical: 10,
  },
  typeButtonActive: {
    backgroundColor: BrandColors.primary,
  },
  typeLabel: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '600',
    includeFontPadding: false,
  },
  typeLabelActive: {
    color: BrandColors.tertiary,
  },
  error: {
    color: '#B42318',
    fontFamily: Fonts.body,
    fontSize: 13,
    marginTop: 4,
    includeFontPadding: false,
  },
  submit: {
    alignItems: 'center',
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 14,
    backgroundColor: BrandColors.primary,
  },
  submitLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
  },
});
