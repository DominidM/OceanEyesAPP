import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

import { AdminShell } from '@admin/shared/components/admin-shell';

export function ReportsScreen() {
  return (
    <AdminShell title="Reportes">
      <View style={styles.empty}>
        <Text style={styles.title}>Gestión de reportes</Text>
        <Text style={styles.subtitle}>
          Aquí aparecerá la moderación y verificación de los reportes de la comunidad.
        </Text>
      </View>
    </AdminShell>
  );
}

export default ReportsScreen;

const styles = StyleSheet.create({
  empty: {
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  title: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.72,
    maxWidth: 480,
  },
});
