import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { firestore } from '@/shared/firebase/app';
import { useAdminTheme } from '@admin/shared/theme/context';
import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { BarChart } from '@admin/shared/components/charts/bar-chart';
import { DonutChart, DonutLegend } from '@admin/shared/components/charts/donut-chart';

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

export function DashboardCharts() {
  const { colors } = useAdminTheme();
  const { width } = useWindowDimensions();
  const [catData, setCatData] = useState<{ label: string; value: number; color: string }[]>([]);
  const [statusData, setStatusData] = useState<{ label: string; value: number; color: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [usuarios, setUsuarios] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [reportsSnap, usersSnap] = await Promise.all([
        getDocs(query(collection(firestore, 'reports'))),
        getDocs(query(collection(firestore, 'users'), where('status', '==', 'active'))),
      ]);

      setUsuarios(usersSnap.size);

      const reports = reportsSnap.docs.map((d) => d.data());
      setTotal(reports.length);

      // Categorías
      const catCount: Record<string, number> = { pesca_ilegal: 0, basura_marina: 0, variacion_mar: 0 };
      const statusCount: Record<string, number> = { pendiente: 0, en_revision: 0, verificado: 0, descartado: 0 };

      reports.forEach((r: any) => {
        if (catCount[r.category] !== undefined) catCount[r.category]++;
        if (statusCount[r.status] !== undefined) statusCount[r.status]++;
      });

      setCatData(
        Object.entries(catCount).map(([cat, val]) => ({
          label: CATEGORY_LABELS[cat] ?? cat,
          value: val,
          color: CATEGORY_COLORS[cat] ?? '#94A3B8',
        })),
      );

      setStatusData([
        { label: 'Pendientes', value: statusCount.pendiente, color: colors.warning },
        { label: 'En revisión', value: statusCount.en_revision, color: '#3B82F6' },
        { label: 'Verificados', value: statusCount.verificado, color: colors.success },
        { label: 'Descartados', value: statusCount.descartado, color: colors.danger },
      ].filter((d) => d.value > 0));
    };
    load().catch(() => {});
  }, [colors.success, colors.warning, colors.danger]);

  const chartW = Math.min(width - 320, 500);

  return (
    <View style={styles.grid}>
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.contentText }]}>Reportes por categoría</Text>
        <BarChart data={catData} width={chartW} height={200} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.contentText }]}>Distribución por estado</Text>
        <View style={styles.donutRow}>
          <DonutChart data={statusData} size={140} />
          <DonutLegend data={statusData} />
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.kpiValue, { color: colors.primary }]}>{total}</Text>
          <Text style={[styles.kpiLabel, { color: colors.contentTextMuted }]}>Reportes totales</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.kpiValue, { color: colors.success }]}>{usuarios}</Text>
          <Text style={[styles.kpiLabel, { color: colors.contentTextMuted }]}>Usuarios activos</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.kpiValue, { color: colors.warning }]}>
            {statusData.find((d) => d.label === 'Pendientes')?.value ?? 0}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.contentTextMuted }]}>Pendientes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: Spacing.four },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTitle: {
    fontFamily: Fonts.headline,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  kpiValue: {
    fontFamily: Fonts.headline,
    fontSize: 32,
    fontWeight: '700',
  },
  kpiLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
  },
});
