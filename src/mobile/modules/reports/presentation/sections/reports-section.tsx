import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomBarHeight } from '@/constants/theme';

import { ReportCard, Report } from '../components/report-card';
import { ReportsHeader, ReportChip } from '../components/reports-header';
import { StatsStrip, ReportStat } from '../components/stats-strip';
import { SyncWarning } from '../components/sync-warning';
import { HistoryHeader } from '../components/history-header';
import { SurfaceColors } from '../theme';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { getMyReports } from '@/shared/firebase/reports';
import type { Report as FirestoreReport, ReportStatus } from '@/shared/firebase/types';

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

const demoReports: Report[] = [
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
    statusIcon: { ios: 'icloud.slash.fill', android: 'cloud-off', web: 'cloud-off' },
    thumbnail: 'pending',
  },
];

export function ReportsSection() {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<Report[]>(demoReports);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    getMyReports().then((items) => setReports(items.map(toCardReport))).catch(() => undefined);
  }, []);
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

function toCardReport(report: FirestoreReport): Report {
  const date = report.createdAt?.toDate?.() ?? new Date();
  const statusMap: Record<ReportStatus, { label: string; bg: string; text: string; icon: Report['statusIcon'] }> = {
    pendiente: { label: 'Pendiente', bg: SurfaceColors.pendingBg, text: SurfaceColors.pendingText, icon: { ios: 'clock.fill', android: 'schedule', web: 'schedule' } },
    en_revision: { label: 'En revisión', bg: SurfaceColors.reviewBg, text: SurfaceColors.reviewText, icon: { ios: 'clock.fill', android: 'schedule', web: 'schedule' } },
    verificado: { label: 'Verificado', bg: SurfaceColors.successBg, text: SurfaceColors.successText, icon: { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' } },
    descartado: { label: 'Descartado', bg: 'rgba(254, 226, 226, 1.0)', text: '#991B1B', icon: { ios: 'xmark.seal.fill', android: 'cancel', web: 'cancel' } },
  };
  const status = statusMap[report.status] ?? statusMap.pendiente;
  const statusIcon = status.icon;

  return {
    title: report.title,
    time: date.toLocaleDateString(),
    location: report.location?.address ?? 'Ubicación confirmada',
    date: date.toLocaleDateString(),
    status: status.label,
    statusBg: status.bg,
    statusText: status.text,
    statusIcon,
    thumbnail: report.category === 'pesca_ilegal' ? 'net' : report.category === 'basura_marina' ? 'boat' : 'pending',
  };
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
