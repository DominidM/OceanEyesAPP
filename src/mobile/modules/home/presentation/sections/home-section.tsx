import React, { useMemo } from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppSymbol } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';
import { isFirebaseConfigured } from '@/shared/firebase/config';
import { useAuth } from '@/shared/firebase/auth-context';
import type { ReportDto } from '@/modules/reports/application/dto/report.dto';
import { useAsyncData } from '@/shared/hooks/use-async-data';
import { useDb } from '@/shared/hooks/use-db';
import { useGuestStatus } from '@/shared/hooks/use-guest-status';
import { useLiveReports } from '@/shared/hooks/use-live-reports';

import { ActionCard } from '../components/action-card';
import { ActivityCard, ActivityStat } from '../components/activity-card';
import { MapPreview } from '../components/map-preview';
import { isMapReport, toMapReport, type MapReport } from '../components/map-report';
import { TopBar } from '../components/top-bar';

type HomeSectionProps = {
  onExpandMap?: () => void;
  onAlertsPress?: () => void;
  onAlertReportPress?: () => void;
  onPendingPress?: () => void;
};

export function HomeSection({ onExpandMap, onAlertsPress, onAlertReportPress, onPendingPress }: HomeSectionProps) {
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const guest = useGuestStatus();
  const db = useDb('reports');
  const { data: myReports } = useAsyncData<ReportDto[]>(
    async () => {
      if (!isFirebaseConfigured() || guest || !user) return [];
      return db.getMyReports(user.uid);
    },
    [guest, db, user],
  );
  const { reports } = useLiveReports<MapReport>((items) => items.map(toMapReport).filter(isMapReport));
  const myReportCount = myReports?.length ?? 0;

  const activityStats: ActivityStat[] = useMemo(
    () => [
      { label: 'Reportes', value: guest ? '0' : String(myReportCount), color: BrandColors.primary },
      {
        label: 'Verificados',
        value: guest ? '0' : String(profile?.verifiedReportsCount ?? 0),
        color: BrandColors.secondary,
      },
      {
        label: 'Puntos',
        value: guest ? '0' : (profile?.pointsBalance ?? 0).toLocaleString('es-PE'),
        color: BrandColors.neutral,
      },
    ],
    [guest, myReportCount, profile],
  );

  return (
    <>
      <TopBar onPendingPress={onPendingPress} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        <View style={styles.headlineRow}>
          <AppText style={styles.headline}>
            {profile?.displayName ? `Hola, ${profile.displayName}` : 'Hola, Guardián del Mar'}
          </AppText>
          <AppSymbol
            name={{ ios: 'sailboat.fill', android: 'directions-boat', web: 'directions-boat' }}
            color={BrandColors.primary}
            size={30}
          />
        </View>

        <AppText style={styles.sectionTitle}>Tu Actividad</AppText>
        <ActivityCard stats={activityStats} />

        <MapPreview reports={reports} onExpand={onExpandMap} />

        <View style={styles.actionsStack}>
          <ActionCard
            title="VER ALERTAS EN MI ZONA"
            subtitle="Reportes verificados cerca de ti"
            color={BrandColors.secondary}
            height={104}
            onPress={onAlertsPress}
            helperIcon={{
              ios: 'location.fill',
              android: 'my-location',
              web: 'my-location',
            }}
            icon={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
          />

          <ActionCard
            title="ALERTAR A MI ZONA"
            subtitle="Envía una señal rápida de peligro"
            color={BrandColors.primary}
            height={104}
            onPress={onAlertReportPress}
            helperIcon={{
              ios: 'megaphone.fill',
              android: 'campaign',
              web: 'campaign',
            }}
            icon={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
          />
        </View>

      </ScrollView>
    </>
  );
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: 12,
  },
  headline: {
    flexShrink: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 35,
    includeFontPadding: false,
  },
  actionsStack: {
    gap: 10,
    marginTop: 12,
  },
  sectionTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.27,
    includeFontPadding: false,
    marginTop: 0,
    marginBottom: 8,
  },
});
