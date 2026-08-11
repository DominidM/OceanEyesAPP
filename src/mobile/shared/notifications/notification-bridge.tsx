import { isRunningInExpoGo } from 'expo';
import React, { useEffect, useState, type ComponentType } from 'react';
import { Platform } from 'react-native';

export function canUseExpoNotifications(): boolean {
  if (Platform.OS === 'web') return false;
  return true;
}

export function canRegisterPushToken(): boolean {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android' && isRunningInExpoGo()) return false;
  return true;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!canUseExpoNotifications()) return false;
  const { requestNotificationPermission: request } = await import('./report-notifications');
  return request();
}

export function NotificationsGate(): React.ReactElement | null {
  const [Watcher, setWatcher] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!canUseExpoNotifications()) return undefined;
    let mounted = true;
    void import('./report-notifications').then(({ NotificationsWatcher }) => {
      if (mounted) setWatcher(() => NotificationsWatcher);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return Watcher ? <Watcher /> : null;
}
