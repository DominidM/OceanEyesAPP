import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

export type ReportStatus = 'pendiente' | 'verificado' | 'descartado';

type ReportRowProps = {
  id: string;
  title: string;
  status: ReportStatus;
  date: string;
};

const statusStyles: Record<ReportStatus, { label: string; color: string; background: string }> = {
  pendiente: {
    label: 'Pendiente',
    color: '#8A6D1D',
    background: '#FBF3D5',
  },
  verificado: {
    label: 'Verificado',
    color: BrandColors.primary,
    background: '#DCEBE6',
  },
  descartado: {
    label: 'Descartado',
    color: '#8A3B2E',
    background: '#F6E0DB',
  },
};

export function ReportRow({ id, title, status, date }: ReportRowProps) {
  const statusStyle = statusStyles[status];

  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>
          #{id} · {date}
        </Text>
      </View>
      <View style={[styles.status, { backgroundColor: statusStyle.background }]}>
        <Text style={[styles.statusLabel, { color: statusStyle.color }]}>{statusStyle.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  main: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 13,
    opacity: 0.6,
  },
  status: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  statusLabel: {
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
  },
});
