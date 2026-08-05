import { ArcElement, Chart as ChartJS, DoughnutController, Tooltip } from 'chart.js';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts } from '@admin/config/theme';

ChartJS.register(DoughnutController, ArcElement, Tooltip);

export type DonutData = { label: string; value: number; color: string }[];

type DonutChartProps = {
  data: DonutData;
  size: number;
  thickness?: number;
};

export function DonutChart({ data, size, thickness = 28 }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const cutout = (((size / 2) - thickness) / (size / 2)) * 100;

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: data.map((d) => d.color),
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: `${cutout}%`,
        plugins: {
          legend: { display: false },
          tooltip: { displayColors: false },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, cutout]);

  return (
    <View style={{ width: size, height: size }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

export function DonutLegend({ data }: { data: DonutData }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <View style={styles.legend}>
      {data.map((d, i) => {
        const pct = Math.round((d.value / total) * 100);
        return (
          <View key={i} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: d.color }]} />
            <Text style={styles.legendLabel}>{d.label}</Text>
            <Text style={styles.legendValue}>{d.value} · {pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { gap: 8, marginTop: 16 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontFamily: Fonts.body, fontSize: 13, flex: 1 },
  legendValue: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '700' },
});
