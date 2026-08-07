import { router } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {Animated, Platform, Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { loginWithEmail, registerUser, signInAsGuest, signInWithGoogleIdToken } from '@/shared/firebase/auth';
import type { ProfileType } from '@/shared/firebase/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ToneButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** [estado base, estado presionado] */
  tone: readonly [string | number, string | number];
  /** 'backgroundColor' por defecto; 'opacity' para enlaces de texto */
  property?: 'backgroundColor' | 'opacity';
};

function ToneButton({ children, onPress, disabled, style, tone, property = 'backgroundColor' }: ToneButtonProps) {
  const progress = useRef(new Animated.Value(0)).current;

  const animate = useCallback(
    (toValue: number) => {
      Animated.timing(progress, { toValue, duration: 160, useNativeDriver: false }).start();
    },
    [progress],
  );

  const animatedStyle = useMemo(() => {
    const value = progress.interpolate({
      inputRange: [0, 1],
      outputRange:
        property === 'opacity'
          ? ([tone[0], tone[1]] as number[])
          : ([tone[0], tone[1]] as string[]),
    });
    return property === 'opacity' ? { opacity: value } : { backgroundColor: value };
  }, [progress, property, tone]);

  if (Platform.OS === 'web') {
    const pressedStyle: ViewStyle =
      property === 'opacity' ? { opacity: tone[1] as number } : { backgroundColor: tone[1] as string };
    return (
      <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [style, pressed && pressedStyle]}>
        {children}
      </Pressable>
    );
  }

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animate(1)}
      onPressOut={() => animate(0)}
      style={[style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}

export default function MobileLoginScreen() {
  const [registering, setRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('citizen');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [googleRequest, , promptGoogleAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

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

  const submitAsGuest = async () => {
    // Invitado: se crea una sesión anónima en Firebase (requiere habilitar el sign-in
    // anónimo en Firebase Auth). Si no está configurado o falla, se continúa localmente.
    if (isFirebaseConfigured()) {
      try {
        await signInAsGuest();
      } catch {
        // Sin sesión anónima: seguimos como invitado local.
      }
    }
    router.replace('/mobile');
  };

  // TEMPORAL: acceso directo al dashboard sin autenticación (solo dev).
  const temporaryEnter = () => router.replace('/mobile');

  const submitWithGoogle = async () => {
    setError('');
    if (!isFirebaseConfigured()) {
      setError('Firebase aún no está configurado. Completa el archivo .env.local.');
      return;
    }
    if (!googleRequest) {
      setError('Google Sign-In no está configurado. Revisa EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en el archivo .env.');
      return;
    }
    setBusy(true);
    try {
      const result = await promptGoogleAsync();
      if (result?.type !== 'success' || !result.params?.id_token) return;
      const user = await signInWithGoogleIdToken(result.params.id_token);
      if (user) router.replace('/mobile');
    } catch (e) {
      setError(
        e instanceof Error && e.message ? `Error: ${e.message}` : 'No se pudo iniciar sesión con Google. Inténtalo nuevamente.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppText style={styles.brand}>OceanEyes</AppText>
      <AppText style={styles.subtitle}>{registering ? 'Únete a la comunidad' : 'Protege el océano con nosotros'}</AppText>
      <View style={styles.card}>
        <AppText style={styles.title}>{registering ? 'Crear cuenta' : 'Iniciar sesión'}</AppText>
        {!registering && Platform.OS !== 'web' && (
          <>
            <ToneButton disabled={busy} onPress={submitWithGoogle} style={styles.googleButton} tone={['#FFFFFF', '#E9E5DF']}>
              <View style={styles.googleLogo}>
                <AppText style={styles.googleLogoText}>G</AppText>
              </View>
              <AppText style={styles.googleLabel}>Continuar con Google</AppText>
            </ToneButton>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText style={styles.dividerText}>o</AppText>
              <View style={styles.dividerLine} />
            </View>
          </>
        )}
        {registering && (
          <>
            <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Nombre o alias" style={styles.input} />
            <View style={styles.typeRow}>
              {(['citizen', 'fisher'] as ProfileType[]).map((type) => (
                <ToneButton
                  key={type}
                  onPress={() => setProfileType(type)}
                  style={[styles.typeButton, profileType === type && styles.typeButtonActive]}
                  tone={
                    profileType === type
                      ? (['#134E5E', '#0E3B47'] as const)
                      : (['rgba(19,78,94,0)', 'rgba(19,78,94,0.10)'] as const)
                  }>
                  <AppText style={[styles.typeLabel, profileType === type && styles.typeLabelActive]}>
                    {type === 'citizen' ? 'Ciudadano' : 'Pescador'}
                  </AppText>
                </ToneButton>
              ))}
            </View>
            <TextInput value={dni} onChangeText={(value) => setDni(value.replace(/\D/g, '').slice(0, 8))} keyboardType="number-pad" maxLength={8} placeholder="DNI (opcional, 8 dígitos)" style={styles.input} />
          </>
        )}
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Correo electrónico" style={styles.input} />
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Contraseña" style={styles.input} />
        {!!error && <AppText style={styles.error}>{error}</AppText>}
        <ToneButton disabled={busy} onPress={submit} style={styles.submit} tone={['#134E5E', '#0E3B47']}>
          <AppText style={styles.submitLabel}>{busy ? 'Procesando...' : registering ? 'Crear cuenta' : 'Entrar'}</AppText>
        </ToneButton>
        <ToneButton onPress={() => setRegistering((value) => !value)} tone={[1, 0.55]} property="opacity">
          <AppText style={styles.switchLabel}>{registering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</AppText>
        </ToneButton>
        <ToneButton
          disabled={busy}
          onPress={submitAsGuest}
          style={styles.guest}
          tone={['rgba(19,78,94,0)', 'rgba(19,78,94,0.12)']}>
          <AppText style={styles.guestLabel}>Continuar como invitado</AppText>
        </ToneButton>
        <ToneButton
          disabled={busy}
          onPress={temporaryEnter}
          style={styles.temporary}
          tone={['rgba(180,35,24,0.06)', 'rgba(180,35,24,0.16)']}>
          <AppText style={styles.temporaryLabel}>Entrar al dashboard (temporal)</AppText>
        </ToneButton>
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
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(19, 78, 94, 0.2)' },
  dividerText: { color: 'rgba(44, 44, 44, 0.5)', fontFamily: Fonts.body, fontSize: 12 },
  guest: { alignItems: 'center', borderWidth: 1, borderColor: 'rgba(19, 78, 94, 0.3)', borderRadius: 999, paddingVertical: Spacing.three },
  guestLabel: { color: BrandColors.primary, fontFamily: Fonts.label, fontWeight: '700' },
  temporary: { alignItems: 'center', borderWidth: 1, borderColor: '#B42318', borderStyle: 'dashed', borderRadius: 999, paddingVertical: Spacing.three },
  temporaryLabel: { color: '#B42318', fontFamily: Fonts.label, fontWeight: '700' },
});
