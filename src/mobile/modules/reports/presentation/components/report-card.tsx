import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { buildArbiscanTxUrl } from '@shared/blockchain/ledger';

import { SurfaceColors } from '../theme';
import { ReportThumbnail, ThumbnailType } from './report-thumbnail';
import { shadow } from '@/shared/utils/shadows';
import type { ReportStatus } from '@/shared/firebase/types';

export type Report = {
  id: string;
  title: string;
  time: string;
  location: string;
  date: string;
  status: string;
  statusBg: string;
  statusText: string;
  statusIcon: SymbolName;
  thumbnail: ThumbnailType;
  statusKey?: ReportStatus;
  pointsAwarded?: number;
  txHash?: string;
};

export function ReportCard({ report }: { report: Report }) {
  return (
    <View style={styles.reportCard}>
      <ReportThumbnail type={report.thumbnail} />
      <View style={styles.reportContent}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle} numberOfLines={1}>
            {report.title}
          </Text>
          <Text style={styles.reportTime}>{report.time}</Text>
        </View>

        <DetailRow
          icon={{ ios: 'mappin.and.ellipse', android: 'location-on', web: 'location-on' }}
          text={report.location}
        />
        <DetailRow
          icon={{ ios: 'calendar', android: 'calendar-today', web: 'calendar-today' }}
          text={report.date}
        />

        <View style={styles.statusWrap}>
          <StatusBadge
            icon={report.statusIcon}
            label={report.status}
            bg={report.statusBg}
            color={report.statusText}
          />
        </View>

        {report.statusKey === 'verificado' && report.txHash ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(buildArbiscanTxUrl(report.txHash!))}
            style={({ pressed }) => [styles.txLink, pressed && styles.txLinkPressed]}>
            <AppSymbol name={{ ios: 'arrow.up.right.square.fill', android: 'open-in-new', web: 'open-in-new' }} color={SurfaceColors.successText} size={12} />
            <Text style={styles.txLinkText}>Ver en Arbiscan</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function DetailRow({ icon, text }: { icon: SymbolName; text: string }) {
  return (
    <View style={styles.detailRow}>
      <AppSymbol name={icon} color={SurfaceColors.mutedText} size={12} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

function StatusBadge({
  icon,
  label,
  bg,
  color,
}: {
  icon: SymbolName;
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <AppSymbol name={icon} color={color} size={12} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  reportCard: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    height: 152,
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
  reportContent: {
    flex: 1,
    height: 118,
    gap: 4,
  },
  reportHeader: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  reportTitle: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    includeFontPadding: false,
  },
  reportTime: {
    color: SurfaceColors.mutedText,
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 15,
    includeFontPadding: false,
  },
  detailRow: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: SurfaceColors.mutedText,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    includeFontPadding: false,
  },
  statusWrap: {
    height: 28,
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  statusBadge: {
    height: 20,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    includeFontPadding: false,
  },
  txLink: {
    height: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  txLinkPressed: {
    opacity: 0.6,
  },
  txLinkText: {
    color: SurfaceColors.successText,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    includeFontPadding: false,
  },
});
