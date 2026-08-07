import React, { useMemo, useState } from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BottomBarHeight, BrandColors } from '@/constants/theme';
import type { ReportStatus } from '@/shared/firebase/types';
import type { ReportDto } from '@/modules/reports/application/dto/report.dto';
import type { PendingReport } from '@/shared/offline/outbox';
import { requestSync } from '@/shared/offline/sync-engine';
import { useAuth } from '@/shared/firebase/auth-context';
import { useDb } from '@/shared/hooks/use-db';
import { useViewModel } from '@/shared/viewmodels/use-view-model';

import { ReportCard, Report } from '../components/report-card';
import { ReportsHeader, ReportChip } from '../components/reports-header';
import { StatsStrip, ReportStat } from '../components/stats-strip';
import { SyncWarning } from '../components/sync-warning';
import { HistoryHeader } from '../components/history-header';
import { ReportsListViewModel } from '../viewmodels/reports-list.viewmodel';
import { SurfaceColors } from '../theme';

const REPORTS_CACHE_KEY = '@oceaneyes/cache/reports-mine';

type FilterKey = 'todos' | 'pendiente' | 'verificado' | 'en_revision' | 'descartado' | 'sin_enviar';

export function ReportsSection() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('todos');
  const { user } = useAuth();
  const db = useDb('reports');

  const vm = useViewModel(
    () =>
      new ReportsListViewModel<Report>({
        db,
        getUser: () => user,
        cacheKey: REPORTS_CACHE_KEY,
        transform: (items: ReportDto[]) => items.map(toCardReport),
      }),
    {
      db,
      getUser: () => user,
      cacheKey: REPORTS_CACHE_KEY,
      transform: (items: ReportDto[]) => items.map(toCardReport),
    },
  );
  const { reports, queued } = vm.getState();

  const counts = useMemo(() => {
    let pendiente = 0;
    let verificado = 0;
    let en_revision = 0;
    let descartado = 0;
    for (const report of reports) {
      if (report.statusKey === 'pendiente') pendiente += 1;
      else if (report.statusKey === 'verificado') verificado += 1;
      else if (report.statusKey === 'en_revision') en_revision += 1;
      else if (report.statusKey === 'descartado') descartado += 1;
    }
    return { pendiente, verificado, en_revision, descartado };
  }, [reports]);

  const chips: ReportChip[] = useMemo(
    () => [
      { label: 'Todos', active: activeFilter === 'todos', onPress: () => setActiveFilter('todos') },
      {
        label: 'Pendientes',
        count: counts.pendiente,
        active: activeFilter === 'pendiente',
        onPress: () => setActiveFilter('pendiente'),
      },
      {
        label: 'Verificados',
        count: counts.verificado,
        active: activeFilter === 'verificado',
        onPress: () => setActiveFilter('verificado'),
      },
      {
        label: 'En Revision',
        count: counts.en_revision,
        active: activeFilter === 'en_revision',
        onPress: () => setActiveFilter('en_revision'),
      },
      {
        label: 'Descartados',
        count: counts.descartado,
        active: activeFilter === 'descartado',
        onPress: () => setActiveFilter('descartado'),
      },
      {
        label: 'Sin Enviar',
        count: queued.length,
        active: activeFilter === 'sin_enviar',
        onPress: () => setActiveFilter('sin_enviar'),
      },
    ],
    [activeFilter, counts, queued],
  );

  const stats: ReportStat[] = useMemo(
    () => [
      { label: 'Total', value: String(reports.length + queued.length) },
      { label: 'Verificados', value: String(counts.verificado) },
      {
        label: 'Puntos',
        value: String(reports.reduce((sum, report) => sum + (report.pointsAwarded ?? 0), 0)),
        icon: { ios: 'star.fill', android: 'star', web: 'star' },
      },
    ],
    [reports, queued, counts.verificado],
  );

  const showQueued = activeFilter === 'todos' || activeFilter === 'sin_enviar';
  const filteredQueued = showQueued ? queued : [];
  const filteredReports =
    activeFilter === 'todos' ? reports : activeFilter === 'sin_enviar' ? [] : reports.filter((report) => report.statusKey === activeFilter);
  const listEmpty = filteredQueued.length === 0 && filteredReports.length === 0;

  return (
    <>
      <ReportsHeader chips={chips} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        <StatsStrip stats={stats} />
        <SyncWarning onSync={() => void requestSync('manual')} />
        <HistoryHeader />
        <View style={styles.reportList}>
          {filteredQueued.map((pending) => (
            <ReportCard key={pending.id} report={toQueuedCard(pending)} />
          ))}
          {filteredReports.map((report) => (
            <ReportCard key={`${report.title}-${report.date}`} report={report} />
          ))}
          {listEmpty ? (
            <View style={styles.emptyState}>
              <AppText style={styles.emptyStateTitle}>Sin reportes</AppText>
              <AppText style={styles.emptyStateText}>No hay reportes en este filtro.</AppText>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

function toQueuedCard(pending: PendingReport): Report {
  return {
    title: pending.input.title,
    time: 'Sin enviar',
    location: pending.input.location?.address ?? 'Pendiente de envío',
    date: new Date(pending.createdAt).toLocaleDateString(),
    status: 'Pendiente de envío',
    statusBg: SurfaceColors.pendingBg,
    statusText: SurfaceColors.pendingText,
    statusIcon: { ios: 'icloud.slash.fill', android: 'cloud-off', web: 'cloud-off' },
    thumbnail:
      pending.input.category === 'pesca_ilegal'
        ? 'net'
        : pending.input.category === 'basura_marina'
          ? 'boat'
          : 'pending',
    statusKey: 'pendiente',
    pointsAwarded: 0,
  };
}

function toCardReport(report: ReportDto): Report {
  const date = new Date(report.createdAt);
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
    statusKey: report.status,
    pointsAwarded: report.pointsAwarded,
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
  emptyState: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 4,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SurfaceColors.border,
    backgroundColor: SurfaceColors.card,
  },
  emptyStateTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
  },
  emptyStateText: {
    color: SurfaceColors.mutedText,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    includeFontPadding: false,
  },
});
