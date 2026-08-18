import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { useLiveReports } from '@/shared/hooks/use-live-reports';
import { shadow } from '@/shared/utils/shadows';
import type { ReportCategory } from '@/shared/firebase/types';

import { RealTimeMap } from '../components/real-time-map';
import { CATEGORY_COLORS, isMapReport, REPORT_CATEGORY_LABELS, toMapReport, type MapReport } from '../components/map-report';

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reports } = useLiveReports<MapReport>((items) => items.map(toMapReport).filter(isMapReport));
  const [activeCategories, setActiveCategories] = useState<Set<string> | null>(null);

  const toggleCategory = (category: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev ?? (Object.keys(REPORT_CATEGORY_LABELS) as ReportCategory[]));
      if (next.has(category) && next.size === 1) return next;
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.frame}>
        <RealTimeMap reports={reports} activeCategories={activeCategories} />

        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerRow}>
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
            <AppText style={styles.headerTitle}>Mapa en Tiempo Real</AppText>
            <View style={styles.headerSpacer} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}>
            {Object.entries(REPORT_CATEGORY_LABELS).map(([category, label]) => {
              const active = !activeCategories || activeCategories.has(category);
              const color = CATEGORY_COLORS[category as ReportCategory] ?? BrandColors.primary;
              return (
                <Pressable
                  key={category}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => toggleCategory(category)}
                  style={[styles.filterChip, active && { backgroundColor: color }]}>
                  <AppText style={[styles.filterChipLabel, { color: active ? '#FFFFFF' : 'rgba(44,44,44,0.75)' }]}>
                    {label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(239, 235, 227, 0.96)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
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
  filterContent: {
    paddingVertical: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(19,78,94,0.2)',
  },
  filterChipLabel: {
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '600',
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
