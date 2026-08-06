import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { useCurrentLocation } from '@/shared/hooks/use-current-location';
import { useLiveReports } from '@/shared/hooks/use-live-reports';
import type { ReportDto } from '@/modules/reports/application/dto/report.dto';

import { AlertCard, type Alert } from '../components/alert-card';
import { haversineKm } from '../utils/distance';

export function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { permission, requestPermission, position, loading: locating, refetch: fetchPosition } =
    useCurrentLocation();
  const { reports } = useLiveReports();

  const alerts = useMemo(() => toAlerts(reports, position), [reports, position]);

  return (
    <View style={styles.screen}>
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
        <AppText style={styles.headerTitle}>Alertas en mi zona</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {locating ? (
          <StateBox>
            <ActivityIndicator color={BrandColors.primary} size="large" />
            <AppText style={styles.stateTitle}>Ubicando reportes cerca de ti...</AppText>
          </StateBox>
        ) : permission && !permission.granted ? (
          <StateBox>
            <AppSymbol
              name={{ ios: 'location.slash.fill', android: 'location-off', web: 'location-off' }}
              color={BrandColors.primary}
              size={28}
            />
            <AppText style={styles.stateTitle}>Activa tu ubicación</AppText>
            <AppText style={styles.stateText}>Las alertas se ordenan según tu distancia.</AppText>
            {permission.canAskAgain ? (
              <Pressable
                accessibilityRole="button"
                onPress={requestPermission}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
                <AppText style={styles.actionButtonLabel}>Permitir acceso</AppText>
              </Pressable>
            ) : null}
          </StateBox>
        ) : position == null ? (
          <StateBox>
            <AppSymbol
              name={{ ios: 'wifi.exclamationmark', android: 'location-off', web: 'location-off' }}
              color={BrandColors.primary}
              size={28}
            />
            <AppText style={styles.stateTitle}>No pudimos obtener tu ubicación</AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => void fetchPosition()}
              style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
              <AppText style={styles.actionButtonLabel}>Reintentar</AppText>
            </Pressable>
          </StateBox>
        ) : alerts.length === 0 ? (
          <StateBox>
            <AppSymbol
              name={{ ios: 'bell.slash.fill', android: 'notifications-off', web: 'notifications-off' }}
              color={BrandColors.primary}
              size={28}
            />
            <AppText style={styles.stateTitle}>Sin alertas por ahora</AppText>
            <AppText style={styles.stateText}>Los reportes verificados cerca de ti aparecerán aquí.</AppText>
          </StateBox>
        ) : (
          <View style={styles.list}>
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function toAlerts(reports: ReportDto[], position: Location.LocationObject | null): Alert[] {
  if (!position) return [];

  const { latitude, longitude } = position.coords;
  const alerts: Alert[] = [];
  for (const report of reports) {
    const location = report.location;
    if (
      report.status !== 'verificado' ||
      !location ||
      location.latitude == null ||
      location.longitude == null
    ) {
      continue;
    }
    const date = new Date(report.createdAt);
    alerts.push({
      id: report.id,
      category: report.category,
      title: report.title,
      address: location.address,
      distanceKm: haversineKm(latitude, longitude, location.latitude, location.longitude),
      date: date.toLocaleDateString(),
    });
  }

  return alerts.sort((a, b) => a.distanceKm - b.distanceKm);
}

function StateBox({ children }: { children: React.ReactNode }) {
  return <View style={styles.stateBox}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D9CFC5',
    backgroundColor: 'rgba(239, 235, 227, 0.95)',
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
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: -0.27,
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  list: {
    gap: 12,
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  stateTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
    includeFontPadding: false,
  },
  stateText: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  actionButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 4,
    backgroundColor: BrandColors.primary,
    borderRadius: 9999,
  },
  actionButtonLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
