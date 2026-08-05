import React, { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { themeTransition } from '@admin/config/admin-theme';
import { useAdminTheme } from '@admin/theme/context';
import { AdminSidebar } from './sidebar/admin-sidebar';
import { AdminHeader } from './header/admin-header';

type AdminShellProps = PropsWithChildren<{
  title: string;
  breadcrumb?: { label: string; href?: string }[];
}>;

export function AdminShell({ children, title, breadcrumb }: AdminShellProps) {
  const { colors, mode } = useAdminTheme();
  const router = useRouter();
  const isDark = mode === 'dark';

  const chromeBg = isDark ? '#0A0A0A' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(19,78,94,0.12)';
  const chromeText = isDark ? 'rgba(226,232,240,0.55)' : 'rgba(26,26,26,0.65)';
  const chromeStrong = isDark ? '#E2E8F0' : '#1A1A1A';

  return (
    <View style={[styles.shell, { backgroundColor: colors.appBg }]}>
      <AdminSidebar />
      <View style={[styles.main, { backgroundColor: colors.contentBg }]}>
        <AdminHeader title={title} />
        <View style={[styles.breadcrumb, { backgroundColor: chromeBg, borderBottomColor: borderColor }]}>
          <Pressable onPress={() => router.push('/admin')} style={styles.breadcrumbLink}>
            <FontAwesome5 name="home" size={12} color={chromeText} />
            <Text style={[styles.breadcrumbText, { color: chromeText }]}>Panel</Text>
          </Pressable>
          <Text style={[styles.breadcrumbSep, { color: chromeText }]}>›</Text>
          {breadcrumb?.length
            ? breadcrumb.map((crumb, i) => {
                const isLast = i === breadcrumb.length - 1;
                return (
                  <React.Fragment key={`${crumb.label}-${i}`}>
                    {isLast ? (
                      <Text style={[styles.breadcrumbCurrent, { color: chromeStrong }]}>{crumb.label}</Text>
                    ) : (
                      <Pressable
                        onPress={crumb.href ? () => router.push(crumb.href!) : undefined}
                        style={styles.breadcrumbLink}
                      >
                        <Text style={[styles.breadcrumbText, { color: chromeText }]}>{crumb.label}</Text>
                      </Pressable>
                    )}
                    {!isLast && <Text style={[styles.breadcrumbSep, { color: chromeText }]}>›</Text>}
                  </React.Fragment>
                );
              })
            : <Text style={[styles.breadcrumbCurrent, { color: chromeStrong }]}>{title}</Text>}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
  },
  breadcrumbLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two - 2,
    paddingVertical: 2,
    paddingHorizontal: Spacing.one,
    borderRadius: 6,
    cursor: 'pointer',
  },
  breadcrumbText: {
    ...themeTransition,
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  breadcrumbSep: {
    fontFamily: Fonts.body,
    fontSize: 14,
    marginHorizontal: -2,
  },
  breadcrumbCurrent: {
    ...themeTransition,
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    gap: Spacing.four,
    padding: Spacing.five,
  },
});