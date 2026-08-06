import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useCurrentLocation } from '@/shared/hooks/use-current-location';
import { usePreferences } from '@/shared/settings/preferences';
import { useAuth } from '@/shared/firebase/auth-context';
import { REPORT_CATEGORIES, type Report as FirestoreReport } from '@/shared/firebase/types';
import { subscribeReports } from '@/shared/firebase/reports';
import { haversineKm, formatDistance } from '@/modules/alerts/presentation/utils/distance';

export const NEAR_RADIUS_KM = 25;

const CHANNEL_ID = 'oceaneyes';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'OceanEyes',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#134E5E',
  });
}

export async function getNotificationPermissionStatus(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  return current.granted;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (current.status === 'undetermined' || current.canAskAgain) {
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  }
  return false;
}

async function scheduleNearNotification(report: FirestoreReport, km: number): Promise<void> {
  const categoryLabel = REPORT_CATEGORIES[report.category]?.label ?? 'Reporte';
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Reporte verificado cerca de ti',
      body: `${categoryLabel}: ${report.title} (${formatDistance(km)})`,
      data: { kind: 'near', reportId: report.id },
    },
    trigger: null,
  });
}

async function scheduleStatusNotification(report: FirestoreReport): Promise<void> {
  let body: string;
  if (report.status === 'verificado') {
    body = 'Tu reporte fue verificado y te sumó puntos.';
  } else if (report.status === 'descartado') {
    body = report.rejectionReason
      ? `Tu reporte fue descartado: ${report.rejectionReason}`
      : 'Tu reporte fue descartado.';
  } else {
    body = 'Tu reporte está en revisión.';
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Actualización de tu reporte',
      body,
      data: { kind: 'status', reportId: report.id },
    },
    trigger: null,
  });
}

export function useReportNotifications(): void {
  const { notifyNear, notifyStatus } = usePreferences();
  const { user } = useAuth();
  const { position } = useCurrentLocation();

  const prefsRef = useRef({ notifyNear, notifyStatus });
  prefsRef.current = { notifyNear, notifyStatus };
  const userRef = useRef(user);
  userRef.current = user;
  const positionRef = useRef(position);
  positionRef.current = position;

  const seenNear = useRef<Set<string>>(new Set());
  const seenStatus = useRef<Map<string, FirestoreReport['status']>>(new Map());
  const primed = useRef(false);

  useEffect(() => {
    void ensureNotificationChannel().catch(() => undefined);
  }, []);

  const enabled = notifyNear || notifyStatus;

  useEffect(() => {
    if (!enabled) {
      primed.current = false;
      return;
    }

    const unsubscribe = subscribeReports((reports) => {
      const { notifyNear: nearOn, notifyStatus: statusOn } = prefsRef.current;
      const currentUser = userRef.current;
      const currentPosition = positionRef.current;

      for (const report of reports) {
        if (nearOn && currentPosition && report.status === 'verificado' && report.location) {
          const km = haversineKm(
            currentPosition.coords.latitude,
            currentPosition.coords.longitude,
            report.location.latitude,
            report.location.longitude,
          );
          if (km <= NEAR_RADIUS_KM && !seenNear.current.has(report.id)) {
            seenNear.current.add(report.id);
            if (primed.current) void scheduleNearNotification(report, km).catch(() => undefined);
          }
        }

        if (statusOn && currentUser && report.userId === currentUser.uid) {
          const previous = seenStatus.current.get(report.id);
          if (previous && previous !== report.status && report.status !== 'pendiente') {
            if (primed.current) void scheduleStatusNotification(report).catch(() => undefined);
          }
          seenStatus.current.set(report.id, report.status);
        }
      }

      primed.current = true;
    });

    return unsubscribe;
  }, [enabled]);

  useEffect(() => {
    if (enabled) return;
    seenNear.current.clear();
    seenStatus.current.clear();
  }, [enabled]);
}

export function NotificationsWatcher(): null {
  useReportNotifications();
  return null;
}
