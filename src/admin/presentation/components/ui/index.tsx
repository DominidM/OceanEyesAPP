import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { useAdminTheme } from '@admin/theme/context';

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: Record<string, any>;
}) {
  const { colors } = useAdminTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useAdminTheme();
  return <Text style={[styles.title, { color: colors.contentText }]}>{children}</Text>;
}

type BadgeProps = {
  label: string;
  color: string;
  bg: string;
};

export function Badge({ label, color, bg }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: Record<string, any>;
};

export function Button({ label, onPress, variant = 'primary', style }: ButtonProps) {
  const { colors } = useAdminTheme();
  const { View: RNView, Pressable } = require('react-native');

  const variants: Record<ButtonVariant, { bg: string; border: string; text: string }> = {
    primary: { bg: colors.primary, border: colors.primary, text: colors.primaryText },
    secondary: { bg: 'transparent', border: colors.primary, text: colors.primary },
    danger: { bg: colors.dangerBg, border: colors.dangerBg, text: colors.danger },
  };
  const v = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.btn, { backgroundColor: v.bg, borderColor: v.border, borderWidth: variant === 'secondary' ? 1 : 0 }, style]}
    >
      <Text style={[styles.btnLabel, { color: v.text }]}>{label}</Text>
    </Pressable>
  );
}

export function KpiStat({ value, label, color }: { value: string | number; label: string; color?: string }) {
  const { colors } = useAdminTheme();
  return (
    <View style={[styles.kpi, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.kpiValue, { color: color ?? colors.primary }]}>{value}</Text>
      <Text style={[styles.kpiLabel, { color: colors.contentTextMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  badgeLabel: {
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
  },
  btn: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    cursor: 'pointer',
  },
  btnLabel: {
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
  },
  kpi: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  kpiValue: {
    fontFamily: Fonts.headline,
    fontSize: 32,
    fontWeight: '700',
  },
  kpiLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
  },
});
