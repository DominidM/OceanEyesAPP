import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { loginWithEmail } from '@/shared/firebase/auth';

export function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!isFirebaseConfigured()) {
      setError('Firebase aún no está configurado.');
      return;
    }
    setBusy(true);
    try {
      await loginWithEmail(email.trim(), password);
      router.replace('/admin');
    } catch {
      setError('Credenciales inválidas o usuario sin permisos.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>OceanEyes</Text>
        <Text style={styles.brandSub}>Panel de administración</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>Acceso privado</Text>
        <Text style={styles.title}>Bienvenido de nuevo</Text>
        <Text style={styles.description}>
          Ingresa tus datos para administrar reportes, usuarios y recompensas.
        </Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="admin@oceaneyes.com"
              placeholderTextColor="rgba(44, 44, 44, 0.42)"
              style={styles.input}
              value={email}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="rgba(44, 44, 44, 0.42)"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          <Pressable onPress={handleSubmit} style={styles.submit}>
            <Text style={styles.submitLabel}>{busy ? 'Validando...' : 'Entrar al panel'}</Text>
          </Pressable>
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>

        <Text style={styles.demoNote}>Modo demostración: no se validan credenciales todavía.</Text>
      </View>

      <Text style={styles.footer}>OceanEyes · Gestión de vigilancia marina</Text>
    </View>
  );
}

export default AdminLoginScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
    padding: Spacing.five,
  },
  brandBlock: {
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.five,
  },
  brand: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.headline,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  brandSub: {
    color: BrandColors.secondary,
    fontFamily: Fonts.body,
    fontSize: 14,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: BrandColors.tertiary,
    borderRadius: 20,
    padding: Spacing.five,
  },
  eyebrow: {
    color: BrandColors.secondary,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    color: BrandColors.primary,
    fontFamily: Fonts.headline,
    fontSize: 30,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  description: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.two,
    opacity: 0.7,
  },
  form: {
    gap: Spacing.three,
    marginTop: Spacing.five,
  },
  field: {
    gap: Spacing.one,
  },
  label: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderColor: 'rgba(19, 78, 94, 0.2)',
    borderRadius: 10,
    borderWidth: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 15,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: BrandColors.primary,
    borderRadius: 999,
    marginTop: Spacing.one,
    paddingVertical: Spacing.three,
  },
  submitLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
  },
  demoNote: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: Spacing.four,
    opacity: 0.55,
    textAlign: 'center',
  },
  error: {
    color: '#B42318',
    fontFamily: Fonts.body,
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    color: BrandColors.secondary,
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: Spacing.five,
    opacity: 0.8,
  },
});
