import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { canRegisterPushToken } from './notification-bridge';
import { useCurrentLocation } from '@/shared/hooks/use-current-location';
import { usePreferences } from '@/shared/settings/preferences';
import { useAuth } from '@/shared/firebase/auth-context';
import { REPORT_CATEGORIES, type Report as FirestoreReport } from '@/shared/firebase/types';
import { subscribeReports } from '@/shared/firebase/reports';
import { subscribeActiveAlerts } from '@/shared/firebase/alerts';
import { saveDeviceToken } from '@/shared/firebase/device-tokens';
import { haversineKm, formatDistance } from '@/modules/alerts/presentation/utils/distance';

export const NEAR_RADIUS_KM = 25;

const CHANNEL_ID = 'oceaneyes';
const ALERT_CHANNEL_ID = 'official-alerts';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
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

async function ensureAlertChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ALERT_CHANNEL_ID, {
    name: 'Alertas de peligro',
    importance: Notifications.AndroidImportance.MAX,
    bypassDnd: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    vibrationPattern: [0, 500, 250, 500, 250, 500, 250, 500],
    lightColor: '#EF4444',
    sound: 'alarma_peligro.wav',
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
    },
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

export async function registerPushToken(userId: string): Promise<string | null> {
  if (!canRegisterPushToken()) return null;
  const granted = await requestNotificationPermission();
  if (!granted) return null;
  const projectId =
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  if (!projectId) return null;
  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await saveDeviceToken(token, userId, Platform.OS);
    return token;
  } catch {
    return null;
  }
}

const ALARM_BURST_DELAYS = [0, 2, 4, 6, 8, 10];

function alertMessageFor(alert: { title?: string; message?: string }): string {
  return alert.message ?? 'Nueva alerta oficial en tu zona';
}

async function scheduleDangerAlarm(alert: { id?: string; title?: string; message?: string }): Promise<void> {
  for (const delay of ALARM_BURST_DELAYS) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠ ALERTA DE PELIGRO${alert.title ? `: ${alert.title}` : ''}`,
        body: alertMessageFor(alert),
        data: { kind: 'official-alert', alertId: alert.id ?? null, severity: 'danger' },
        sound: 'default',
        interruptionLevel: 'timeSensitive',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(Date.now() + delay * 1000),
        channelId: ALERT_CHANNEL_ID,
      },
    });
  }
}

async function scheduleNormalAlert(alert: { id?: string; title?: string; message?: string }): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: alert.title || 'Nueva alerta',
      body: alertMessageFor(alert),
      data: { kind: 'official-alert', alertId: alert.id ?? null, severity: 'normal' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(),
      channelId: CHANNEL_ID,
    },
  });
}

export function useOfficialAlertSound(): void {
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    void ensureAlertChannel().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    void requestNotificationPermission().catch(() => undefined);

    const unsubscribe = subscribeActiveAlerts((alerts) => {
      for (const alert of alerts) {
        if (!alert.id || seen.current.has(alert.id)) continue;
        seen.current.add(alert.id);
        if (!primed.current) continue;
        if (alert.severity === 'danger') {
          void scheduleDangerAlarm(alert).catch(() => undefined);
        } else {
          void scheduleNormalAlert(alert).catch(() => undefined);
        }
      }
      primed.current = true;
    });

    return unsubscribe;
  }, []);
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

  useEffect(() => {
    const currentUser = user;
    if (!currentUser || Platform.OS === 'web') return;
    void registerPushToken(currentUser.uid);
  }, [user]);

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
  useOfficialAlertSound();
  return null;
}
