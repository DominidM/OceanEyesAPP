import { router } from 'expo-router';
import { Image } from 'expo-image';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { loginWithEmail, rememberAdminSession } from '@/shared/firebase/auth';

const logoImg = require('../../../../assets/images/OCEAN-EYES-LOGO.png');

export function AdminLoginScreen() {
  const [email, setEmail] = useState('admin@oceaneyes.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setBusy(true);
    try {
      await loginWithEmail(email.trim(), password);
      rememberAdminSession(email.trim(), password);
      router.replace('/admin');
    } catch (e: any) {
      const msg = e?.code || e?.message || String(e);
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundImage: 'linear-gradient(180deg, #051F2D 0%, #0E3D52 35%, #134E5E 60%, #1A7F8A 85%, #22B0B8 100%)' }]}>
      <View style={styles.brandBlock}>
        <Image source={logoImg} style={styles.logo} contentFit="contain" />
        <View style={styles.brandText}>
          <Text style={styles.brand}>OceanEyes</Text>
          <Text style={styles.brandSub}>Panel de administración</Text>
        </View>
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
      </View>

      <View style={styles.bottomRow}>
        <Pressable onPress={() => router.push('/')} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={14} color={BrandColors.tertiary} />
          <Text style={styles.backLabel}>Volver al inicio</Text>
        </Pressable>
        <Text style={styles.footer}>OceanEyes · Gestión de vigilancia marina</Text>
      </View>
    </View>
  );
}

export default AdminLoginScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
    cursor: 'auto',
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  logo: {
    width: 36,
    height: 36,
    transform: [{ scale: 3.5 }, { translateY: 1 }],
  },
  brandText: {
    gap: Spacing.one,
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 440,
    marginTop: Spacing.four,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two - 2,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three - 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    cursor: 'pointer',
  },
  backLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '600',
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
    userSelect: 'auto',
    cursor: 'text',
  },
  submit: {
    alignItems: 'center',
    backgroundColor: BrandColors.primary,
    borderRadius: 999,
    marginTop: Spacing.one,
    paddingVertical: Spacing.three,
    cursor: 'pointer',
  },
  submitLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    color: '#B42318',
    fontFamily: Fonts.body,
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    color: 'rgba(255,255,255,0.60)',
    fontFamily: Fonts.body,
    fontSize: 13,
  },
});
