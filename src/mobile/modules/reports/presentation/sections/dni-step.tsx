import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { shadow } from '@/shared/utils/shadows';

import { ConsentCheckbox } from '../components/consent-checkbox';
import { DniInput } from '../components/dni-input';
import { ReportFlowColors as C } from '../theme';

type DniStepProps = {
  dni: string;
  onDniChange: (value: string) => void;
  hasDni?: boolean;
  guest?: boolean;
  consent: boolean;
  onConsentToggle: () => void;
  anonymous: boolean;
  onAnonymousToggle: () => void;
  canContinue: boolean;
  onContinue: () => void;
  onCancel: () => void;
};

const BODY_TEXT = 'Puedes reportar como ciudadano, pescador o voluntario. Tu identidad no se publicará en la incidencia.';
const CHECKBOX_LABEL = 'Acepto que mi ubicación se comparta con las autoridades para validar este reporte.';
const SECURITY_NOTE = 'Tu identidad queda protegida y separada del contenido del reporte.';
const GUEST_NOTE = 'Como invitado, tu reporte se envía de forma anónima. Se registra solo una huella anónima del dispositivo para prevenir reportes falsos.';

export function DniStep({
  dni,
  onDniChange,
  hasDni = false,
  guest = false,
  consent,
  onConsentToggle,
  anonymous,
  onAnonymousToggle,
  canContinue,
  onContinue,
  onCancel,
}: DniStepProps) {
  return (
    <View style={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroCircle}>
          <AppSymbol
            name={{ ios: 'camera.fill', android: 'photo-camera', web: 'photo-camera' }}
            color={C.heroIcon}
            size={40}
          />
        </View>
      </View>

      <Text style={styles.headline}>Reportar un incidente</Text>
      <Text style={styles.body}>{BODY_TEXT}</Text>

      <View style={styles.form}>
        {guest ? (
          <View style={styles.guestNote}>
            <AppSymbol name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} color={C.securityText} size={14} />
            <Text style={styles.guestNoteText}>{GUEST_NOTE}</Text>
          </View>
        ) : (
          <ConsentCheckbox checked={anonymous} onToggle={onAnonymousToggle} label="Enviar como reporte anónimo" />
        )}
        {!anonymous && !hasDni && <DniInput value={dni} onChangeText={onDniChange} />}
        <ConsentCheckbox checked={consent} onToggle={onConsentToggle} label={CHECKBOX_LABEL} />
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
          disabled={!canContinue}
          onPress={onContinue}
          style={({ pressed }) => [
            styles.primary,
            pressed && canContinue && styles.pressed,
            !canContinue && styles.primaryDisabled,
          ]}>
          <Text style={styles.primaryLabel}>Continuar</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={8} style={styles.secondary}>
          <Text style={styles.secondaryLabel}>Cancelar</Text>
        </Pressable>
      </View>

      <View style={styles.securityNote}>
        <AppSymbol name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} color={C.securityText} size={14} />
        <Text style={styles.securityText}>{SECURITY_NOTE}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'stretch',
    paddingHorizontal: 24,
    paddingTop: Spacing.four,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  heroCircle: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.heroCircle,
    borderRadius: 9999,
  },
  headline: {
    color: C.textStrong,
    fontFamily: Fonts.headline,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 35,
    textAlign: 'center',
    includeFontPadding: false,
    marginBottom: 8,
  },
  body: {
    color: C.textBody,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    includeFontPadding: false,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  guestNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(19, 78, 94, 0.06)',
    borderRadius: 10,
  },
  guestNoteText: {
    flex: 1,
    color: C.securityText,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    includeFontPadding: false,
  },
  actions: {
    gap: 16,
    marginTop: 40,
  },
  primary: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accent,
    borderRadius: 24,
    ...shadow('card'),
  },
  primaryDisabled: {
    opacity: C.disabledOpacity,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    includeFontPadding: false,
  },
  secondary: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    color: C.secondaryText,
    fontFamily: Fonts.body,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    includeFontPadding: false,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 32,
  },
  securityText: {
    flexShrink: 1,
    color: C.securityText,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
