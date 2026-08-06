import { useRouter } from 'expo-router';
import React from 'react';
import {DimensionValue, Pressable, StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';

import { ReportFlowColors as C } from '../theme';

type ReportTopBarProps = {
  step: number;
  totalSteps: number;
  progress: number;
};

export function ReportTopBar({ step, totalSteps, progress }: ReportTopBarProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <AppText style={styles.title}>Nuevo Reporte</AppText>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={styles.close}>
          <AppSymbol name={{ ios: 'xmark', android: 'close', web: 'close' }} color={C.headerText} size={14} />
        </Pressable>
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressLabels}>
          <AppText style={styles.stepLabel}>{`Paso ${step} de ${totalSteps}`}</AppText>
          <AppText style={styles.stepLabel}>{`${progress}%`}</AppText>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` as DimensionValue }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 24,
    backgroundColor: C.header,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    color: C.headerText,
    fontFamily: Fonts.label,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.27,
    includeFontPadding: false,
  },
  close: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.headerIconBg,
    borderRadius: 9999,
  },
  progressBlock: {
    gap: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepLabel: {
    color: C.headerTextMuted,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    includeFontPadding: false,
  },
  track: {
    width: '100%',
    height: 8,
    backgroundColor: C.progressTrack,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    backgroundColor: C.progressFill,
    borderRadius: 9999,
  },
});
