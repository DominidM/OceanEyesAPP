import { BarController, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

type BarChartData = { label: string; value: number; color: string }[];

type BarChartProps = {
  data: BarChartData;
  width: number;
  height: number;
};

export function BarChart({ data, width, height }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: data.map((d) => d.color),
            borderRadius: 6,
            maxBarThickness: 56,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { displayColors: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: '#94A3B8' },
            grid: { color: 'rgba(148,163,184,0.15)' },
          },
          x: {
            ticks: { color: '#94A3B8' },
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);

  return (
    <View style={{ width, height }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}
