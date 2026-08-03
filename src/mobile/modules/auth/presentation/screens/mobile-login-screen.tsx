import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { loginWithEmail, registerUser } from '@/shared/firebase/auth';
import type { ProfileType } from '@/shared/firebase/types';

export default function MobileLoginScreen() {
  const [registering, setRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!isFirebaseConfigured()) {
      setError('Firebase aún no está configurado. Completa el archivo .env.local.');
      return;
    }
    if (registering && !displayName.trim()) {
      setError('Ingresa tu nombre o alias.');
      return;
    }

    setBusy(true);
    try {
      if (registering) {
        await registerUser({ email: email.trim(), password, displayName: displayName.trim(), profileType });
      } else {
        await loginWithEmail(email.trim(), password);
      }
      router.replace('/mobile');
    } catch {
      setError('No se pudo completar el acceso. Revisa tus datos e inténtalo nuevamente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.brand}>OceanEyes</Text>
      <Text style={styles.subtitle}>{registering ? 'Únete a la comunidad' : 'Protege el océano con nosotros'}</Text>
      <View style={styles.card}>
        <Text style={styles.title}>{registering ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
        {registering && (
          <>
            <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Nombre o alias" style={styles.input} />
            <View style={styles.typeRow}>
              {(['citizen', 'fisher', 'other'] as ProfileType[]).map((type) => (
                <Pressable key={type} onPress={() => setProfileType(type)} style={[styles.typeButton, profileType === type && styles.typeButtonActive]}>
                  <Text style={[styles.typeLabel, profileType === type && styles.typeLabelActive]}>
                    {type === 'citizen' ? 'Ciudadano' : type === 'fisher' ? 'Pescador' : 'Otro'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Correo electrónico" style={styles.input} />
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Contraseña" style={styles.input} />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable disabled={busy} onPress={submit} style={styles.submit}>
          <Text style={styles.submitLabel}>{busy ? 'Procesando...' : registering ? 'Crear cuenta' : 'Entrar'}</Text>
        </Pressable>
        <Pressable onPress={() => setRegistering((value) => !value)}>
          <Text style={styles.switchLabel}>{registering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BrandColors.primary, padding: Spacing.five },
  brand: { color: BrandColors.tertiary, fontFamily: Fonts.headline, fontSize: 34, fontWeight: '700' },
  subtitle: { color: BrandColors.secondary, fontFamily: Fonts.body, fontSize: 15, marginTop: Spacing.one },
  card: { width: '100%', maxWidth: 420, gap: Spacing.three, backgroundColor: BrandColors.tertiary, borderRadius: 20, marginTop: Spacing.five, padding: Spacing.five },
  title: { color: BrandColors.primary, fontFamily: Fonts.headline, fontSize: 28, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: 'rgba(19, 78, 94, 0.2)', borderRadius: 10, padding: Spacing.three, color: BrandColors.neutral, fontFamily: Fonts.body },
  typeRow: { flexDirection: 'row', gap: Spacing.one },
  typeButton: { flex: 1, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(19, 78, 94, 0.2)', borderRadius: 8, paddingVertical: Spacing.two },
  typeButtonActive: { backgroundColor: BrandColors.primary },
  typeLabel: { color: BrandColors.neutral, fontFamily: Fonts.body, fontSize: 12 },
  typeLabelActive: { color: BrandColors.tertiary },
  error: { color: '#B42318', fontFamily: Fonts.body, fontSize: 13 },
  submit: { alignItems: 'center', backgroundColor: BrandColors.primary, borderRadius: 999, paddingVertical: Spacing.three },
  submitLabel: { color: BrandColors.tertiary, fontFamily: Fonts.label, fontWeight: '700' },
  switchLabel: { color: BrandColors.primary, fontFamily: Fonts.body, textAlign: 'center' },
});
