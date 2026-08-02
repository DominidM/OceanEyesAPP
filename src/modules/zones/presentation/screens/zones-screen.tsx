import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabBar } from '@/shared/components/bottom-tab-bar';
import { PhoneFrame } from '@/shared/components/phone-frame';
import { getMainTabs } from '@/shared/config/main-tabs';
import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';

import { Zone, ZoneCard } from '../components/zone-card';

const zones: Zone[] = [
  {
    name: 'Bahia de Paracas',
    description: 'Zona de alta biodiversidad y santuario natural.',
    status: 'Monitoreo',
    coordinates: '-13.8361, -76.3068',
    pendingReports: 3,
  },
  {
    name: 'Costa Verde, Lima',
    description: 'Zona urbana costera con alto trafico pesquero.',
    status: 'En riesgo',
    coordinates: '-12.1200, -77.0330',
    pendingReports: 5,
  },
  {
    name: 'Islas Ballestas',
    description: 'Santuario de fauna marina protegida.',
    status: 'Activa',
    coordinates: '-13.7264, -76.2000',
    pendingReports: 1,
  },
  {
    name: 'Pucusana',
    description: 'Puerto pesquero artesanal con presencia de redes.',
    status: 'Monitoreo',
    coordinates: '-12.4828, -76.7992',
    pendingReports: 2,
  },
];

export function ZonesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <PhoneFrame bottomBar={<BottomTabBar items={getMainTabs('zonas')} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Zonas</Text>
        <Text style={styles.subtitle}>Areas marinas bajo monitoreo</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        {zones.map((zone) => (
          <ZoneCard key={zone.name} zone={zone} />
        ))}
      </ScrollView>
    </PhoneFrame>
  );
}

export default ZonesScreen;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  header: {
    height: 110,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: BrandColors.tertiary,
    justifyContent: 'center',
    gap: Spacing.one,
  },
  title: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 35,
  },
  subtitle: {
    color: 'rgba(44, 44, 44, 0.62)',
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
});
