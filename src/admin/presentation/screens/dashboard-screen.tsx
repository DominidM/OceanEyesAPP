import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AdminShell } from '@admin/layout/admin-shell';
import { DashboardCharts } from '../sections/dashboard/dashboard-charts/page';
import { RecentReportsSection } from '../sections/dashboard/recent-reports/page';
import { ingestExternalAlerts } from '@/shared/adapters/external-alerts/ingestor';
import { useAuth } from '@/shared/firebase/auth-context';

function ExternalAlertPoller() {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [lastCount, setLastCount] = useState(0);
  const [error, setError] = useState('');

  const poll = useCallback(async () => {
    if (!user) return;
    try {
      const { ingested } = await ingestExternalAlerts();
      setLastRun(new Date());
      setLastCount(ingested);
      setError('');
    } catch (e: any) {
      setError(e?.message ?? 'Error al consultar APIs externas');
    }
  }, [user]);

  useEffect(() => {
    void poll();
    intervalRef.current = setInterval(poll, 5 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, [poll]);

  if (!lastRun && !error) return null;

  return (
    <View style={styles.poller}>
      <MaterialCommunityIcons name="satellite-uplink" size={16} color="#0891B2" />
      <Text style={styles.pollerText}>
        {error
          ? `⚠️ ${error}`
          : lastCount > 0
            ? `✅ ${lastCount} alerta(s) externa(s) ingerida(s) — ${lastRun?.toLocaleTimeString('es-PE')}`
            : `🔍 Sin alertas externas nuevas — ${lastRun?.toLocaleTimeString('es-PE')}`}
      </Text>
    </View>
  );
}

export function DashboardScreen() {
  return (
    <AdminShell title="Dashboard">
      <ExternalAlertPoller />
      <DashboardCharts />
      <RecentReportsSection />
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  poller: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: 'rgba(8,145,178,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(8,145,178,0.2)',
  },
  pollerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#0891B2',
    flex: 1,
  },
});

export default DashboardScreen;
