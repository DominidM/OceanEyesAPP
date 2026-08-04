import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';

import type { MapReport } from './map-report';
import { ReportDetailSheet } from './report-detail-sheet';
import { ReportMarker } from './report-marker';

export type { MapReport } from './map-report';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const DEFAULT_REGION: Region = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const FOCUS_REGION: Region = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

type RealTimeMapProps = {
  reports: MapReport[];
};

export function RealTimeMap({ reports }: RealTimeMapProps) {
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MapReport | null>(null);
  const markerTapped = useRef(false);
  const mapRef = useRef<MapView>(null);

  const handleMapPress = () => {
    if (markerTapped.current) return;
    setSelected(null);
  };

  const handleMarkerPress = (report: MapReport) => {
    markerTapped.current = true;
    setSelected(report);
    mapRef.current?.animateToRegion(
      {
        latitude: report.latitude,
        longitude: report.longitude,
        latitudeDelta: FOCUS_REGION.latitudeDelta,
        longitudeDelta: FOCUS_REGION.longitudeDelta,
      },
      500,
    );
    setTimeout(() => {
      markerTapped.current = false;
    }, 0);
  };

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
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          showsUserLocation={permission?.granted}
          showsMyLocationButton
          rotateEnabled={false}
          pitchEnabled={false}
          showsCompass={false}
          onPress={handleMapPress}>
          {reports.map((report) => (
            <ReportMarker
              key={report.id}
              report={report}
              selected={selected?.id === report.id}
              onPress={() => handleMarkerPress(report)}
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

      <ReportDetailSheet report={selected} onClose={() => setSelected(null)} />
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
