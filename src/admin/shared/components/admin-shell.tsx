import { router, usePathname } from 'expo-router';
import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

import { AdminNavItem, ADMIN_NAV } from '@admin/shared/config/admin-nav';

type AdminShellProps = PropsWithChildren<{
  title: string;
}>;

export function AdminShell({ children, title }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <View style={styles.shell}>
      <View style={styles.sidebar}>
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>OceanEyes</Text>
          <Text style={styles.brandSub}>Panel de administración</Text>
        </View>
        <View style={styles.nav}>
          {ADMIN_NAV.map((item) => (
            <NavItem key={item.key} item={item} active={!!item.href && pathname === item.href} />
          ))}
        </View>
      </View>
      <View style={styles.main}>
        <View style={styles.topbar}>
          <Text style={styles.topbarTitle}>{title}</Text>
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    </View>
  );
}

function NavItem({ item, active }: { item: AdminNavItem; active: boolean }) {
  if (!item.href) {
    return (
      <View style={styles.navItem}>
        <Text style={styles.navLabel}>{item.label}</Text>
        <Text style={styles.navSoon}>Pronto</Text>
      </View>
    );
  }

  return (
    <Pressable
      style={[styles.navItem, active && styles.navItemActive]}
      onPress={() => router.push(item.href!)}
    >
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: BrandColors.tertiary,
  },
  sidebar: {
    width: 240,
    backgroundColor: BrandColors.primary,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
  },
  brandBlock: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.five,
  },
  brand: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  brandSub: {
    color: BrandColors.secondary,
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
  },
  navItemActive: {
    backgroundColor: 'rgba(239, 235, 227, 0.14)',
  },
  navLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.82,
  },
  navLabelActive: {
    opacity: 1,
  },
  navSoon: {
    color: BrandColors.secondary,
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(19, 78, 94, 0.12)',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
  },
  topbarTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
    gap: Spacing.four,
    padding: Spacing.five,
  },
});
