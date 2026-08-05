import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AdminShell } from '@admin/layout/admin-shell';
import { Button, Card, SectionHeader } from '@admin/presentation/components/ui';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { createUserByAdmin } from '@/shared/firebase/auth';
import type { ProfileType } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';

export function UsersNewScreen() {
  const { colors } = useAdminTheme();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dni, setDni] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('citizen');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!displayName.trim() || !email.trim() || password.length < 6) {
      setError('Completa nombre, correo y una contraseña de al menos 6 caracteres.');
      return;
    }
    setBusy(true);
    try {
      await createUserByAdmin({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        profileType,
        dni: dni.trim() || undefined,
      });
      setSuccess(`Usuario ${displayName.trim()} creado correctamente.`);
      setDisplayName('');
      setEmail('');
      setPassword('');
      setDni('');
    } catch (e: any) {
      const raw = e?.code || e?.message || String(e);
      setError(raw === 'auth/email-already-in-use' ? 'Ese correo ya está registrado.' : raw);
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = [
    styles.input,
    { borderColor: colors.inputBorder, color: colors.inputText, backgroundColor: colors.inputBg },
  ];

  const typeOption = (value: ProfileType, label: string) => {
    const selected = profileType === value;
    return (
      <Pressable
        key={value}
        onPress={() => setProfileType(value)}
        style={[
          styles.typeBtn,
          { borderColor: selected ? colors.primary : colors.inputBorder },
          selected && { backgroundColor: colors.inputBg },
        ]}
      >
        <Text style={[styles.typeLabel, { color: selected ? colors.primary : colors.contentTextMuted }]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <AdminShell title="Nuevo usuario" breadcrumb={[{ label: 'Usuarios', href: '/admin/users' }, { label: 'Nuevo' }]}>
      <SectionHeader
        title="Crear usuario"
        subtitle="Registra una cuenta para un pescador o ciudadano."
      />

      <Card style={styles.card}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.contentTextMuted }]}>Nombre completo</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={setDisplayName}
              placeholder="Ej. María Quispe"
              placeholderTextColor={colors.contentTextMuted}
              style={inputStyle}
              value={displayName}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.contentTextMuted }]}>Correo electrónico</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="usuario@correo.com"
              placeholderTextColor={colors.contentTextMuted}
              style={inputStyle}
              value={email}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.contentTextMuted }]}>Contraseña</Text>
            <TextInput
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.contentTextMuted}
              secureTextEntry
              style={inputStyle}
              value={password}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.contentTextMuted }]}>DNI (opcional)</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setDni}
              placeholder="12345678"
              placeholderTextColor={colors.contentTextMuted}
              style={inputStyle}
              value={dni}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.contentTextMuted }]}>Tipo de perfil</Text>
            <View style={styles.typeRow}>
              {typeOption('citizen', 'Ciudadano')}
              {typeOption('fisher', 'Pescador')}
            </View>
          </View>

          <View style={styles.actions}>
            <Button label={busy ? 'Creando...' : 'Crear usuario'} onPress={handleSubmit} />
            <Button label="Cancelar" variant="secondary" onPress={() => router.push('/admin/users')} />
          </View>

          {!!error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
          {!!success && <Text style={[styles.success, { color: colors.success }]}>{success}</Text>}
        </View>
      </Card>
    </AdminShell>
  );
}

export default UsersNewScreen;

const styles = StyleSheet.create({
  card: { maxWidth: 480 },
  form: { gap: Spacing.three },
  field: { gap: Spacing.one },
  label: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    fontFamily: Fonts.body,
    fontSize: 15,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    userSelect: 'auto',
    cursor: 'text',
  },
  typeRow: { flexDirection: 'row', gap: Spacing.two },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: Spacing.three,
    cursor: 'pointer',
  },
  typeLabel: { fontFamily: Fonts.label, fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  error: { fontFamily: Fonts.body, fontSize: 13, textAlign: 'center' },
  success: { fontFamily: Fonts.body, fontSize: 13, textAlign: 'center' },
});
