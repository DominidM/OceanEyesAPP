import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { isGoogleSignInAvailable, isAppleSignInAvailable, loginWithEmail, registerUser, signInWithGoogle, signInWithApple, /* signInAsGuest */ } from '@/shared/firebase/auth';
import type { ProfileType } from '@/shared/firebase/types';

export default function MobileLoginScreen() {
  const [registering, setRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('citizen');
  const [dni, setDni] = useState('');
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
    if (registering && dni && !/^\d{8}$/.test(dni)) {
      setError('El DNI debe tener 8 dígitos.');
      return;
    }

    setBusy(true);
    try {
      if (registering) {
        await registerUser({ email: email.trim(), password, displayName: displayName.trim(), profileType, dni: dni || undefined });
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

  const submitAsGuest = () => {
    // Invitado sin Firebase: solo redirige al home.
    // await signInAsGuest();
    router.replace('/mobile');
  };

  const submitWithGoogle = async () => {
    setError('');
    if (!isFirebaseConfigured()) {
      setError('Firebase aún no está configurado. Completa el archivo .env.local.');
      return;
    }
    if (!isGoogleSignInAvailable()) {
      setError('Google Sign-In requiere una development build. Ejecuta npx expo run:ios o run:android.');
      return;
    }
    setBusy(true);
    try {
      const user = await signInWithGoogle();
      if (user) router.replace('/mobile');
    } catch (e) {
      setError(
        e instanceof Error && e.message ? `Error: ${e.message}` : 'No se pudo iniciar sesión con Google. Inténtalo nuevamente.',
      );
    } finally {
      setBusy(false);
    }
  };

  const submitWithApple = async () => {
    setError('');
    if (!isFirebaseConfigured()) {
      setError('Firebase aún no está configurado. Completa el archivo .env.local.');
      return;
    }
    const available = await isAppleSignInAvailable();
    if (!available) {
      setError('Sign in with Apple requiere una development build en iOS. Ejecuta npx expo run:ios.');
      return;
    }
    setBusy(true);
    try {
      const user = await signInWithApple();
      if (user) router.replace('/mobile');
    } catch {
      setError('No se pudo iniciar sesión con Apple. Inténtalo nuevamente.');
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
        {!registering && Platform.OS !== 'web' && (
          <>
            <Pressable disabled={busy} onPress={submitWithGoogle} style={styles.googleButton}>
              <View style={styles.googleLogo}>
                <Text style={styles.googleLogoText}>G</Text>
              </View>
              <Text style={styles.googleLabel}>Continuar con Google</Text>
            </Pressable>
            <Pressable disabled={busy} onPress={submitWithApple} style={styles.appleButton}>
              <View style={styles.appleLogo}>
                <Text style={styles.appleLogoText}></Text>
              </View>
              <Text style={styles.appleLabel}>Iniciar sesión con Apple</Text>
            </Pressable>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>
          </>
        )}
        {registering && (
          <>
            <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Nombre o alias" style={styles.input} />
            <View style={styles.typeRow}>
              {(['citizen', 'fisher'] as ProfileType[]).map((type) => (
                <Pressable key={type} onPress={() => setProfileType(type)} style={[styles.typeButton, profileType === type && styles.typeButtonActive]}>
                  <Text style={[styles.typeLabel, profileType === type && styles.typeLabelActive]}>
                    {type === 'citizen' ? 'Ciudadano' : 'Pescador'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput value={dni} onChangeText={(value) => setDni(value.replace(/\D/g, '').slice(0, 8))} keyboardType="number-pad" maxLength={8} placeholder="DNI (opcional, 8 dígitos)" style={styles.input} />
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
        <Pressable disabled={busy} onPress={submitAsGuest} style={styles.guest}>
          <Text style={styles.guestLabel}>Continuar como invitado</Text>
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
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(19, 78, 94, 0.3)', borderRadius: 999, paddingVertical: Spacing.three },
  googleLogo: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' },
  googleLogoText: { color: '#FFFFFF', fontFamily: Fonts.label, fontSize: 13, fontWeight: '700', lineHeight: 16 },
  googleLabel: { color: BrandColors.neutral, fontFamily: Fonts.label, fontWeight: '700' },
  appleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, backgroundColor: '#111111', borderRadius: 999, paddingVertical: Spacing.three },
  appleLogo: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  appleLogoText: { color: '#FFFFFF', fontFamily: Fonts.body, fontSize: 18, lineHeight: 20 },
  appleLabel: { color: '#FFFFFF', fontFamily: Fonts.label, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(19, 78, 94, 0.2)' },
  dividerText: { color: 'rgba(44, 44, 44, 0.5)', fontFamily: Fonts.body, fontSize: 12 },
  guest: { alignItems: 'center', borderWidth: 1, borderColor: 'rgba(19, 78, 94, 0.3)', borderRadius: 999, paddingVertical: Spacing.three },
  guestLabel: { color: BrandColors.primary, fontFamily: Fonts.label, fontWeight: '700' },
});
