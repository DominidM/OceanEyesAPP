import React from 'react';
import Svg, { Line, Polyline } from 'react-native-svg';
import { View } from 'react-native';

type LineChartData = { label: string; value: number }[];

type LineChartProps = {
  data: LineChartData;
  width: number;
  height: number;
  color?: string;
  fill?: boolean;
};

export function LineChart({ data, width, height, color = '#3B82F6' }: LineChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const padX = 10;
  const padY = 10;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = data
    .map((d, i) => {
      const x = padX + (i / Math.max(data.length - 1, 1)) * innerW;
      const y = padY + innerH - (d.value / max) * innerH;
      return `${x},${y}`;
    })
    .join(' ');

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((g) => {
    const y = padY + innerH * g;
    return <Line key={g} x1={padX} y1={y} x2={width - padX} y2={y} stroke="rgba(148,163,184,0.15)" strokeWidth={1} />;
  });

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {gridLines}
        <Polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      </Svg>
    </View>
  );
}