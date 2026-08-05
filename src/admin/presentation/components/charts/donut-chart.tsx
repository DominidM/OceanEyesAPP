import React from 'react';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts } from '@/constants/theme';

export type DonutData = { label: string; value: number; color: string }[];

type DonutChartProps = {
  data: DonutData;
  size: number;
  thickness?: number;
};

export function DonutChart({ data, size, thickness = 28 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {data.map((d, i) => {
            const pct = d.value / total;
            const dashArray = `${(pct * circumference).toFixed(1)} ${((1 - pct) * circumference).toFixed(1)}`;
            const strokeDashoffset = -offset;
            offset += pct * circumference;

            return (
              <Circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={dashArray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            );
          })}
        </G>
        <SvgText x={center} y={center - 6} fill="#94A3B8" fontSize={20} fontWeight="bold" textAnchor="middle">
          {total}
        </SvgText>
        <SvgText x={center} y={center + 16} fill="#64748B" fontSize={12} textAnchor="middle">
          Total
        </SvgText>
      </Svg>
    </View>
  );
}

export function DonutLegend({ data }: { data: DonutData }) {
  return (
    <View style={styles.legend}>
      {data.map((d, i) => (
        <View key={i} style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: d.color }]} />
          <Text style={styles.legendLabel}>{d.label}</Text>
          <Text style={styles.legendValue}>{d.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { gap: 8, marginTop: 16 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontFamily: Fonts.body, fontSize: 13, flex: 1 },
  legendValue: { fontFamily: Fonts.label, fontSize: 14, fontWeight: '700' },
});
