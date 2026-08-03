import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandColors } from '@/constants/theme';

import { StatCard } from '../components/stat-card';

const stats = [
  { label: 'Reportes totales', value: '128', accent: BrandColors.primary },
  { label: 'Verificados', value: '86', accent: BrandColors.secondary },
  { label: 'Pendientes', value: '24', accent: '#8A6D1D' },
  { label: 'Usuarios activos', value: '312', accent: BrandColors.neutral },
];

export function StatsStrip() {
  return (
    <View style={styles.strip}>
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} accent={stat.accent} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
});
