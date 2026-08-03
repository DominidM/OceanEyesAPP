import { router, usePathname } from 'expo-router';
import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { useAdminTheme } from '@admin/shared/theme/context';
import { AdminNavItem, ADMIN_NAV } from '@admin/shared/config/admin-nav';
import { logout } from '@/shared/firebase/auth';

type AdminShellProps = PropsWithChildren<{
  title: string;
}>;

export function AdminShell({ children, title }: AdminShellProps) {
  const pathname = usePathname();
  const { colors, mode, toggle } = useAdminTheme();

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  return (
    <View style={[styles.shell, { backgroundColor: colors.appBg }]}>
      <View style={[styles.sidebar, { backgroundColor: colors.sidebarBg }]}>
        <View style={styles.brandBlock}>
          <Text style={[styles.brand, { color: colors.sidebarText }]}>OceanEyes</Text>
          <Text style={[styles.brandSub, { color: colors.sidebarTextMuted }]}>Panel de administración</Text>
        </View>
        <View style={styles.nav}>
          {ADMIN_NAV.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              active={!!item.href && pathname === item.href}
              colors={colors}
            />
          ))}
        </View>
      </View>
      <View style={[styles.main, { backgroundColor: colors.contentBg }]}>
        <View style={[styles.topbar, { borderBottomColor: colors.topbarBorder }]}>
          <Text style={[styles.topbarTitle, { color: colors.contentText }]}>{title}</Text>
          <View style={styles.topbarActions}>
            <Pressable onPress={toggle} style={[styles.topBtn, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.topBtnLabel, { color: colors.contentText }]}>
                {mode === 'light' ? '🌙' : '☀️'}
              </Text>
            </Pressable>
            <Pressable onPress={handleLogout} style={[styles.topBtn, { borderColor: colors.dangerBg }]}>
              <Text style={[styles.topBtnLabel, { color: colors.danger }]}>Salir</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

function NavItem({
  item,
  active,
  colors,
}: {
  item: AdminNavItem;
  active: boolean;
  colors: ReturnType<typeof useAdminTheme>['colors'];
}) {
  if (!item.href) {
    return (
      <View style={styles.navItem}>
        <Text style={[styles.navLabel, { color: colors.sidebarText, opacity: 0.5 }]}>{item.label}</Text>
        <Text style={[styles.navSoon, { color: colors.sidebarTextMuted }]}>Pronto</Text>
      </View>
    );
  }

  return (
    <Pressable
      style={[styles.navItem, active && { backgroundColor: colors.sidebarActiveBg }]}
      onPress={() => router.push(item.href!)}
    >
      <Text style={[styles.navLabel, { color: colors.sidebarText, opacity: active ? 1 : 0.82 }]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    cursor: 'auto',
  },
  sidebar: {
    width: 240,
    paddingTop: Spacing.five,
  },
  brandBlock: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.five,
  },
  brand: {
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  brandSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  nav: {
    gap: Spacing.one,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three - 4,
    cursor: 'pointer',
  },
  navLabel: {
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: '600',
  },
  navSoon: {
    fontFamily: Fonts.label,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
  },
  topbarTitle: {
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  topbarActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  topBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    cursor: 'pointer',
  },
  topBtnLabel: {
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    gap: Spacing.four,
    padding: Spacing.five,
  },
});
