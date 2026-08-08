import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { themeTransition } from '@admin/config/admin-theme';
import { useAdminTheme } from '@admin/theme/context';
import { useWallet } from '@admin/presentation/hooks/useWallet';

type AdminHeaderProps = {
  title: string;
};

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { mode, toggle } = useAdminTheme();
  const { account, connecting, error, installed, onArbitrumSepolia, connect, switchNetwork } = useWallet();
  const isDark = mode === 'dark';

  const headerBg = isDark ? '#0A0A0A' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(19,78,94,0.12)';
  const textColor = isDark ? '#E2E8F0' : '#1A1A1A';
  const mutedColor = isDark ? '#94A3B8' : 'rgba(26,26,26,0.65)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(19,78,94,0.06)';

  const networkColor = onArbitrumSepolia ? '#16A34A' : '#D97706';
  const networkBg = onArbitrumSepolia ? 'rgba(22,163,74,0.12)' : 'rgba(217,119,6,0.12)';
  const networkLabel = onArbitrumSepolia ? 'Arb Sepolia' : 'Cambiar red';

  return (
    <View style={[styles.topbar, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
      <Text style={[styles.topbarTitle, { color: textColor }]}>{title}</Text>
      <View style={styles.actions}>
        {!installed ? (
          <Text style={[styles.mutedNote, { color: mutedColor }]}>MetaMask no detectado</Text>
        ) : account ? (
          <>
            <Pressable
              onPress={onArbitrumSepolia ? undefined : switchNetwork}
              disabled={onArbitrumSepolia}
              style={[styles.networkBtn, { backgroundColor: networkBg, borderColor: borderColor }]}
              accessibilityLabel={networkLabel}
            >
              <View style={[styles.dot, { backgroundColor: networkColor }]} />
              <Text style={[styles.walletLabel, { color: textColor }]}>{networkLabel}</Text>
            </Pressable>
            <View style={[styles.walletBtn, { borderColor: borderColor }]}>
              <FontAwesome5 name="wallet" size={13} color={mutedColor} solid />
              <Text style={[styles.walletLabel, { color: textColor }]}>{shortenAddress(account)}</Text>
            </View>
          </>
        ) : (
          <Pressable
            onPress={connect}
            disabled={connecting}
            style={({ hovered }) => [
              styles.walletBtn,
              { borderColor: borderColor },
              hovered && { backgroundColor: hoverBg },
            ]}
            accessibilityLabel="Conectar wallet"
          >
            <FontAwesome5 name="wallet" size={13} color={mutedColor} solid />
            <Text style={[styles.walletLabel, { color: textColor }]}>
              {connecting ? 'Conectando...' : 'Conectar wallet'}
            </Text>
          </Pressable>
        )}
        {error ? (
          <Text style={styles.errorText} numberOfLines={1}>
            {error}
          </Text>
        ) : null}
        <Pressable
          onPress={toggle}
          style={({ hovered }) => [
            styles.toggleBtn,
            { borderColor: borderColor },
            hovered && { backgroundColor: hoverBg },
          ]}
          accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          <FontAwesome5 name={isDark ? 'sun' : 'moon'} size={16} color={mutedColor} solid />
          <Text style={[styles.toggleLabel, { color: textColor }]}>
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </Text>
        </Pressable>
      </View>
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
    gap: Spacing.three,
  },
  topbarTitle: {
    ...themeTransition,
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  networkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two - 2,
    cursor: 'pointer',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two - 2,
    cursor: 'pointer',
  },
  walletLabel: {
    ...themeTransition,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '600',
  },
  mutedNote: {
    ...themeTransition,
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  errorText: {
    ...themeTransition,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#DC2626',
    maxWidth: 220,
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
