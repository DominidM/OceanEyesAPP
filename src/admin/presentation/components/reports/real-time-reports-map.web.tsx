import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Report, ReportStatus } from '@/shared/firebase/types';

type Props = {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  height?: number;
};

const SCRIPT_ID = 'oceaneyes-google-maps';
const STATUS_COLOR: Record<ReportStatus, string> = {
  pendiente: '#F59E0B',
  en_revision: '#3B82F6',
  verificado: '#10B981',
  descartado: '#64748B',
};

function loadGoogleMaps(apiKey: string): Promise<any> {
  const browserWindow = window as any;
  if (browserWindow.google?.maps) return Promise.resolve(browserWindow.google.maps);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const finish = () => browserWindow.google?.maps
      ? resolve(browserWindow.google.maps)
      : reject(new Error('Google Maps no terminó de cargar.'));
    if (existing) {
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', () => reject(new Error('No se pudo cargar Google Maps.')), { once: true });
    document.head.appendChild(script);
  });
}

export function RealTimeReportsMap({ reports, onSelectReport, height = 560 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const selectRef = useRef(onSelectReport);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  selectRef.current = onSelectReport;

  useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
    if (!apiKey) {
      setError('Falta configurar EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.');
      return;
    }
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new maps.Map(containerRef.current, {
          center: { lat: -9.19, lng: -75.0152 },
          zoom: 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        setReady(true);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'No se pudo cargar el mapa.'));
    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const maps = (window as any).google?.maps;
    const map = mapRef.current;
    if (!maps || !map) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    const bounds = new maps.LatLngBounds();
    reports.forEach((report) => {
      if (!report.location) return;
      const position = { lat: report.location.latitude, lng: report.location.longitude };
      const marker = new maps.Marker({
        map,
        position,
        title: report.title,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          fillColor: STATUS_COLOR[report.status],
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
          scale: 10,
        },
      });
      marker.addListener('click', () => selectRef.current(report));
      markersRef.current.push(marker);
      bounds.extend(position);
    });
    if (markersRef.current.length === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(15);
    } else if (markersRef.current.length > 1) {
      map.fitBounds(bounds, 52);
    }
  }, [reports, ready]);

  return (
    <View style={[styles.wrapper, { height }]}>
      <div ref={containerRef} style={styles.container} />
      {!!error && <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', overflow: 'hidden', borderRadius: 16, position: 'relative' },
  container: { width: '100%', height: '100%' },
  error: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF7ED' },
  errorText: { color: '#C2410C', fontSize: 14 },
});
