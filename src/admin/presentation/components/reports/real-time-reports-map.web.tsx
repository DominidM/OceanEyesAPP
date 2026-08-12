import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { REPORT_CATEGORIES, type Report, type ReportStatus } from '@/shared/firebase/types';

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

const STATUS_LABEL: Record<ReportStatus, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  verificado: 'Verificado',
  descartado: 'Descartado',
};

function buildReportHtml(report: Report, reportId: string): string {
  const categoryLabel = REPORT_CATEGORIES[report.category]?.label ?? report.category;
  const color = STATUS_COLOR[report.status];
  const created = report.createdAt?.toDate?.();
  const dateText = created
    ? created.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  const description = report.description
    ? report.description.length > 140
      ? `${report.description.slice(0, 140)}…`
      : report.description
    : '';

  return `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 260px; padding: 4px;">
      <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color};"></span>
        <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#64748B;">${categoryLabel} · ${STATUS_LABEL[report.status]}</span>
      </div>
      <div style="font-weight:700; font-size:14px; color:#134E5E;">${report.title}</div>
      ${description ? `<div style="font-size:12.5px; color:#475569; margin-top:4px; line-height:1.45;">${description}</div>` : ''}
      ${dateText ? `<div style="font-size:11.5px; color:#94A3B8; margin-top:6px;">${dateText}</div>` : ''}
      ${report.location?.address ? `<div style="font-size:11.5px; color:#94A3B8; margin-top:2px;">${report.location.address}</div>` : ''}
      <a href="/admin/reports/${reportId}" style="display:inline-block; margin-top:8px; font-size:12px; color:#0F766E; font-weight:600; text-decoration:none; cursor:pointer;">Ver detalle →</a>
    </div>
  `;
}

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

export function RealTimeReportsMap({ reports, onSelectReport, height = 640 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const fittedRef = useRef(false);
  const pinnedRef = useRef(false);
  const selectRef = useRef(onSelectReport);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  selectRef.current = onSelectReport;

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.id = 'oe-map-styles';
    styleEl.textContent = [
      'button.gm-ui-hack { display: none !important; visibility: hidden !important; width: 0 !important; height: 0 !important; }',
      '.gm-style-iw-c button { display: none !important; visibility: hidden !important; }',
      '.gm-style-iw > button { display: none !important; visibility: hidden !important; }',
      '.gm-style-iw::-webkit-scrollbar { display: none !important; }',
      '.gm-style-iw { scrollbar-width: none !important; overflow: hidden !important; }',
      '.gm-style { overflow: hidden !important; }',
      '.gm-style > div { overflow: hidden !important; }',
      '.gm-style-iw-c { overflow: hidden !important; }',
      '.gm-style-iw-d { overflow: hidden !important; }',
    ].join(' ');
    document.head.appendChild(styleEl);

    const observer = new MutationObserver(() => {
      document.querySelectorAll('.gm-style-iw-c button, .gm-style-iw > button, .gm-style-iw-c .gm-ui-hack').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
        (el as HTMLElement).style.visibility = 'hidden';
        (el as HTMLElement).style.width = '0';
        (el as HTMLElement).style.height = '0';
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      styleEl.remove();
      observer.disconnect();
    };
  }, []);

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
          center: { lat: -12.0464, lng: -77.0428 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          scrollwheel: true,
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
    if (!infoWindowRef.current) {
      infoWindowRef.current = new maps.InfoWindow();
      infoWindowRef.current.addListener('closeclick', () => {
        pinnedRef.current = false;
      });
    }
    const infoWindow = infoWindowRef.current;
    const bounds = new maps.LatLngBounds();
    reports.forEach((report) => {
      if (!report.location) return;
      const position = { lat: report.location.latitude, lng: report.location.longitude };
      const marker = new maps.Marker({
        map,
        position,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          fillColor: STATUS_COLOR[report.status],
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
          scale: 10,
        },
      });
      marker.addListener('click', () => {
        pinnedRef.current = true;
        map.panTo(position);
        map.setZoom(Math.max(map.getZoom(), 14));
        infoWindow.setContent(buildReportHtml(report, report.id));
        infoWindow.open(map, marker);
      });
      marker.addListener('mouseover', () => {
        if (!pinnedRef.current) {
          infoWindow.setContent(buildReportHtml(report, report.id));
          infoWindow.open(map, marker);
        }
      });
      marker.addListener('mouseout', () => {
        if (!pinnedRef.current) {
          infoWindow.close();
        }
      });
      markersRef.current.push(marker);
      bounds.extend(position);
    });
    if (!fittedRef.current) {
      if (markersRef.current.length === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(15);
      } else if (markersRef.current.length > 1) {
        map.fitBounds(bounds, 52);
      }
      fittedRef.current = true;
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
  container: { width: '100%', height: '100%', overflow: 'hidden' },
  error: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF7ED' },
  errorText: { color: '#C2410C', fontSize: 14 },
});
