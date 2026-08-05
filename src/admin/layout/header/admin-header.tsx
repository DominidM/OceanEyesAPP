import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { themeTransition } from '@admin/config/admin-theme';
import { useAdminTheme } from '@admin/theme/context';

type AdminHeaderProps = {
  title: string;
};

export function AdminHeader({ title }: AdminHeaderProps) {
  const { mode, toggle } = useAdminTheme();
  const isDark = mode === 'dark';

  const headerBg = isDark ? '#0A0A0A' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(19,78,94,0.12)';
  const textColor = isDark ? '#E2E8F0' : '#1A1A1A';
  const mutedColor = isDark ? '#94A3B8' : 'rgba(26,26,26,0.65)';

  return (
    <View style={[styles.topbar, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
      <Text style={[styles.topbarTitle, { color: textColor }]}>{title}</Text>
      <Pressable
        onPress={toggle}
        style={({ hovered }) => [
          styles.toggleBtn,
          { borderColor: borderColor },
          hovered && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(19,78,94,0.06)' },
        ]}
        accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        <FontAwesome5 name={isDark ? 'sun' : 'moon'} size={16} color={mutedColor} solid />
        <Text style={[styles.toggleLabel, { color: textColor }]}>
          {isDark ? 'Modo claro' : 'Modo oscuro'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    ...themeTransition,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  topbarTitle: {
    ...themeTransition,
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  toggleBtn: {
    ...themeTransition,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two - 2,
    cursor: 'pointer',
  },
  toggleLabel: {
    ...themeTransition,
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '600',
  },
});