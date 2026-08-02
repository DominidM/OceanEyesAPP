import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomBarHeight } from '@/constants/theme';

import { ReportCard, Report } from '../components/report-card';
import { ReportsHeader, ReportChip } from '../components/reports-header';
import { StatsStrip, ReportStat } from '../components/stats-strip';
import { SyncWarning } from '../components/sync-warning';
import { HistoryHeader } from '../components/history-header';
import { SurfaceColors } from '../theme';

const chips: ReportChip[] = [
  { label: 'Todos', active: true },
  { label: 'Pendientes', count: 2 },
  { label: 'Verificados' },
  { label: 'En Revision' },
  { label: 'Sin Enviar' },
];

const stats: ReportStat[] = [
  { label: 'Total', value: '8' },
  { label: 'Verificados', value: '6' },
  { label: 'Puntos', value: '120', icon: { ios: 'star.fill', android: 'star', web: 'star' } },
];

const reports: Report[] = [
  {
    title: 'Red ilegal',
    time: 'Hace 2 horas',
    location: 'Costa Verde, Lima',
    date: '15 Ene, 10:30',
    status: 'Verificado',
    statusBg: SurfaceColors.successBg,
    statusText: SurfaceColors.successText,
    statusIcon: { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' },
    thumbnail: 'net',
  },
  {
    title: 'Barco sospechoso',
    time: 'Ayer',
    location: 'Bahia de Paracas',
    date: '14 Ene, 16:45',
    status: 'En revision',
    statusBg: SurfaceColors.reviewBg,
    statusText: SurfaceColors.reviewText,
    statusIcon: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
    thumbnail: 'boat',
  },
  {
    title: 'Especie protegida',
    time: 'Sin enviar',
    location: 'Pucusana',
    date: '13 Ene, 08:15',
    status: 'Pendiente de envio',
    statusBg: SurfaceColors.pendingBg,
    statusText: SurfaceColors.pendingText,
    statusIcon: { ios: 'icloud.slash.fill', android: 'cloud_off', web: 'cloud_off' },
    thumbnail: 'pending',
  },
];

export function ReportsSection() {
  const insets = useSafeAreaInsets();
  return (
    <>
      <ReportsHeader chips={chips} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        <StatsStrip stats={stats} />
        <SyncWarning />
        <HistoryHeader />
        <View style={styles.reportList}>
          {reports.map((report) => (
            <ReportCard key={report.title} report={report} />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 80,
  },
  reportList: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 12,
  },
});
