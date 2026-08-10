import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import type { Alert, AlertSeverity, AlertSource } from '@/shared/firebase/types';
import { subscribeAllAlerts } from '@/shared/firebase/alerts';
import { useAdminTheme } from '@admin/theme/context';
import { Card, Badge } from '@admin/presentation/components/ui';

const SOURCE_LABELS: Record<AlertSource, string> = {
  admin: 'Admin',
  usgs: 'USGS',
  noaa: 'NOAA',
  user_cluster: 'Comunidad',
  municipal: 'Municipal',
};

const SEVERITY_META: Record<AlertSeverity, { label: string; color: string; bg: string }> = {
  info: { label: 'Info', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  warning: { label: 'Aviso', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)' },
  danger: { label: 'Peligro', color: '#EF4444', bg: 'rgba(239,68,68,0.14)' },
};

export function RecentAlertsSection() {
  const { colors } = useAdminTheme();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const unsub = subscribeAllAlerts((list) => setAlerts(list));
    return unsub;
  }, []);

  return (
    <Card style={styles.tableCard}>
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.cardText }]}>Últimas alertas</Text>
        <Pressable onPress={() => router.push('/admin/alerts')}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todas →</Text>
        </Pressable>
      </View>

      <View style={[styles.tableHead, { borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.th, styles.thFlex, { color: colors.contentTextMuted }]}>Alerta</Text>
        <Text style={[styles.th, styles.thSource, { color: colors.contentTextMuted }]}>Fuente</Text>
        <Text style={[styles.th, styles.thDate, { color: colors.contentTextMuted }]}>Fecha</Text>
        <Text style={[styles.th, styles.thStatus, { color: colors.contentTextMuted }]}>Severidad</Text>
      </View>

      {alerts.length === 0 ? (
        <Text style={[styles.empty, { color: colors.contentTextMuted }]}>No hay alertas todavía.</Text>
      ) : (
        <View>
          {alerts.slice(0, 6).map((alert) => {
            const sev = SEVERITY_META[alert.severity];
            const dateStr = alert.createdAt?.toDate?.()
              ? alert.createdAt.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
              : '—';
            return (
              <View key={alert.id} style={[styles.row, { borderBottomColor: colors.cardBorder }]}>
                <View style={styles.cellFlex}>
                  <Text style={[styles.rowTitle, { color: colors.cardText }]} numberOfLines={1}>
                    {alert.title}
                  </Text>
                  <Text style={[styles.rowMeta, { color: colors.contentTextMuted }]}>
                    #{alert.id.slice(0, 6)} · {SOURCE_LABELS[alert.source] ?? alert.source}
                  </Text>
                </View>
                <View style={styles.cellSource}>
                  <Badge label={SOURCE_LABELS[alert.source] ?? alert.source} color={colors.contentTextMuted} bg={colors.inputBg} />
                </View>
                <Text style={[styles.cellDate, { color: colors.contentTextMuted }]}>{dateStr}</Text>
                <View style={styles.cellStatus}>
                  <Badge label={sev.label} color={sev.color} bg={sev.bg} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  tableCard: { gap: 0, padding: 0, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  headerTitle: { fontFamily: Fonts.headline, fontSize: 15, fontWeight: '700' },
  seeAll: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '600', cursor: 'pointer' },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.three,
  },
  th: { fontFamily: Fonts.label, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  thFlex: { flex: 1 },
  thSource: { width: 90 },
  thDate: { width: 84 },
  thStatus: { width: 90, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.three,
  },
  cellFlex: { flex: 1, gap: 2, minWidth: 0 },
  rowTitle: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '600' },
  rowMeta: { fontFamily: Fonts.body, fontSize: 12, textTransform: 'capitalize' },
  cellSource: { width: 90, alignItems: 'flex-start' },
  cellDate: { width: 84, fontFamily: Fonts.body, fontSize: 12 },
  cellStatus: { width: 90, alignItems: 'flex-end' },
  empty: { fontFamily: Fonts.body, fontSize: 14, padding: Spacing.four },
});