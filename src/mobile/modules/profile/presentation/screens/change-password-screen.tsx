import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { KeyboardScrollView } from '@/shared/components/keyboard-scroll-view';
import { changePassword } from '@/shared/firebase/auth';
import { useAuth } from '@/shared/firebase/auth-context';
import { shadow } from '@/shared/utils/shadows';

const backIcon: SymbolName = { ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' };

export function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!user) {
      Alert.alert('Inicia sesión', 'Para cambiar tu contraseña inicia sesión con tu cuenta.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ir a iniciar sesión', onPress: () => router.replace('/mobile/login') },
      ]);
      return;
    }
    if (next.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (next !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setBusy(true);
    try {
      await changePassword(current, next);
      Alert.alert('Listo', 'Tu contraseña se actualizó correctamente.', [
        { text: 'Aceptar', onPress: () => router.back() },
      ]);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'No se pudo cambiar la contraseña.');
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
        <AppText style={styles.topBarTitle}>Cambiar contraseña</AppText>
        <View style={styles.topBarSpacer} />
      </View>

      <KeyboardScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.card}>
          <AppText style={styles.label}>Contraseña actual</AppText>
          <TextInput
            value={current}
            onChangeText={setCurrent}
            secureTextEntry
            placeholder="Tu contraseña actual"
            placeholderTextColor="rgba(44, 44, 44, 0.4)"
            style={styles.input}
          />

          <AppText style={styles.label}>Nueva contraseña</AppText>
          <TextInput
            value={next}
            onChangeText={setNext}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="rgba(44, 44, 44, 0.4)"
            style={styles.input}
          />

          <AppText style={styles.label}>Confirmar nueva contraseña</AppText>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholder="Repite la nueva contraseña"
            placeholderTextColor="rgba(44, 44, 44, 0.4)"
            style={styles.input}
          />

          {!!error && <AppText style={styles.error}>{error}</AppText>}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={submit}
            style={({ pressed }) => [styles.submit, pressed && styles.pressed]}>
            <AppText style={styles.submitLabel}>{busy ? 'Cambiando...' : 'Cambiar contraseña'}</AppText>
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
