import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import type { ReportCategory, ReportStatus } from '@/shared/firebase/types';

export type MapReport = {
  id: string;
  latitude: number;
  longitude: number;
  category: ReportCategory;
  status: ReportStatus;
};

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const CATEGORY_COLORS: Record<ReportCategory, string> = {
  pesca_ilegal: '#C0392B',
  basura_marina: '#F59E0B',
  variacion_mar: '#2563EB',
};

const STATUS_OPACITY: Record<ReportStatus, number> = {
  pendiente: 0.55,
  en_revision: 0.75,
  verificado: 1,
  descartado: 0.3,
};

const DEFAULT_REGION: Region = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

type RealTimeMapProps = {
  reports: MapReport[];
};

export function RealTimeMap({ reports }: RealTimeMapProps) {
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permission) return;

    if (!permission.granted) {
      setRegion(DEFAULT_REGION);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then((current) => {
        if (!active) return;
        setRegion({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      })
      .catch(() => {
        if (active) setRegion(DEFAULT_REGION);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [permission]);

  const showPermissionPrompt = permission != null && !permission.granted;

  return (
    <View style={styles.container}>
      {region ? (
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          showsUserLocation={permission?.granted}
          showsMyLocationButton
          rotateEnabled={false}
          pitchEnabled={false}
          showsCompass={false}>
          {reports.map((report) => (
            <Marker
              key={report.id}
              coordinate={{ latitude: report.latitude, longitude: report.longitude }}
              pinColor={CATEGORY_COLORS[report.category] ?? BrandColors.primary}
              opacity={STATUS_OPACITY[report.status] ?? 1}
            />
          ))}
        </MapView>
      ) : null}

      {loading ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={BrandColors.primary} size="large" />
        </View>
      ) : null}

      {showPermissionPrompt ? (
        <View style={styles.permissionOverlay}>
          <AppSymbol
            name={{ ios: 'location.slash.fill', android: 'location-off', web: 'location-off' }}
            color={BrandColors.primary}
            size={28}
          />
          <Text style={styles.permissionTitle}>Activa tu ubicación</Text>
          <Text style={styles.permissionBody}>El mapa mostrará tu posición en tiempo real.</Text>
          {permission.canAskAgain ? (
            <Pressable
              accessibilityRole="button"
              onPress={requestPermission}
              style={({ pressed }) => [styles.permissionButton, pressed && styles.pressed]}>
              <Text style={styles.permissionButtonLabel}>Permitir acceso</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  permissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  permissionTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
    includeFontPadding: false,
  },
  permissionBody: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  permissionButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 4,
    backgroundColor: BrandColors.primary,
    borderRadius: 9999,
  },
  permissionButtonLabel: {
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
