import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { ADMIN_NAV, AdminNavItem } from '@admin/config/admin-nav';
import { SIDEBAR_DARK } from '@admin/config/admin-theme';
import { logout } from '@/shared/firebase/auth';

const logoImg = require('../../../../assets/images/OCEAN-EYES-LOGO.png');

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <View style={[styles.sidebar, { backgroundColor: SIDEBAR_DARK.bg }]}>
      <View style={styles.brandBlock}>
        <View style={styles.brandRow}>
          <Image source={logoImg} style={styles.logo} contentFit="contain" />
          <View style={styles.brandText}>
            <Text style={[styles.brand, { color: SIDEBAR_DARK.text }]}>OceanEyes</Text>
            <Text style={[styles.brandSub, { color: SIDEBAR_DARK.textMuted }]}>Panel de administración</Text>
          </View>
        </View>
      </View>
      <View style={styles.nav}>
        {ADMIN_NAV.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={!!item.href && pathname === item.href}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ hovered }) => [
            styles.footerItem,
            hovered && { backgroundColor: SIDEBAR_DARK.activeBg },
            pathname === '/admin' && { backgroundColor: SIDEBAR_DARK.activeBg },
          ]}
          onPress={() => router.push('/admin')}
        >
          <View style={styles.navLabelRow}>
            <FontAwesome5 name="home" size={15} color={SIDEBAR_DARK.text} style={styles.navIcon} />
            <Text style={[styles.navLabel, { color: SIDEBAR_DARK.text }]}>Inicio</Text>
          </View>
        </Pressable>
        <Pressable
          style={({ hovered }) => [styles.footerItem, hovered && { backgroundColor: SIDEBAR_DARK.activeBg }]}
          onPress={async () => {
            await logout();
            router.replace('/admin/login');
          }}
        >
          <View style={styles.navLabelRow}>
            <FontAwesome5 name="sign-out-alt" size={15} color="#EF4444" style={styles.navIcon} />
            <Text style={[styles.navLabel, { color: '#EF4444' }]}>Salir</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function NavItem({ item, active }: { item: AdminNavItem; active: boolean }) {
  return (
    <Pressable
      style={[styles.navItem, active && { backgroundColor: SIDEBAR_DARK.activeBg }]}
      onPress={() => router.push(item.href!)}
    >
      <View style={styles.navLabelRow}>
        <FontAwesome5 name={item.icon} size={15} color={SIDEBAR_DARK.text} style={styles.navIcon} />
        <Text style={[styles.navLabel, { color: SIDEBAR_DARK.text, opacity: active ? 1 : 0.82 }]}>
          {item.label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    paddingTop: Spacing.five,
    flexDirection: 'column',
  },
  brandBlock: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.five,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 4,
  },
  logo: {
    width: 40,
    height: 40,
    transform: [{ scale: 3 }, { translateY: 2 }],
  },
  brandText: {
    flex: 1,
    gap: Spacing.half,
  },
  brand: {
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  brandSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
  },
  nav: {
    gap: Spacing.one,
    flex: 1,
  },
  footer: {
    gap: Spacing.one,
    paddingTop: Spacing.three,
    marginTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three - 4,
    cursor: 'pointer',
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
  navLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - 4,
  },
  navIcon: {
    width: 20,
  },
});
