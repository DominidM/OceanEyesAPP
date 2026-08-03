import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { firestore } from '@/shared/firebase/app';
import { useAdminTheme } from '@admin/shared/theme/context';
import { Spacing } from '@/constants/theme';
import { BarChart } from '@admin/shared/components/charts/bar-chart';
import { DonutChart, DonutLegend } from '@admin/shared/components/charts/donut-chart';
import { Card, SectionTitle, KpiStat } from '@admin/shared/ui';

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
      <Card>
        <SectionTitle>Reportes por categoría</SectionTitle>
        <BarChart data={catData} width={chartW} height={200} />
      </Card>

      <Card>
        <SectionTitle>Distribución por estado</SectionTitle>
        <View style={styles.donutRow}>
          <DonutChart data={statusData} size={140} />
          <DonutLegend data={statusData} />
        </View>
      </Card>

      <View style={styles.kpiRow}>
        <KpiStat value={total} label="Reportes totales" color={colors.primary} />
        <KpiStat value={usuarios} label="Usuarios activos" color={colors.success} />
        <KpiStat
          value={statusData.find((d) => d.label === 'Pendientes')?.value ?? 0}
          label="Pendientes"
          color={colors.warning}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: Spacing.four },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
});
