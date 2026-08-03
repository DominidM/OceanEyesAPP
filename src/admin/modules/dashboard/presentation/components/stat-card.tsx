import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { useAdminTheme } from '@admin/shared/theme/context';

type StatCardProps = {
  label: string;
  value: string;
  accent?: string;
};

export function StatCard({ label, value, accent }: StatCardProps) {
  const { colors } = useAdminTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.value, { color: accent ?? colors.primary }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.contentText, opacity: 0.65 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 200,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.one,
    padding: Spacing.four,
  },
  value: {
    fontFamily: Fonts.headline,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: 14,
  },
});
