import React, { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { themeTransition } from '@admin/config/admin-theme';
import { useAdminTheme } from '@admin/theme/context';
import { AdminSidebar } from './sidebar/admin-sidebar';
import { AdminHeader } from './header/admin-header';

type AdminShellProps = PropsWithChildren<{
  title: string;
}>;

export function AdminShell({ children, title }: AdminShellProps) {
  const { colors, mode } = useAdminTheme();
  const isDark = mode === 'dark';

  const chromeBg = isDark ? '#0A0A0A' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(19,78,94,0.12)';
  const chromeText = isDark ? 'rgba(226,232,240,0.55)' : 'rgba(26,26,26,0.65)';

  return (
    <View style={[styles.shell, { backgroundColor: colors.appBg }]}>
      <AdminSidebar />
      <View style={[styles.main, { backgroundColor: colors.contentBg }]}>
        <AdminHeader title={title} />
        <View style={[styles.breadcrumb, { backgroundColor: chromeBg, borderBottomColor: borderColor }]}>
          <Text style={[styles.breadcrumbText, { color: chromeText }]}>
            Panel / {title}
          </Text>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ gap: Spacing.four, paddingBottom: Spacing.five }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    ...themeTransition,
    flex: 1,
    flexDirection: 'row',
    cursor: 'auto',
  },
  main: {
    ...themeTransition,
    flex: 1,
    minWidth: 0,
  },
  breadcrumb: {
    ...themeTransition,
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
  },
  breadcrumbText: {
    ...themeTransition,
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  content: {
    flex: 1,
    gap: Spacing.four,
    padding: Spacing.five,
  },
});