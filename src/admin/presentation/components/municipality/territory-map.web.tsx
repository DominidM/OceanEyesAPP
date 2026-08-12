import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type * as L from 'leaflet';

import { useAdminTheme } from '@admin/theme/context';
import type { GeoBounds } from '@/shared/firebase/types';

type TerritoryMapProps = {
  bounds?: GeoBounds;
  onChange: (bounds: GeoBounds) => void;
  height?: number;
};

type Corner = { latitude: number; longitude: number };

export function TerritoryMap({ bounds, onChange, height = 360 }: TerritoryMapProps) {
  const { colors } = useAdminTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const firstCornerRef = useRef<Corner | null>(null);
  const onChangeRef = useRef(onChange);
  const [selectingSecond, setSelectingSecond] = useState(false);
  const south = bounds?.south;
  const west = bounds?.west;
  const north = bounds?.north;
  const east = bounds?.east;

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    import('leaflet').then(({ map: createMap, tileLayer, rectangle, circleMarker }) => {
      if (cancelled || !containerRef.current) return;
      const center: L.LatLngExpression = south != null && west != null && north != null && east != null
        ? [(south + north) / 2, (west + east) / 2]
        : [-12.1211, -77.0297];
      const map = createMap(containerRef.current, { center, zoom: south != null ? 13 : 12 });
      mapRef.current = map;
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      if (south != null && west != null && north != null && east != null) {
        const area: L.LatLngBoundsExpression = [[south, west], [north, east]];
        rectangle(area, { color: '#0D9488', weight: 3, fillColor: '#0D9488', fillOpacity: 0.22 }).addTo(map);
        map.fitBounds(area, { padding: [30, 30] });
      }

      map.on('click', (event: L.LeafletMouseEvent) => {
        const corner = { latitude: event.latlng.lat, longitude: event.latlng.lng };
        if (!firstCornerRef.current) {
          firstCornerRef.current = corner;
          circleMarker(event.latlng, { radius: 7, color: '#0D9488', fillOpacity: 1 }).addTo(map);
          setSelectingSecond(true);
          return;
        }
        const first = firstCornerRef.current;
        firstCornerRef.current = null;
        setSelectingSecond(false);
        onChangeRef.current({
          south: Math.min(first.latitude, corner.latitude),
          west: Math.min(first.longitude, corner.longitude),
          north: Math.max(first.latitude, corner.latitude),
          east: Math.max(first.longitude, corner.longitude),
        });
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [south, west, north, east]);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.hint, { color: colors.contentTextMuted }]}>
        {selectingSecond ? 'Ahora haz clic en la esquina opuesta.' : 'Haz clic en dos esquinas opuestas para marcar el territorio.'}
      </Text>
      <View style={[styles.mapFrame, { height, borderColor: colors.cardBorder }]}>
        <div ref={containerRef} style={styles.map} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', gap: 8 },
  hint: { fontSize: 13 },
  mapFrame: { width: '100%', overflow: 'hidden', borderRadius: 16, borderWidth: 1 },
  map: { width: '100%', height: '100%', zIndex: 0 },
});
