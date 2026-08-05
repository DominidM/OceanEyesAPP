import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

ChartJS.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type LineChartData = { label: string; value: number }[];

type LineChartProps = {
  data: LineChartData;
  width: number;
  height: number;
  color?: string;
  fill?: boolean;
};

export function LineChart({ data, width, height, color = '#3B82F6', fill = true }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            borderColor: color,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: color,
            tension: 0.35,
            fill,
            backgroundColor: 'rgba(59,130,246,0.12)',
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
            ticks: { color: '#94A3B8', maxRotation: 0 },
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
  }, [data, color, fill]);

  return (
    <View style={{ width, height }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}