import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {Animated, Keyboard, Platform, Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppSymbol, type SymbolName } from '@/shared/components/app-symbol';
import { KeyboardScrollView } from '@/shared/components/keyboard-scroll-view';
import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { canLinkAccount, isGoogleSignInAvailable, linkAccountWithEmail, linkAccountWithGoogle, loginWithEmail, registerUser, signInAsGuest, signInWithGoogle } from '@/shared/firebase/auth';
import { useViewModel } from '@/shared/viewmodels/use-view-model';
import { LoginViewModel } from '../viewmodels/login.viewmodel';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const eyeIcon: SymbolName = { ios: 'eye', android: 'visibility', web: 'visibility' };
const eyeOffIcon: SymbolName = { ios: 'eye.slash', android: 'visibility-off', web: 'visibility-off' };

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
  const [showPassword, setShowPassword] = useState(false);
  const [vm, state] = useViewModel(
    () =>
      new LoginViewModel({
        isFirebaseConfigured,
        isGoogleSignInAvailable,
        canLinkAccount,
        loginWithEmail,
        registerUser,
        linkAccountWithEmail,
        linkAccountWithGoogle,
        signInAsGuest,
        signInWithGoogle,
        onAuthenticated: () => router.replace('/mobile'),
      }),
    {
      isFirebaseConfigured,
      isGoogleSignInAvailable,
      canLinkAccount,
      loginWithEmail,
      registerUser,
      linkAccountWithEmail,
      linkAccountWithGoogle,
      signInAsGuest,
      signInWithGoogle,
      onAuthenticated: () => router.replace('/mobile'),
    },
  );

  return (
    <View style={styles.screen}>
      <KeyboardScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}>
      <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} accessibilityRole="none" />
      <AppText style={styles.brand}>OceanEyes</AppText>
      <AppText style={styles.subtitle}>
        {state.linking ? 'Conserva tu progreso como invitado' : state.registering ? 'Únete a la comunidad' : 'Protege el océano con nosotros'}
      </AppText>
      <View style={styles.card}>
        <AppText style={styles.title}>{state.linking ? 'Vincular cuenta' : state.registering ? 'Crear cuenta' : 'Iniciar sesión'}</AppText>
        {state.linking && Platform.OS !== 'web' && (
          <>
            <ToneButton disabled={state.busy} onPress={() => void vm.submitWithGoogleLink()} style={styles.googleButton} tone={['#FFFFFF', '#E9E5DF']}>
              <View style={styles.googleLogo}>
                <AppText style={styles.googleLogoText}>G</AppText>
              </View>
              <AppText style={styles.googleLabel}>Vincular con Google</AppText>
            </ToneButton>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText style={styles.dividerText}>o</AppText>
              <View style={styles.dividerLine} />
            </View>
          </>
        )}
        {!state.linking && !state.registering && Platform.OS !== 'web' && (
          <>
            <ToneButton
              disabled={state.busy}
              onPress={() => void (canLinkAccount() ? vm.submitWithGoogleLink() : vm.submitWithGoogle())}
              style={styles.googleButton}
              tone={['#FFFFFF', '#E9E5DF']}>
              <View style={styles.googleLogo}>
                <AppText style={styles.googleLogoText}>G</AppText>
              </View>
              <AppText style={styles.googleLabel}>{canLinkAccount() ? 'Vincular con Google' : 'Continuar con Google'}</AppText>
            </ToneButton>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText style={styles.dividerText}>o</AppText>
              <View style={styles.dividerLine} />
            </View>
          </>
        )}
        {(state.registering || state.linking) && (
          <>
            <TextInput value={state.displayName} onChangeText={vm.setDisplayName} placeholder="Nombre o alias" style={styles.input} />
            <View style={styles.typeRow}>
              {(['citizen', 'fisher'] as const).map((type) => (
                <ToneButton
                  key={type}
                  onPress={() => vm.setProfileType(type)}
                  style={[styles.typeButton, state.profileType === type && styles.typeButtonActive]}
                  tone={
                    state.profileType === type
                      ? (['#134E5E', '#0E3B47'] as const)
                      : (['rgba(19,78,94,0)', 'rgba(19,78,94,0.10)'] as const)
                  }>
                  <AppText style={[styles.typeLabel, state.profileType === type && styles.typeLabelActive]}>
                    {type === 'citizen' ? 'Ciudadano' : 'Pescador'}
                  </AppText>
                </ToneButton>
              ))}
            </View>
            <TextInput value={state.dni} onChangeText={vm.setDni} keyboardType="number-pad" maxLength={8} placeholder="DNI (opcional, 8 dígitos)" style={styles.input} />
          </>
        )}
        <TextInput value={state.email} onChangeText={vm.setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Correo electrónico" style={styles.input} />
        <View style={styles.passwordWrap}>
          <TextInput
            value={state.password}
            onChangeText={vm.setPassword}
            secureTextEntry={!showPassword}
            placeholder="Contraseña"
            style={[styles.input, styles.inputPassword]}
          />
          <Pressable
            onPress={() => setShowPassword((value) => !value)}
            style={styles.passwordEye}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            <AppSymbol name={showPassword ? eyeOffIcon : eyeIcon} color={BrandColors.primary} size={20} />
          </Pressable>
        </View>
        {!!state.error && <AppText style={styles.error}>{state.error}</AppText>}
        <ToneButton
          disabled={state.busy}
          onPress={() => void (state.linking ? vm.submitLink() : vm.submit())}
          style={styles.submit}
          tone={['#134E5E', '#0E3B47']}>
          <AppText style={styles.submitLabel}>
            {state.busy ? 'Procesando...' : state.linking ? 'Vincular cuenta' : state.registering ? 'Crear cuenta' : 'Entrar'}
          </AppText>
        </ToneButton>
        {state.linking ? (
          <ToneButton onPress={vm.cancelLinking} tone={[1, 0.55]} property="opacity">
            <AppText style={styles.switchLabel}>Volver</AppText>
          </ToneButton>
        ) : (
          <ToneButton onPress={vm.toggleRegistering} tone={[1, 0.55]} property="opacity">
            <AppText style={styles.switchLabel}>{state.registering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</AppText>
          </ToneButton>
        )}
        {!state.linking && (
          <ToneButton
            disabled={state.busy}
            onPress={() => void vm.submitAsGuest()}
            style={styles.guest}
            tone={['rgba(19,78,94,0)', 'rgba(19,78,94,0.12)']}>
            <AppText style={styles.guestLabel}>Continuar como invitado</AppText>
          </ToneButton>
        )}
        {canLinkAccount() && !state.linking && !state.registering && (
          <ToneButton
            disabled={state.busy}
            onPress={vm.startLinking}
            style={styles.guest}
            tone={['rgba(19,78,94,0)', 'rgba(19,78,94,0.12)']}>
            <AppText style={styles.guestLabel}>Vincular cuenta para conservar tus puntos</AppText>
          </ToneButton>
        )}
      </View>
      </KeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BrandColors.primary, padding: Spacing.five },
  scroll: { flex: 1, width: '100%' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.four },
  brand: { color: BrandColors.tertiary, fontFamily: Fonts.headline, fontSize: 34, fontWeight: '700' },
  subtitle: { color: BrandColors.secondary, fontFamily: Fonts.body, fontSize: 15, marginTop: Spacing.one },
  card: { width: '100%', maxWidth: 420, gap: Spacing.three, backgroundColor: BrandColors.tertiary, borderRadius: 20, marginTop: Spacing.five, padding: Spacing.five },
  title: { color: BrandColors.primary, fontFamily: Fonts.headline, fontSize: 28, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: 'rgba(19, 78, 94, 0.2)', borderRadius: 10, padding: Spacing.three, color: BrandColors.neutral, fontFamily: Fonts.body },
  passwordWrap: { position: 'relative' },
  inputPassword: { paddingRight: 40 },
  passwordEye: { position: 'absolute', right: Spacing.two, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: Spacing.two },
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
});
