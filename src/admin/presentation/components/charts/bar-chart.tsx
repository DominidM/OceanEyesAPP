import React from 'react';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { View } from 'react-native';

type BarChartData = { label: string; value: number; color: string }[];

type BarChartProps = {
  data: BarChartData;
  width: number;
  height: number;
};

export function BarChart({ data, width, height }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barCount = data.length;
  const gap = 20;
  const barW = (width - 40 - gap * (barCount - 1)) / barCount;
  const labelY = height - 12;
  const chartH = height - 40;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          {data.map((d, i) => (
            <SvgLinearGradient key={i} id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={d.color} stopOpacity="1" />
              <Stop offset="1" stopColor={d.color} stopOpacity="0.7" />
            </SvgLinearGradient>
          ))}
        </Defs>
        {data.map((d, i) => {
          const x = 20 + i * (barW + gap);
          const h = (d.value / max) * chartH;
          const y = chartH - h;
          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={6}
                ry={6}
                fill={`url(#bar-grad-${i})`}
              />
              <SvgText
                x={x + barW / 2}
                y={y - 8}
                fill="#94A3B8"
                fontSize={11}
                fontWeight="600"
                textAnchor="middle"
              >
                {d.value}
              </SvgText>
              <SvgText
                x={x + barW / 2}
                y={labelY}
                fill="#94A3B8"
                fontSize={11}
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
