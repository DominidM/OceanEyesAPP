import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type * as L from 'leaflet';

type ReportMapProps = {
  latitude: number;
  longitude: number;
  title?: string;
  height?: number;
};

export function ReportMap({ latitude, longitude, title, height = 320 }: ReportMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    import('leaflet').then(({ map: createMap, tileLayer, marker, divIcon }) => {
      if (cancelled || !containerRef.current) return;

      const map = createMap(containerRef.current, {
        center: [latitude, longitude],
        zoom: 14,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = divIcon({
        className: 'report-map-pin',
        html: `<div style="width:26px;height:26px;border-radius:50%;background:#134E5E;border:3px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const pin = marker([latitude, longitude], { icon }).addTo(map);
      if (title) pin.bindPopup(title).openPopup();
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, title]);

  return (
    <View style={[styles.wrapper, { height }]}>
      <div ref={containerRef} style={styles.container} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(19,78,94,0.15)',
  },
  container: {
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
});
