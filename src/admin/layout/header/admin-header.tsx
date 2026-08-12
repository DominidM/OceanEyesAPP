import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { themeTransition } from '@admin/config/admin-theme';
import { useAdminTheme } from '@admin/theme/context';
import { useWallet } from '@admin/presentation/hooks/useWallet';
import { useAuth } from '@/shared/firebase/auth-context';
import { ingestExternalAlerts } from '@/shared/adapters/external-alerts/ingestor';
import { evaluateAlertClusters } from '@/shared/firebase/alerts';

type AdminHeaderProps = {
  title: string;
};

function ExternalAlertPoller() {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [lastCount, setLastCount] = useState(0);
  const [extra, setExtra] = useState('');
  const [error, setError] = useState('');

  const poll = useCallback(async () => {
    if (!user) return;
    try {
      const { ingested } = await ingestExternalAlerts();
      const clusters = await evaluateAlertClusters();
      setLastRun(new Date());
      setLastCount(ingested + (clusters.promoted ? 1 : 0));
      setExtra(clusters.promoted ? '+1 clúster ciudadano' : '');
      setError('');
    } catch (e: any) {
      setError(e?.message ?? 'Error al consultar APIs externas');
    }
  }, [user]);

  useEffect(() => {
    void poll();
    intervalRef.current = setInterval(poll, 5 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [poll]);

  if (!lastRun && !error) return null;

  const iconName = error ? 'alert-circle-outline' : lastCount > 0 ? 'bell-ring-outline' : null;
  const iconColor = error ? '#DC2626' : lastCount > 0 ? '#16A34A' : '#0891B2';

  const label = error
    ? `${error}`
    : `${
        lastCount > 0
          ? `${lastCount} alerta(s) nueva(s) — ${lastRun?.toLocaleTimeString('es-PE')}`
          : `Sin alertas nuevas - ${lastRun?.toLocaleTimeString('es-PE')}`
      }${extra ? ` · ${extra}` : ''}`;

  return (
    <View style={styles.alertPill} accessibilityLabel={label}>
      {iconName ? <MaterialCommunityIcons name={iconName} size={14} color={iconColor} /> : null}
      <Text style={[styles.alertPillText, { color: iconColor }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

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
  const networkLabel = onArbitrumSepolia ? 'Arb Sepolia' : 'Cambiar red';

  return (
    <View style={[styles.topbar, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
      <Text style={[styles.topbarTitle, { color: textColor }]}>{title}</Text>
      <View style={styles.actions}>
        {!installed ? (
          <View style={[styles.walletMissing, { borderColor: borderColor }]}>
            <FontAwesome5 name="exclamation-triangle" size={12} color={mutedColor} solid />
            <Text style={[styles.walletMissingText, { color: mutedColor }]}>MetaMask no detectado</Text>
          </View>
        ) : (
          <Pressable
            onPress={account ? (onArbitrumSepolia ? undefined : switchNetwork) : connect}
            disabled={connecting}
            style={({ hovered }) => [
              account ? styles.walletChip : styles.walletConnectBtn,
              account
                ? { borderColor: borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(246,133,27,0.06)' }
                : { backgroundColor: hovered ? '#E2761B' : '#F6851B' },
            ]}
            accessibilityLabel={account ? (onArbitrumSepolia ? 'Wallet conectada' : 'Cambiar red') : 'Conectar wallet'}
          >
            <View style={[styles.walletAvatar, !account && styles.walletAvatarAlt]}>
              <FontAwesome5 name="ethereum" size={14} color={account ? '#FFFFFF' : '#F6851B'} />
            </View>
            {account ? (
              <View style={styles.walletInfo}>
                <View style={styles.walletStatusRow}>
                  <View style={[styles.dot, { backgroundColor: networkColor }]} />
                  <Text style={[styles.walletStatus, { color: networkColor }]}>{networkLabel}</Text>
                </View>
                <Text style={[styles.walletAddress, { color: textColor }]}>{shortenAddress(account)}</Text>
              </View>
            ) : (
              <Text style={styles.walletAction}>{connecting ? 'Conectando...' : 'Conectar wallet'}</Text>
            )}
          </Pressable>
        )}
        {error ? (
          <Text style={styles.errorText} numberOfLines={1}>
            {error}
          </Text>
        ) : null}
        <ExternalAlertPoller />
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two - 2,
    cursor: 'pointer',
  },
  walletConnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    borderRadius: 999,
    paddingHorizontal: Spacing.three + 2,
    paddingVertical: Spacing.two,
    boxShadow: '0 4px 14px rgba(246,133,27,0.35)',
    cursor: 'pointer',
  },
  walletAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F6851B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletAvatarAlt: {
    backgroundColor: '#FFFFFF',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  walletStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 1,
  },
  walletStatus: {
    ...themeTransition,
    fontFamily: Fonts.label,
    fontSize: 11,
    fontWeight: '600',
  },
  walletAddress: {
    ...themeTransition,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '600',
  },
  walletAction: {
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mutedNote: {
    ...themeTransition,
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  walletMissing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two - 2,
  },
  walletMissingText: {
    ...themeTransition,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    ...themeTransition,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#DC2626',
    maxWidth: 220,
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(8,145,178,0.2)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two - 2,
    backgroundColor: 'rgba(8,145,178,0.08)',
    maxWidth: 320,
  },
  alertPillText: {
    ...themeTransition,
    fontFamily: Fonts.label,
    fontSize: 11,
    fontWeight: '600',
    color: '#0891B2',
    flexShrink: 1,
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
