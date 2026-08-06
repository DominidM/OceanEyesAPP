import React from 'react';
import {StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';

import type { BanVerdict } from '@/shared/identity/ban-context';

const COLORS = {
  background: '#EFEBE3',
  icon: '#134E5E',
  title: '#2C2C2C',
  body: 'rgba(44, 44, 44, 0.7)',
} as const;

const MESSAGES: Record<Exclude<BanVerdict, 'ok' | 'checking'>, { title: string; body: string }> = {
  account_suspended: {
    title: 'Cuenta suspendida',
    body: 'Tu cuenta fue suspendida por incumplir las normas de la comunidad.',
  },
  device_banned: {
    title: 'Dispositivo bloqueado',
    body: 'Este dispositivo no puede enviar reportes.',
  },
};

export function BlockScreen({ verdict, reason }: { verdict: Exclude<BanVerdict, 'ok' | 'checking'>; reason: string | null }) {
  const message = MESSAGES[verdict];

  return (
    <View style={styles.screen}>
      <View style={styles.iconCircle}>
        <AppSymbol name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }} color="#FFFFFF" size={36} />
      </View>
      <AppText style={styles.title}>{message.title}</AppText>
      <AppText style={styles.body}>{reason ?? message.body}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
    backgroundColor: COLORS.background,
  },
  iconCircle: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.icon,
    borderRadius: 9999,
  },
  title: {
    color: COLORS.title,
    fontFamily: Fonts.label,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.36,
    textAlign: 'center',
    includeFontPadding: false,
  },
  body: {
    color: COLORS.body,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
