import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { shadow } from '@/shared/utils/shadows';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { subscribeReports } from '@/shared/firebase/reports';
import type { Report as FirestoreReport } from '@/shared/firebase/types';

import { RealTimeMap, type MapReport } from '../components/real-time-map';

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [reports, setReports] = useState<MapReport[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    return subscribeReports((items) => setReports(items.map(toMapReport).filter(isMapReport)));
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.frame}>
        <RealTimeMap reports={reports} />

        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
            <AppSymbol
              name={{ ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' }}
              color={BrandColors.neutral}
              size={20}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Mapa en Tiempo Real</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.legend, { bottom: Math.max(insets.bottom, 12) }]}>
          <LegendItem color="#C0392B" label="Pesca ilegal" />
          <LegendItem color="#F59E0B" label="Basura marina" />
          <LegendItem color="#2563EB" label="Variación del mar" />
        </View>
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
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
  screen: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: BrandColors.tertiary,
  },
  frame: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: 430,
    position: 'relative',
    backgroundColor: '#E5E7EB',
    ...shadow('lift'),
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(239, 235, 227, 0.96)',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.27,
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerSpacer: {
    width: 40,
  },
  legend: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 9999,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
