import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { SurfaceColors } from '@/modules/reports/presentation/theme';
import { getIncidentType } from '@/modules/reports/presentation/incident-types';
import type { ReportCategory } from '@/shared/firebase/types';
import { shadow } from '@/shared/utils/shadows';

import { formatDistance } from '../utils/distance';

export type Alert = {
  id: string;
  category: ReportCategory;
  title: string;
  address?: string;
  distanceKm: number;
  date: string;
};

export function AlertCard({ alert }: { alert: Alert }) {
  const incident = getIncidentType(alert.category);

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        {incident ? <AppSymbol name={incident.icon} color={BrandColors.primary} size={24} /> : null}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {alert.title}
          </Text>
          <Text style={styles.distance}>{formatDistance(alert.distanceKm)}</Text>
        </View>

        <View style={styles.detailRow}>
          <AppSymbol
            name={{ ios: 'location.fill', android: 'my-location', web: 'my-location' }}
            color={SurfaceColors.mutedText}
            size={12}
          />
          <Text style={styles.detailText} numberOfLines={1}>
            {alert.address ?? incident?.label ?? 'Ubicación confirmada'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <AppSymbol
            name={{ ios: 'calendar', android: 'calendar-today', web: 'calendar-today' }}
            color={SurfaceColors.mutedText}
            size={12}
          />
          <Text style={styles.detailText}>{alert.date}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    padding: 16,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SurfaceColors.border,
    backgroundColor: SurfaceColors.card,
    ...shadow('subtle'),
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SurfaceColors.pale,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    includeFontPadding: false,
  },
  distance: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    includeFontPadding: false,
  },
  detailRow: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    flex: 1,
    color: SurfaceColors.mutedText,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    includeFontPadding: false,
  },
});
