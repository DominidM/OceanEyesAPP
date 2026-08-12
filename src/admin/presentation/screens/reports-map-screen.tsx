import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AdminShell } from '@admin/layout/admin-shell';
import { Card, SectionHeader } from '@admin/presentation/components/ui';
import { RealTimeReportsMap } from '@admin/presentation/components/reports/real-time-reports-map';
import { useAdminTheme } from '@admin/theme/context';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { subscribeAllReports } from '@/shared/firebase/reports';
import type { Report } from '@/shared/firebase/types';

type MapFilter = 'todos' | 'pendientes' | 'clasificados' | 'resueltos';

const FILTERS: { key: MapFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'clasificados', label: 'Clasificados' },
  { key: 'resueltos', label: 'Resueltos' },
];

export function ReportsMapScreen() {
  const { colors } = useAdminTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<MapFilter>('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => subscribeAllReports(setReports), []);

  const invalidRange = !!startDate && !!endDate && startDate > endDate;
  const located = useMemo(() => reports.filter((report) => {
    if (!report.location) return false;
    const createdAt = report.createdAt?.toDate?.();
    if (startDate && (!createdAt || createdAt < new Date(`${startDate}T00:00:00`))) return false;
    if (endDate && (!createdAt || createdAt > new Date(`${endDate}T23:59:59.999`))) return false;
    if (filter === 'pendientes') return report.status === 'pendiente';
    if (filter === 'clasificados') return report.status === 'en_revision';
    if (filter === 'resueltos') return report.status === 'verificado' || report.status === 'descartado';
    return true;
  }), [reports, filter, startDate, endDate]);

  return (
    <AdminShell title="Mapa en tiempo real" breadcrumb={[{ label: 'Mapa en tiempo real' }]}>
      <SectionHeader
        title="Mapa de reportes"
        subtitle={`${located.length} de ${reports.filter((report) => report.location).length} reportes con ubicación`}
      />
      <Card style={styles.card}>
        <View style={styles.dateFilters}>
          <View style={styles.dateField}>
            <Text style={[styles.dateLabel, { color: colors.contentTextMuted }]}>Fecha de inicio</Text>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.currentTarget.value)}
              style={{ ...dateInputStyle, color: colors.contentText, borderColor: colors.cardBorder, backgroundColor: colors.appBg }}
            />
          </View>
          <View style={styles.dateField}>
            <Text style={[styles.dateLabel, { color: colors.contentTextMuted }]}>Fecha límite</Text>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.currentTarget.value)}
              style={{ ...dateInputStyle, color: colors.contentText, borderColor: colors.cardBorder, backgroundColor: colors.appBg }}
            />
          </View>
          {(startDate || endDate) && (
            <Pressable onPress={() => { setStartDate(''); setEndDate(''); }} style={styles.clearDates}>
              <Text style={[styles.clearDatesText, { color: colors.primary }]}>Limpiar fechas</Text>
            </Pressable>
          )}
        </View>
        {invalidRange && <Text style={styles.rangeError}>La fecha límite no puede ser anterior a la fecha de inicio.</Text>}
        <View style={styles.filters}>
          {FILTERS.map((item) => {
            const active = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[styles.filter, { borderColor: active ? colors.primary : colors.cardBorder, backgroundColor: active ? colors.primary : 'transparent' }]}
              >
                <Text style={[styles.filterText, { color: active ? colors.primaryText : colors.contentText }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <RealTimeReportsMap
          reports={located}
          onSelectReport={(report) => router.push({ pathname: '/admin/reports/[id]', params: { id: report.id } })}
        />
        <Text style={[styles.help, { color: colors.contentTextMuted }]}>Haz clic en un marcador para abrir el detalle del reporte.</Text>
      </Card>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  dateFilters: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: Spacing.three },
  dateField: { minWidth: 210, gap: Spacing.one },
  dateLabel: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '600' },
  clearDates: { paddingHorizontal: Spacing.two, paddingVertical: 11, cursor: 'pointer' },
  clearDatesText: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '700' },
  rangeError: { color: '#DC2626', fontFamily: Fonts.body, fontSize: 13 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  filter: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, cursor: 'pointer' },
  filterText: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '700' },
  help: { fontFamily: Fonts.body, fontSize: 13 },
});

const dateInputStyle: React.CSSProperties = {
  height: 42,
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: 10,
  padding: '0 12px',
  fontFamily: Fonts.body,
  fontSize: 14,
  outline: 'none',
};
