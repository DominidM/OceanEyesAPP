import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { subscribeReports } from '@/shared/firebase/reports';
import type { Report as FirestoreReport } from '@/shared/firebase/types';

import { ActionCard } from '../components/action-card';
import { ActivityCard, ActivityStat } from '../components/activity-card';
import { MapPreview } from '../components/map-preview';
import type { MapReport } from '../components/real-time-map';
import { TopBar } from '../components/top-bar';

const activityStats: ActivityStat[] = [
  { label: 'Reportes', value: '8', color: BrandColors.primary },
  { label: 'Verificados', value: '6', color: BrandColors.secondary },
  { label: 'Puntos', value: '120', color: BrandColors.neutral },
];

type HomeSectionProps = {
  onReportPress?: () => void;
  onExpandMap?: () => void;
};

export function HomeSection({ onReportPress, onExpandMap }: HomeSectionProps) {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<MapReport[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return subscribeReports((items) => setReports(items.map(toMapReport).filter(isMapReport)));
  }, []);

  return (
    <>
      <TopBar />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        <View style={styles.headlineRow}>
          <Text style={styles.headline}>Hola, Pescador</Text>
          <AppSymbol
            name={{ ios: 'sailboat.fill', android: 'directions-boat', web: 'directions-boat' }}
            color={BrandColors.primary}
            size={30}
          />
        </View>

        <View style={styles.actionsStack}>
          <ActionCard
            title="REPORTAR PESCA ILEGAL"
            subtitle="Captura foto y envia"
            color={BrandColors.primary}
            onPress={onReportPress}
            helperIcon={{ ios: 'camera.fill', android: 'photo-camera', web: 'photo-camera' }}
            icon={{ ios: 'exclamationmark.triangle.fill', android: 'emergency', web: 'emergency' }}
          />

          <ActionCard
            title="MEDIR CALIDAD DEL AGUA"
            subtitle="Conectar sensor Bluetooth"
            color={BrandColors.secondary}
            height={147}
            helperIcon={{
              ios: 'dot.radiowaves.left.and.right',
              android: 'bluetooth-connected',
              web: 'bluetooth-connected',
            }}
            icon={{ ios: 'drop.fill', android: 'water-drop', web: 'water-drop' }}
          />
        </View>

        <Text style={styles.sectionTitle}>Tu Actividad</Text>
        <ActivityCard stats={activityStats} />
        <MapPreview reports={reports} onExpand={onExpandMap} />
      </ScrollView>
    </>
  );
}

function toMapReport(report: FirestoreReport): MapReport | null {
  const latitude = report.location?.latitude;
  const longitude = report.location?.longitude;
  if (latitude == null || longitude == null) return null;
  return {
    id: report.id,
    latitude,
    longitude,
    category: report.category,
    status: report.status,
  };
}

function isMapReport(report: MapReport | null): report is MapReport {
  return report != null;
}

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
    includeFontPadding: false,
  },
  actionsStack: {
    gap: 16,
  },
  sectionTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.27,
    includeFontPadding: false,
    marginTop: 20,
    marginBottom: 20,
  },
});
