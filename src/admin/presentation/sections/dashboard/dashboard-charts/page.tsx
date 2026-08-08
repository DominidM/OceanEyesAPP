import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { firestore } from '@/shared/firebase/app';
import { useAdminTheme } from '@admin/theme/context';
import { BarChart, DonutChart, DonutLegend, LineChart } from '@admin/presentation/components/charts';
import { Card, SectionTitle } from '@admin/presentation/components/ui';

const CATEGORY_COLORS: Record<string, string> = {
  pesca_ilegal: '#EF4444',
  basura_marina: '#F59E0B',
  variacion_mar: '#3B82F6',
};

const CATEGORY_LABELS: Record<string, string> = {
  pesca_ilegal: 'Pesca ilegal',
  basura_marina: 'Basura',
  variacion_mar: 'Variación',
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pendiente: { label: 'Pendiente', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)', icon: 'hourglass-half' },
  en_revision: { label: 'En revisión', color: '#3B82F6', bg: 'rgba(59,130,246,0.14)', icon: 'search' },
  verificado: { label: 'Verificado', color: '#10B981', bg: 'rgba(16,185,129,0.14)', icon: 'check-circle' },
  descartado: { label: 'Descartado', color: '#EF4444', bg: 'rgba(239,68,68,0.14)', icon: 'ban' },
};

type RangeKey = 'hoy' | '7d' | '30d' | 'todo';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'hoy', label: 'Hoy' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: 'todo', label: 'Todo' },
];

function getTime(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof (v as { toDate?: () => Date }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate();
  }
  return null;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildRange(reports: any[], range: RangeKey) {
  const now = startOfDay(new Date());
  const buckets: { start: Date; end: Date; label: string }[] = [];
  let prevStart: Date | null = null;

  if (range === 'hoy') {
    for (let h = 0; h < 24; h++) {
      const s = new Date(now);
      s.setHours(h, 0, 0, 0);
      const e = new Date(s);
      e.setHours(h + 1, 0, 0, 0);
      buckets.push({ start: s, end: e, label: `${h}:00` });
    }
    prevStart = new Date(now);
    prevStart.setDate(prevStart.getDate() - 1);
  } else if (range === '7d') {
    const names = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    for (let i = 6; i >= 0; i--) {
      const s = new Date(now);
      s.setDate(now.getDate() - i);
      const e = new Date(s);
      e.setDate(s.getDate() + 1);
      buckets.push({ start: s, end: e, label: names[s.getDay()] });
    }
    prevStart = new Date(now);
    prevStart.setDate(prevStart.getDate() - 7);
  } else if (range === '30d') {
    for (let i = 29; i >= 0; i--) {
      const s = new Date(now);
      s.setDate(now.getDate() - i);
      const e = new Date(s);
      e.setDate(s.getDate() + 1);
      buckets.push({ start: s, end: e, label: `${s.getDate()}/${s.getMonth() + 1}` });
    }
    prevStart = new Date(now);
    prevStart.setDate(prevStart.getDate() - 30);
  } else {
    const daySet = new Set<number>();
    for (const r of reports) {
      const t = getTime(r.createdAt);
      if (t) daySet.add(startOfDay(t).getTime());
    }
    Array.from(daySet)
      .sort((a, b) => a - b)
      .map((ts) => new Date(ts))
      .forEach((s) => {
        const e = new Date(s);
        e.setDate(s.getDate() + 1);
        buckets.push({ start: s, end: e, label: `${s.getDate()}/${s.getMonth() + 1}` });
      });
    if (buckets.length === 0) {
      buckets.push({ start: now, end: new Date(now.getTime() + 86400000), label: 'hoy' });
    }
  }

  const rangeStart = buckets[0].start;
  const inRange = range === 'todo'
    ? reports
    : reports.filter((r) => {
        const t = getTime(r.createdAt);
        return t && rangeStart && t >= rangeStart;
      });
  const prevCount = prevStart
    ? reports.filter((r) => {
        const t = getTime(r.createdAt);
        return t && t >= prevStart! && t < rangeStart;
      }).length
    : 0;

  return { buckets, inRange, prevCount, rangeStart, prevStart };
}

function pctChange(current: number, prev: number): string | null {
  if (prev <= 0) return current > 0 ? '100%' : null;
  const pct = ((current - prev) / prev) * 100;
  return `${pct >= 0 ? '' : '−'}${Math.abs(pct).toFixed(1)}%`;
}

export function DashboardCharts() {
  const { colors } = useAdminTheme();
  const { width } = useWindowDimensions();
  const [reports, setReports] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState(0);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>('7d');

  useEffect(() => {
    const unsubReports = onSnapshot(
      collection(firestore, 'reports'),
      (snap) => {
        setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Dashboard reports snapshot error:', err);
        setLoading(false);
      },
    );
    const unsubUsers = onSnapshot(
      query(collection(firestore, 'users'), where('status', '==', 'active')),
      (snap) => setUsuarios(snap.size),
    );
    return () => {
      unsubReports();
      unsubUsers();
    };
  }, []);

  const stats = useMemo(() => {
    const { buckets, inRange, prevCount, rangeStart, prevStart } = buildRange(reports, range);

    const catCount: Record<string, number> = { pesca_ilegal: 0, basura_marina: 0, variacion_mar: 0 };
    const statusCount: Record<string, number> = { pendiente: 0, en_revision: 0, verificado: 0, descartado: 0 };

    inRange.forEach((r) => {
      if (catCount[r.category] !== undefined) catCount[r.category]++;
      if (statusCount[r.status] !== undefined) statusCount[r.status]++;
    });

    const isOnChain = (r: any) => r.status === 'verificado' && Boolean(r.txHash);
    const onchain = inRange.filter(isOnChain).length;
    const prevOnchain = prevStart && rangeStart
      ? reports.filter((r) => {
          const t = getTime(r.createdAt);
          return isOnChain(r) && t && t >= prevStart && t < rangeStart;
        }).length
      : 0;

    return {
      buckets,
      prevCount,
      total: inRange.length,
      pendientes: statusCount.pendiente,
      verificados: statusCount.verificado,
      onchain,
      prevOnchain,
      trend: buckets.map((b) => ({
        label: b.label,
        value: reports.filter((r) => {
          const t = getTime(r.createdAt);
          return t && t >= b.start && t < b.end;
        }).length,
      })),
      catData: Object.entries(catCount).map(([cat, value]) => ({
        label: CATEGORY_LABELS[cat] ?? cat,
        value,
        color: CATEGORY_COLORS[cat] ?? '#94A3B8',
      })).filter((d) => d.value > 0),
      statusData: Object.entries(statusCount)
        .map(([key, value]) => ({
          key,
          label: STATUS_META[key].label,
          value,
          color: STATUS_META[key].color,
        }))
        .filter((d) => d.value > 0),
    };
  }, [reports, range]);

  const chartW = Math.min(width - 320, 560);

  const kpis = [
    {
      label: 'Reportes',
      value: loading ? '…' : String(stats.total),
      delta: pctChange(stats.total, stats.prevCount),
      icon: 'file-alt',
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.14)',
    },
    {
      label: 'Verificados',
      value: String(stats.verificados),
      delta: stats.prevCount > 0 ? pctChange(stats.verificados, stats.prevCount) : null,
      icon: 'check-circle',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.14)',
    },
    {
      label: 'On-chain',
      value: String(stats.onchain),
      delta: pctChange(stats.onchain, stats.prevOnchain),
      icon: 'ethereum',
      color: '#28A0F0',
      bg: 'rgba(40,160,240,0.14)',
    },
    {
      label: 'Pendientes',
      value: String(stats.pendientes),
      delta: stats.prevCount > 0 ? pctChange(stats.pendientes, stats.prevCount) : null,
      icon: 'hourglass-half',
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.14)',
    },
    {
      label: 'Usuarios activos',
      value: String(usuarios),
      delta: null,
      icon: 'users',
      color: '#8B5CF6',
      bg: 'rgba(139,92,246,0.14)',
    },
  ];

  const rangeLabel = RANGES.find((r) => r.key === range)?.label ?? '';

  return (
    <View style={styles.grid}>
      <View style={styles.kpiRow}>
        {kpis.map((k, i) => {
          const positive = k.delta != null && !k.delta.startsWith('−');
          return (
            <View key={k.label} style={[styles.kpiCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.kpiTop}>
                <Text style={[styles.kpiLabel, { color: colors.contentTextMuted }]}>{k.label}</Text>
                <View style={[styles.kpiIcon, { backgroundColor: k.bg }]}>
                  <FontAwesome5 name={k.icon} size={15} color={k.color} />
                </View>
              </View>
              <Text style={[styles.kpiValue, { color: colors.cardText }]}>{k.value}</Text>
              {k.delta != null ? (
                <View style={styles.kpiDelta}>
                  <FontAwesome5
                    name={positive ? 'caret-up' : 'caret-down'}
                    size={12}
                    color={positive ? '#10B981' : '#EF4444'}
                  />
                  <Text style={[styles.kpiDeltaText, { color: positive ? '#10B981' : '#EF4444' }]}>
                    {k.delta} vs anterior
                  </Text>
                </View>
              ) : (
                <Text style={[styles.kpiDeltaPlaceholder, { color: colors.contentTextMuted }]}>
                  Panel de vigilancia
                </Text>
              )}
              {i === 0 && (
                <Text style={[styles.kpiSub, { color: colors.contentTextMuted }]}>en {rangeLabel.toLowerCase()}</Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.rangeRow}>
        {RANGES.map((r) => {
          const active = r.key === range;
          return (
            <Pressable
              key={r.key}
              onPress={() => setRange(r.key)}
              style={[styles.rangeTab, { borderColor: colors.cardBorder }, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            >
              <Text style={[styles.rangeTabLabel, { color: active ? colors.primaryText : colors.contentTextMuted }]}>
                {r.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.grid2}>
        <Card style={styles.panel}>
          <SectionTitle>Reportes por día</SectionTitle>
          {stats.trend.every((t) => t.value === 0) ? (
            <Text style={[styles.empty, { color: colors.contentTextMuted }]}>Sin reportes en el período.</Text>
          ) : (
            <BarChart data={stats.trend.map((t) => ({ ...t, color: colors.primary }))} width={chartW} height={220} />
          )}
        </Card>

        <Card style={styles.panel}>
          <SectionTitle>Estado de incidencias</SectionTitle>
          {stats.statusData.length === 0 ? (
            <Text style={[styles.empty, { color: colors.contentTextMuted }]}>Sin datos en el período.</Text>
          ) : (
            <>
              <View style={styles.donutWrap}>
                <DonutChart data={stats.statusData} size={150} />
              </View>
              <DonutLegend data={stats.statusData} />
            </>
          )}
        </Card>
      </View>

      <View style={styles.grid2}>
        <Card style={styles.panel}>
          <SectionTitle>Tendencia de reportes</SectionTitle>
          {stats.trend.every((t) => t.value === 0) ? (
            <Text style={[styles.empty, { color: colors.contentTextMuted }]}>Sin reportes en el período.</Text>
          ) : (
            <LineChart data={stats.trend} width={chartW} height={220} color={colors.primary} />
          )}
        </Card>

        <Card style={styles.panel}>
          <SectionTitle>Por categoría</SectionTitle>
          {stats.catData.length === 0 ? (
            <Text style={[styles.empty, { color: colors.contentTextMuted }]}>Sin datos en el período.</Text>
          ) : (
            <>
              <View style={styles.donutWrap}>
                <DonutChart data={stats.catData} size={150} />
              </View>
              <DonutLegend data={stats.catData} />
            </>
          )}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: Spacing.four },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
  panel: { flex: 1, minWidth: 420, gap: Spacing.three },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  kpiCard: {
    flex: 1,
    minWidth: 200,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  kpiTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.one },
  kpiLabel: { fontFamily: Fonts.body, fontSize: 13 },
  kpiIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontFamily: Fonts.headline, fontSize: 30, fontWeight: '700' },
  kpiDelta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, marginTop: Spacing.one },
  kpiDeltaText: { fontFamily: Fonts.label, fontSize: 12, fontWeight: '700' },
  kpiDeltaPlaceholder: { fontFamily: Fonts.body, fontSize: 12, marginTop: Spacing.one },
  kpiSub: { fontFamily: Fonts.body, fontSize: 12 },
  rangeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  rangeTab: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two - 2,
    cursor: 'pointer',
  },
  rangeTabLabel: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '700' },
  donutWrap: { alignItems: 'center', marginTop: Spacing.two },
  empty: { fontFamily: Fonts.body, fontSize: 14, paddingVertical: Spacing.four },
});