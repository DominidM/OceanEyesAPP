import { FontAwesome5 } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { BrandColors } from '@/constants/theme';
import {
  approveAlert,
  createAlert,
  deactivateAlert,
  deleteAlert,
  getAllAlerts,
  rejectAlert,
} from '@/shared/firebase/alerts';
import { getAllDeviceTokens } from '@/shared/firebase/device-tokens';
import { useAuth } from '@/shared/firebase/auth-context';
import type { Alert, AlertSeverity } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';
import { AdminShell } from '@admin/layout/admin-shell';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingState,
  SectionHeader,
} from '@admin/presentation/components/ui';

const SEVERITIES: { key: AlertSeverity; label: string; color: string; bg: string }[] = [
  { key: 'info', label: 'Informativa', color: '#0891B2', bg: 'rgba(8,145,178,0.15)' },
  { key: 'warning', label: 'Precaución', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { key: 'danger', label: 'Peligro', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
];

function severityCfg(s: AlertSeverity) {
  return SEVERITIES.find((x) => x.key === s) ?? SEVERITIES[0];
}

async function sendPush(title: string, message: string): Promise<void> {
  try {
    const tokens = await getAllDeviceTokens();
    if (tokens.length === 0) return;
    await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokens: tokens.map((t) => t.id),
        title,
        message,
      }),
    });
  } catch (e) {
    console.error('sendPush failed:', e);
  }
}

function formatTime(ts: any) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AlertsScreen() {
  const { user } = useAuth();
  const { mode } = useAdminTheme();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('info');
  const [formError, setFormError] = useState('');

  const isDark = mode === 'dark';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#1E293B' : '#E2E8F0';
  const inputBg = isDark ? '#0F172A' : '#F8FAFC';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAlerts(await getAllAlerts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    setFormError('');
    if (!title.trim() || !message.trim()) {
      setFormError('Completa título y mensaje.');
      return;
    }
    setBusy(true);
    try {
      await createAlert({
        title: title.trim(),
        message: message.trim(),
        severity,
        source: 'admin',
        sentBy: user?.uid ?? 'unknown',
      });
      void sendPush(title.trim(), message.trim());
      setTitle('');
      setMessage('');
      setSeverity('info');
      setCreating(false);
      await load();
    } catch (e: any) {
      setFormError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (id: string) => {
    await deactivateAlert(id);
    await load();
  };

  const remove = async (id: string) => {
    await deleteAlert(id);
    await load();
  };

  const approve = async (id: string) => {
    await approveAlert(id);
    await load();
  };

  const reject = async (id: string) => {
    await rejectAlert(id);
    await load();
  };

  const pendingReview = alerts.filter((a) => a.pendingReview);

  return (
    <AdminShell title="Alertas">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <SectionHeader
          title="Alertas"
          subtitle="Envía notificaciones push a todos los usuarios"
          actions={[
            <Button
              key="new"
              label="Nueva alerta"
              onPress={() => setCreating(true)}
              variant={creating ? 'secondary' : 'primary'}
            />,
          ]}
        />

        {creating && (
          <Card>
            <Text style={[styles.cardTitle, { color: BrandColors.primary }]}>Nueva alerta</Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: muted }]}>Título</Text>
              <TextInput
                style={[styles.input, { color: BrandColors.primary, borderColor, backgroundColor: inputBg }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Ej: Alerta de oleaje extremo"
                placeholderTextColor={muted}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: muted }]}>Mensaje</Text>
              <TextInput
                style={[styles.input, styles.inputMulti, { color: BrandColors.primary, borderColor, backgroundColor: inputBg }]}
                value={message}
                onChangeText={setMessage}
                placeholder="Describe la alerta..."
                placeholderTextColor={muted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: muted }]}>Severidad</Text>
              <View style={styles.severityRow}>
                {SEVERITIES.map((s) => (
                  <Pressable
                    key={s.key}
                    style={[
                      styles.severityBtn,
                      { borderColor: severity === s.key ? s.color : borderColor, backgroundColor: severity === s.key ? s.bg : inputBg },
                    ]}
                    onPress={() => setSeverity(s.key)}
                  >
                    <Text style={[styles.severityLabel, { color: severity === s.key ? s.color : muted }]}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formActions}>
              <Button label="Cancelar" variant="secondary" onPress={() => setCreating(false)} />
              <Button label={busy ? 'Enviando...' : 'Enviar alerta'} onPress={submit} disabled={busy} />
            </View>
          </Card>
        )}

        {loading && <LoadingState />}

        {!loading && alerts.length === 0 && !creating && (
          <EmptyState
            icon="bell"
            title="No hay alertas aún."
            description="Crea tu primera alerta para notificar a los usuarios."
          />
        )}

        {!loading && pendingReview.length > 0 && (
          <>
            <SectionHeader
              title="Por revisar"
              subtitle={`${pendingReview.length} alerta(s) de peligro ciudadano esperando tu confirmación`}
            />
            {pendingReview.map((a) => {
              const s = severityCfg(a.severity);
              return (
                <Card key={a.id}>
                  <View style={styles.alertRow}>
                    <View style={styles.alertBody}>
                      <View style={styles.alertTop}>
                        <Badge label={s.label} color={s.color} bg={s.bg} />
                        <Badge label="Comunidad" color="#7C3AED" bg="rgba(124,58,237,0.12)" />
                        <Badge label="Requiere revisión" color="#EF4444" bg="rgba(239,68,68,0.15)" />
                      </View>
                      <Text style={[styles.alertTitle, { color: BrandColors.primary }]}>{a.title}</Text>
                      <Text style={[styles.alertMsg, { color: muted }]}>{a.message}</Text>
                      {a.coordinates && (
                        <Text style={styles.alertDate}>
                          📍 {a.coordinates.latitude.toFixed(4)}, {a.coordinates.longitude.toFixed(4)}
                        </Text>
                      )}
                      <Text style={[styles.alertDate, { color: muted }]}>{formatTime(a.createdAt)}</Text>
                    </View>
                    <View style={styles.alertActions}>
                      <Pressable style={styles.actionBtn} onPress={() => approve(a.id)}>
                        <FontAwesome5 name="check-circle" size={20} color="#22C55E" />
                        <Text style={[styles.actionLabel, { color: '#22C55E' }]}>Aprobar</Text>
                      </Pressable>
                      <Pressable style={styles.actionBtn} onPress={() => reject(a.id)}>
                        <FontAwesome5 name="times-circle" size={20} color="#EF4444" />
                        <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Rechazar</Text>
                      </Pressable>
                    </View>
                  </View>
                </Card>
              );
            })}
          </>
        )}

        {!loading &&
          alerts
            .filter((a) => !a.pendingReview)
            .map((a) => {
            const s = severityCfg(a.severity);
            return (
              <Card key={a.id}>
                <View style={styles.alertRow}>
                  <View style={styles.alertBody}>
                    <View style={styles.alertTop}>
                      <Badge label={s.label} color={s.color} bg={s.bg} />
                      <Badge label={a.source} color={muted} bg={inputBg} />
                      {a.active && <Badge label="Activa" color="#22C55E" bg="rgba(34,197,94,0.15)" />}
                    </View>
                    <Text style={[styles.alertTitle, { color: BrandColors.primary }]}>{a.title}</Text>
                    <Text style={[styles.alertMsg, { color: muted }]}>{a.message}</Text>
                    <Text style={[styles.alertDate, { color: muted }]}>{formatTime(a.createdAt)}</Text>
                  </View>
                  <View style={styles.alertActions}>
                    {a.active && (
                      <Pressable style={styles.actionBtn} onPress={() => deactivate(a.id)}>
                        <FontAwesome5 name="pause-circle" size={18} color="#F59E0B" />
                        <Text style={[styles.actionLabel, { color: '#F59E0B' }]}>Pausar</Text>
                      </Pressable>
                    )}
                    <Pressable style={styles.actionBtn} onPress={() => remove(a.id)}>
                      <FontAwesome5 name="trash-alt" size={16} color="#EF4444" />
                      <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Eliminar</Text>
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          })}
      </ScrollView>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: Spacing.five, gap: Spacing.four, paddingBottom: 80 },
  cardTitle: { fontFamily: Fonts.headline, fontSize: 18, fontWeight: '700', marginBottom: Spacing.three },
  field: { gap: Spacing.one, marginBottom: Spacing.three },
  label: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.body,
    fontSize: 14,
  },
  inputMulti: { minHeight: 100 },
  severityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  severityBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
  },
  severityLabel: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '600' },
  formActions: { flexDirection: 'row', gap: Spacing.three, justifyContent: 'flex-end' },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.three },
  alertBody: { flex: 1, gap: Spacing.one },
  alertTop: { flexDirection: 'row', gap: Spacing.one, alignItems: 'center' },
  alertTitle: { fontFamily: Fonts.headline, fontSize: 16, fontWeight: '700' },
  alertMsg: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 20 },
  alertDate: { fontFamily: Fonts.body, fontSize: 11 },
  alertActions: { gap: Spacing.two, alignItems: 'center' },
  actionBtn: { alignItems: 'center', gap: 2 },
  actionLabel: { fontFamily: Fonts.body, fontSize: 10 },
});
