import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

export type ZoneStatus = 'Activa' | 'En riesgo' | 'Monitoreo';

export type Zone = {
  name: string;
  description: string;
  status: ZoneStatus;
  coordinates: string;
  pendingReports: number;
};

const statusMeta: Record<ZoneStatus, { bg: string; color: string; icon: SymbolName }> = {
  Activa: {
    bg: '#D1FAE5',
    color: '#047857',
    icon: { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' },
  },
  'En riesgo': {
    bg: '#FEF3C7',
    color: '#B45309',
    icon: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  },
  Monitoreo: {
    bg: '#DBEAFE',
    color: '#1D4ED8',
    icon: { ios: 'eye.fill', android: 'visibility', web: 'visibility' },
  },
};

export function ZoneCard({ zone }: { zone: Zone }) {
  const status = statusMeta[zone.status];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{zone.name}</Text>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <AppSymbol name={status.icon} color={status.color} size={12} />
          <Text style={[styles.badgeText, { color: status.color }]}>{zone.status}</Text>
        </View>
      </View>

      <Text style={styles.description}>{zone.description}</Text>

      <View style={styles.footer}>
        <View style={styles.detailRow}>
          <AppSymbol
            name={{ ios: 'location.circle.fill', android: 'near_me', web: 'near_me' }}
            color={BrandColors.primary}
            size={13}
          />
          <Text style={styles.detailText}>{zone.coordinates}</Text>
        </View>
        <Text style={styles.pending}>{zone.pendingReports} pendientes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  badge: {
    height: 22,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontFamily: Fonts.label,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  description: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: 'rgba(44, 44, 44, 0.62)',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  pending: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
});
