import React, { useEffect, useMemo, useRef, useState } from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import MapView, { Circle, Marker } from 'react-native-maps';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { useCurrentLocation } from '@/shared/hooks/use-current-location';

import type { MapReport } from './map-report';
import { buildClusters, buildHeatCells, heatColor } from './map-layers';
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
  activeCategories?: Set<string> | null;
};

export function RealTimeMap({ reports, activeCategories }: RealTimeMapProps) {
  const { permission, requestPermission, position, loading } = useCurrentLocation();
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selected, setSelected] = useState<MapReport | null>(null);
  const markerTapped = useRef(false);
  const mapRef = useRef<MapView>(null);

  const visibleReports = useMemo(() => {
    if (!activeCategories || activeCategories.size === 0) return reports;
    return reports.filter((r) => activeCategories.has(r.category));
  }, [reports, activeCategories]);

  const { cells } = useMemo(() => buildHeatCells(visibleReports), [visibleReports]);
  const clusters = useMemo(() => buildClusters(visibleReports), [visibleReports]);
  const clusterIds = useMemo(() => new Set(clusters.map((c) => c.id)), [clusters]);

  const soloReports = useMemo(
    () => visibleReports.filter((r) => {
      const key = `${Math.round(r.latitude / 0.04)}:${Math.round(r.longitude / 0.04)}`;
      return !clusterIds.has(key);
    }),
    [visibleReports, clusterIds],
  );

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

  const handleClusterPress = (lat: number, lng: number, count: number) => {
    markerTapped.current = true;
    const delta = Math.max(0.05, 0.02 * Math.sqrt(count));
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: delta, longitudeDelta: delta },
      400,
    );
    setTimeout(() => {
      markerTapped.current = false;
    }, 0);
  };

  useEffect(() => {
    if (!position) return;
    const next = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    setRegion(next);
    mapRef.current?.animateToRegion(next, 600);
  }, [position]);

  const showPermissionPrompt = permission != null && !permission.granted;

  return (
    <View style={styles.container}>
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
        {cells.map((cell, index) => (
          <Circle
            key={`cell-${index}`}
            center={{ latitude: cell.lat + 0.01, longitude: cell.lng + 0.01 }}
            radius={800}
            strokeWidth={0}
            fillColor={`${heatColor(cell.count, cell.maxCount)}${Math.min(255, 60 + 40 * (cell.count / cell.maxCount))}`}
          />
        ))}

        {soloReports.map((report) => (
          <ReportMarker
            key={report.id}
            report={report}
            selected={selected?.id === report.id}
            onPress={() => handleMarkerPress(report)}
          />
        ))}

        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            coordinate={{ latitude: cluster.lat, longitude: cluster.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            onPress={() => handleClusterPress(cluster.lat, cluster.lng, cluster.count)}>
            <View style={styles.cluster}>
              <AppText style={styles.clusterCount}>{cluster.count}</AppText>
            </View>
          </Marker>
        ))}
      </MapView>

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
          <AppText style={styles.permissionTitle}>Activa tu ubicación</AppText>
          <AppText style={styles.permissionBody}>El mapa mostrará tu posición en tiempo real.</AppText>
          {permission.canAskAgain ? (
            <Pressable
              accessibilityRole="button"
              onPress={requestPermission}
              style={({ pressed }) => [styles.permissionButton, pressed && styles.pressed]}>
              <AppText style={styles.permissionButtonLabel}>Permitir acceso</AppText>
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
  cluster: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: BrandColors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  clusterCount: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '800',
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});