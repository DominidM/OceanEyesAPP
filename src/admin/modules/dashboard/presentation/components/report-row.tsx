import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { useAdminTheme } from '@admin/shared/theme/context';

export type ReportStatus = 'pendiente' | 'verificado' | 'descartado';

type ReportRowProps = {
  id: string;
  title: string;
  status: ReportStatus;
  date: string;
};

export function ReportRow({ id, title, status, date }: ReportRowProps) {
  const { colors } = useAdminTheme();

  const statusConfig: Record<ReportStatus, { label: string; color: string; bg: string }> = {
    pendiente: { label: 'Pendiente', color: colors.warning, bg: colors.warningBg },
    verificado: { label: 'Verificado', color: colors.success, bg: colors.successBg },
    descartado: { label: 'Descartado', color: colors.danger, bg: colors.dangerBg },
  };
  const st = statusConfig[status];

  return (
    <View style={[styles.row, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <View style={styles.main}>
        <Text style={[styles.title, { color: colors.cardText }]}>{title}</Text>
        <Text style={[styles.meta, { color: colors.contentTextMuted }]}>
          #{id} · {date}
        </Text>
      </View>
      <View style={[styles.status, { backgroundColor: st.bg }]}>
        <Text style={[styles.statusLabel, { color: st.color }]}>{st.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  main: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    fontFamily: Fonts.body,
    fontSize: 13,
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
