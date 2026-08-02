import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppSymbol } from '@/shared/components/app-symbol';
import { BottomTabBar } from '@/shared/components/bottom-tab-bar';
import { PhoneFrame } from '@/shared/components/phone-frame';
import { getMainTabs } from '@/shared/config/main-tabs';
import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';

import { ActionCard } from '../components/action-card';
import { ActivityCard, ActivityStat } from '../components/activity-card';
import { MapPreview, MapPin } from '../components/map-preview';
import { TopBar } from '../components/top-bar';

const activityStats: ActivityStat[] = [
  { label: 'Reportes', value: '8', color: BrandColors.primary },
  { label: 'Verificados', value: '6', color: BrandColors.secondary },
  { label: 'Puntos', value: '120', color: BrandColors.neutral },
];

const mapPins: MapPin[] = [
  { left: 82, top: 36 },
  { left: 184, top: 78 },
  { left: 292, top: 44 },
];

export function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <PhoneFrame bottomBar={<BottomTabBar items={getMainTabs('inicio')} />}>
      <TopBar />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        <View style={styles.headlineRow}>
          <Text style={styles.headline}>Hola, Pescador</Text>
          <AppSymbol
            name={{ ios: 'sailboat.fill', android: 'directions_boat', web: 'directions_boat' }}
            color={BrandColors.primary}
            size={30}
          />
        </View>

        <View style={styles.actionsStack}>
          <ActionCard
            title="REPORTAR PESCA ILEGAL"
            subtitle="Captura foto y envia"
            color={BrandColors.primary}
            onPress={() => router.push('/reporter')}
            helperIcon={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
            icon={{ ios: 'exclamationmark.triangle.fill', android: 'emergency', web: 'emergency' }}
          />

          <ActionCard
            title="MEDIR CALIDAD DEL AGUA"
            subtitle="Conectar sensor Bluetooth"
            color={BrandColors.secondary}
            height={147}
            helperIcon={{
              ios: 'dot.radiowaves.left.and.right',
              android: 'bluetooth_connected',
              web: 'bluetooth_connected',
            }}
            icon={{ ios: 'drop.fill', android: 'water_drop', web: 'water_drop' }}
          />
        </View>

        <Text style={styles.sectionTitle}>Tu Actividad</Text>
        <ActivityCard stats={activityStats} />
        <MapPreview pins={mapPins} />
      </ScrollView>
    </PhoneFrame>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  headlineRow: {
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: 25,
  },
  headline: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 35,
  },
  actionsStack: {
    gap: 16,
  },
  sectionTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.27,
    marginTop: 50,
    marginBottom: 32,
  },
});
