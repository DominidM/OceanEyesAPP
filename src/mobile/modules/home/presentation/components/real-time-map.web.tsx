import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type * as L from 'leaflet';

import { BrandColors } from '@/constants/theme';

import type { MapReport } from './map-report';
import { CATEGORY_COLORS } from './map-report';
import { buildClusters, buildHeatCells, heatColor } from './map-layers';

type RealTimeMapProps = {
  reports: MapReport[];
  activeCategories?: Set<string> | null;
  showFilters?: boolean;
};

type LMapModule = typeof import('leaflet');

export function RealTimeMap({ reports, showFilters = true }: RealTimeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const LRef = useRef<LMapModule | null>(null);

  const initLazy = async () => {
    if (LRef.current || !containerRef.current) return;
    const leaflet = await import('leaflet');
    LRef.current = leaflet;

    const map = leaflet.map(containerRef.current, {
      center: [-12.0464, -77.0428],
      zoom: 11,
      scrollWheelZoom: true,
    });
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = leaflet.layerGroup().addTo(map);
    mapRef.current = map;
  };

  useEffect(() => {
    void initLazy();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      LRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = LRef.current;
    const layer = layerRef.current;
    if (!L || !layer || !mapRef.current) return;
    if (layer.getLayers().length > 0) layer.clearLayers();
    if (reports.length === 0) return;

    const visibleReports = !activeCategories || activeCategories.size === 0
      ? reports
      : reports.filter((r) => activeCategories.has(r.category));

    const { cells } = buildHeatCells(visibleReports);
    const clusters = buildClusters(visibleReports);
    const clusterIdSet = new Set(clusters.map((c) => c.id));

    for (const cell of cells) {
      L.circle([cell.lat, cell.lng], {
        radius: 650,
        fillColor: heatColor(cell.count, cell.maxCount),
        fillOpacity: Math.min(0.55, 0.25 + 0.15 * (cell.count / cell.maxCount)),
        stroke: false,
      }).addTo(layer);
    }

    const clusterRound = (lat: number, lng: number) => `${Math.round(lat / 0.04)}:${Math.round(lng / 0.04)}`;

    for (const report of visibleReports) {
      if (clusterIdSet.has(clusterRound(report.latitude, report.longitude))) continue;
      const color = CATEGORY_COLORS[report.category] ?? BrandColors.primary;
      const icon = L.divIcon({
        className: 'map-heat-pin',
        html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([report.latitude, report.longitude], { icon })
        .bindPopup(`<strong>${report.title}</strong>${report.address ? `<br/>${report.address}` : ''}`)
        .addTo(layer);
    }

    for (const cluster of clusters) {
      const icon = L.divIcon({
        className: 'map-heat-pin',
        html: `<div style="min-width:32px;height:32px;padding:0 8px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:${BrandColors.primary};border:2px solid #FFFFFF;color:#FFFFFF;font-weight:700;font-size:14px;font-family:Inter_400Regular, system-ui;">${cluster.count}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([cluster.lat, cluster.lng], { icon })
        .bindPopup(`<strong>${cluster.count} reportes cercanos</strong>`)
        .addTo(layer);
    }
  }, [reports, activeCategories]);

  return (
    <View style={styles.container}>
      <div ref={containerRef} style={styles.map} />
      {showFilters && <View style={styles.filterBar} pointerEvents="box-none">
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
                onPress={() => toggleCategory(category)}
                style={[styles.filterChip, active && { backgroundColor: color }]}>
                <AppText style={[styles.filterChipLabel, { color: active ? '#FFFFFF' : 'rgba(44,44,44,0.75)' }]}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  map: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  filterBar: {
    position: 'absolute' as const,
    top: 64,
    left: 0,
    right: 0,
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row' as const,
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
});
