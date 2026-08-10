import React from 'react';
import {StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { SurfaceColors } from '@/modules/reports/presentation/theme';
import type { AlertSeverity } from '@/shared/firebase/types';
import { shadow } from '@/shared/utils/shadows';

export type OfficialAlert = {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  source: string;
  distanceKm?: number;
};

const SOURCE_LABEL: Record<string, string> = {
  admin: 'Autoridad',
  usgs: 'USGS',
  noaa: 'NOAA / PTWC',
  user_cluster: 'Comunidad confirmada',
};

const SEVERITY_STYLE: Record<AlertSeverity, { color: string; bg: string }> = {
  info: { color: '#0891B2', bg: 'rgba(8,145,178,0.14)' },
  warning: { color: '#B45309', bg: 'rgba(245,158,11,0.16)' },
  danger: { color: '#B91C1C', bg: 'rgba(239,68,68,0.14)' },
};

export function OfficialAlertCard({ alert }: { alert: OfficialAlert }) {
  const sev = SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.info;

  return (
    <View
      accessible
      accessibilityRole="summary"
      style={[styles.card, { borderLeftColor: sev.color }]}>
      <View style={[styles.iconBox, { backgroundColor: sev.bg }]}>
        <AppSymbol
          name={{
            ios: 'exclamationmark.triangle.fill',
            android: 'warning',
            web: 'warning',
          }}
          color={sev.color}
          size={24}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={[styles.sourceChip, { backgroundColor: sev.bg }]}>
            <AppText style={[styles.sourceLabel, { color: sev.color }]}>
              {SOURCE_LABEL[alert.source] ?? alert.source}
            </AppText>
          </View>
          {alert.distanceKm != null ? (
            <AppText style={styles.distance}>
              {alert.distanceKm < 1
                ? `${Math.round(alert.distanceKm * 1000)} m`
                : `${alert.distanceKm.toFixed(1)} km`}
            </AppText>
          ) : (
            <AppText style={styles.sourceText}>{alert.severity}</AppText>
          )}
        </View>

        <AppText style={styles.title} numberOfLines={2}>
          {alert.title}
        </AppText>
        <AppText style={styles.message} numberOfLines={3}>
          {alert.message}
        </AppText>
      </View>
    </View>
  );
}

export default OfficialAlertCard;

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
    borderLeftWidth: 4,
    backgroundColor: SurfaceColors.card,
    ...shadow('subtle'),
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sourceChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  sourceLabel: {
    fontFamily: Fonts.label,
    fontSize: 11,
    fontWeight: '700',
    includeFontPadding: false,
  },
  sourceText: {
    color: SurfaceColors.mutedText,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  title: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
  },
  message: {
    color: SurfaceColors.mutedText,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 17,
    includeFontPadding: false,
  },
});