import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';
import { SelectField } from './select-field';
import { REGIONS, PROVINCES_BY_REGION } from './peru-data';

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(String((data as { message?: string })?.message ?? 'Error al procesar la solicitud.'));
    (error as { code?: string }).code = (data as { code?: string })?.code;
    throw error;
  }
  return data as T;
}

const CONTACT_ROLES = [
  'Alcalde/sa',
  'Teniente alcalde',
  'Regidor/a',
  'Funcionario/a municipal',
  'Otro',
];

export function MunicipalityApplicationForm() {
  const { isMobile } = useBreakpoints();

  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const provinceOptions = region ? PROVINCES_BY_REGION[region] ?? [] : [];

  const handleRegionChange = (value: string) => {
    setRegion(value);
    setProvince('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim() || !region.trim() || !province.trim() || !email.trim() || password.length < 6) {
      setError('Completa nombre de la municipalidad, región, provincia, correo y una contraseña de al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const signup = await apiPost<{ idToken: string; localId: string }>('/api/auth/signup', {
        email: email.trim(),
        password,
      });
      try {
        await apiPost('/api/municipalities/apply', {
          idToken: signup.idToken,
          name: name.trim(),
          province: province.trim(),
          region: region.trim(),
          address: address.trim() || undefined,
          contactName: contactName.trim() || undefined,
          contactEmail: email.trim(),
          phone: phone.trim() || undefined,
          ownerUid: signup.localId,
        });
      } catch (err) {
        try {
          await apiPost('/api/auth/delete', { idToken: signup.idToken });
        } catch {
          // La cuenta queda sin perfil si el rollback falla; el error original se muestra.
        }
        throw err;
      }
      setSent(true);
    } catch (e: any) {
      const raw = e?.code || e?.message || String(e);
      if (raw === 'auth/email-already-in-use') {
        setError('Ese correo ya está registrado. Inicia sesión.');
      } else if (raw === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError(String(raw));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.section, isMobile && styles.sectionMobile]}>
      <View style={[styles.form, isMobile && styles.formMobile]}>
        {sent ? (
          <View style={styles.successCard}>
            <FontAwesome5 name="check-circle" size={48} color="#4ADE80" />
            <Text style={styles.successTitle}>Solicitud enviada</Text>
            <Text style={styles.successText}>
              Tu municipalidad se registró correctamente y quedó en revisión. Te notificaremos cuando el
              equipo de OceanEyes la active. Usá las credenciales creadas para ingresar a tu panel.
            </Text>
            <Pressable style={styles.btn} onPress={() => router.push('/admin/login')}>
              <Text style={styles.btnText}>Ir al panel</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={[styles.inlineFields, isMobile && styles.inlineFieldsMobile]}>
              <View style={[styles.field, styles.fieldFull]}>
                <Text style={styles.label}>Municipalidad *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej: Municipalidad Distrital de Pucusana"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                />
              </View>
            </View>

            <View style={[styles.inlineFields, isMobile && styles.inlineFieldsMobile]}>
              <View style={[styles.field, styles.fieldHalf]}>
                <SelectField
                  label="Región *"
                  value={region}
                  onChange={handleRegionChange}
                  options={REGIONS}
                  placeholder="Ej: Lima"
                />
              </View>
              <View style={[styles.field, styles.fieldHalf]}>
                <SelectField
                  label="Provincia *"
                  value={province}
                  onChange={setProvince}
                  options={provinceOptions}
                  placeholder={region ? 'Ej: Cañete' : 'Primero elegí región'}
                  disabled={!region}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Dirección (opcional)</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Plaza Principal s/n, distrito..."
                placeholderTextColor="rgba(0,0,0,0.35)"
              />
            </View>

            <View style={[styles.inlineFields, isMobile && styles.inlineFieldsMobile]}>
              <View style={[styles.field, styles.fieldHalf]}>
                <SelectField
                  label="Cargo del contacto"
                  value={contactName}
                  onChange={setContactName}
                  options={CONTACT_ROLES}
                  placeholder="Alcalde/sa, regidor/a…"
                />
              </View>
              <View style={[styles.field, styles.fieldHalf]}>
                <Text style={styles.label}>Teléfono (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+51 987 654 321"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Correo de la cuenta *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="municipio@correo.gob.pe"
                placeholderTextColor="rgba(0,0,0,0.35)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inlineFields, isMobile && styles.inlineFieldsMobile]}>
              <View style={[styles.field, styles.fieldHalf]}>
                <Text style={styles.label}>Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  secureTextEntry
                />
              </View>
              <View style={[styles.field, styles.fieldHalf]}>
                <Text style={styles.label}>Confirmar contraseña *</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repetí la contraseña"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  secureTextEntry
                />
              </View>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <FontAwesome5 name={loading ? 'spinner' : 'paper-plane'} size={14} color="#FFFFFF" />
              <Text style={styles.btnText}>{loading ? 'Enviando...' : 'Enviar solicitud'}</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    alignItems: 'center',
  },
  sectionMobile: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  form: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.five,
    gap: Spacing.four,
    borderTopWidth: 4,
    borderTopColor: BrandColors.secondary,
  },
  formMobile: {
    padding: Spacing.four,
  },
  successCard: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  successTitle: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  successText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: BrandColors.neutral,
    opacity: 0.72,
    textAlign: 'center',
    lineHeight: 24,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  inlineFieldsMobile: {
    flexDirection: 'column',
  },
  field: {
    gap: Spacing.two,
  },
  fieldHalf: {
    flex: 1,
  },
  fieldFull: {
    flex: 1,
  },
  label: {
    fontFamily: Fonts.headline,
    fontSize: 15,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  input: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: BrandColors.neutral,
    backgroundColor: BrandColors.tertiary,
    borderRadius: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: 999,
    marginTop: Spacing.two,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
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
});
