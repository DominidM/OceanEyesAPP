import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { BrandColors } from '@/constants/theme';
import {
  approveAlert,
  createAlert,
  deactivateAlert,
  deleteAlert,
  rejectAlert,
  subscribeAllAlerts,
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
  AdminLoading,
  SectionHeader,
} from '@admin/presentation/components/ui';

const SEVERITIES: { key: AlertSeverity; label: string; color: string; bg: string; icon: string }[] = [
  { key: 'info', label: 'Informativa', color: '#0891B2', bg: 'rgba(8,145,178,0.15)', icon: 'info-circle' },
  { key: 'warning', label: 'Precaución', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: 'exclamation-circle' },
  { key: 'danger', label: 'Peligro', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: 'exclamation-triangle' },
];

function severityCfg(s: AlertSeverity) {
  return SEVERITIES.find((x) => x.key === s) ?? SEVERITIES[0];
}

async function sendPush(title: string, message: string, severity: AlertSeverity, alertId: string): Promise<number> {
  const tokens = await getAllDeviceTokens();
  if (tokens.length === 0) throw new Error('No hay teléfonos registrados para recibir la alerta.');
  const response = await fetch('/api/send-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tokens: tokens.map((t) => t.id),
      title,
      message,
      severity,
      data: { alertId },
    }),
  });
  const result = await response.json().catch(() => ({})) as { sent?: number; error?: string };
  if (!response.ok) throw new Error(result.error ?? 'No se pudo enviar la alerta a los teléfonos.');
  if (!result.sent) throw new Error('Expo no aceptó la alerta para ningún teléfono registrado.');
  return result.sent;
}

function formatTime(ts: any) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AlertsScreen() {
  const { user } = useAuth();
  const { colors, mode } = useAdminTheme();
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

  useEffect(() => {
    return subscribeAllAlerts((nextAlerts) => {
      setAlerts(nextAlerts);
      setLoading(false);
    });
  }, []);

  const submit = async () => {
    setFormError('');
    if (!title.trim() || !message.trim()) {
      setFormError('Completa título y mensaje.');
      return;
    }
    setBusy(true);
    try {
      const alertId = await createAlert({
        title: title.trim(),
        message: message.trim(),
        severity,
        source: 'admin',
        sentBy: user?.uid ?? 'unknown',
      });
      setTitle('');
      setMessage('');
      setSeverity('info');
      setCreating(false);
      try {
        await sendPush(title.trim(), message.trim(), severity, alertId);
      } catch (pushErr: any) {
        setFormError('Alerta creada, pero: ' + (pushErr?.message ?? String(pushErr)));
        setCreating(true);
      }
    } catch (e: any) {
      setFormError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (id: string) => {
    await deactivateAlert(id);
  };

  const remove = async (id: string) => {
    await deleteAlert(id);
  };

  const approve = async (id: string) => {
    await approveAlert(id);
  };

  const reject = async (id: string) => {
    await rejectAlert(id);
  };

  const pendingReview = alerts.filter((a) => a.pendingReview);

  return (
    <AdminShell title="Alertas">
      <View style={styles.container}>
        {!loading && (
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
        )}

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

        {loading && (
          <View style={styles.alertGrid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} style={styles.alertCard}>
                <View style={styles.alertHead}>
                  <View style={styles.alertHeadLeft}>
                    <View style={[styles.skeletonIcon, { backgroundColor: inputBg }]} />
                    <View style={styles.alertHeadText}>
                      <View style={[styles.skeletonLine, { backgroundColor: inputBg, width: '70%' }]} />
                      <View style={[styles.skeletonLine, { backgroundColor: inputBg, width: '40%' }]} />
                    </View>
                  </View>
                </View>
                <View style={[styles.skeletonLine, { backgroundColor: inputBg, width: '100%' }]} />
                <View style={[styles.skeletonLine, { backgroundColor: inputBg, width: '80%' }]} />
                <View style={[styles.skeletonLine, { backgroundColor: inputBg, width: '50%' }]} />
              </Card>
            ))}
          </View>
        )}

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
            <View style={styles.alertGrid}>
              {pendingReview.map((a) => {
                const s = severityCfg(a.severity);
                return (
                  <Card key={a.id} style={styles.alertCard}>
                    <View style={styles.alertHead}>
                      <View style={styles.alertHeadLeft}>
                        <View style={[styles.alertIconWrap, { backgroundColor: s.bg }]}>
                          <FontAwesome5 name={s.icon} size={16} color={s.color} />
                        </View>
                        <View style={styles.alertHeadText}>
                          <Text style={[styles.alertTitle, { color: BrandColors.primary }]} numberOfLines={1}>
                            {a.title}
                          </Text>
                          <Text style={[styles.alertDate, { color: colors.contentTextMuted }]}>{formatTime(a.createdAt)}</Text>
                        </View>
                      </View>
                      <View style={styles.alertHeadBadges}>
                        <Badge label={s.label} color={s.color} bg={s.bg} />
                        <Badge label="Comunidad" color="#7C3AED" bg="rgba(124,58,237,0.12)" />
                        <Badge label="Requiere revisión" color="#EF4444" bg="rgba(239,68,68,0.15)" />
                      </View>
                    </View>
                    <Text style={[styles.alertMsg, { color: colors.cardText }]} numberOfLines={3}>
                      {a.message}
                    </Text>
                    {a.coordinates && (
                      <Text style={[styles.alertCoords, { color: colors.contentTextMuted }]} numberOfLines={1}>
                        📍 {a.coordinates.latitude.toFixed(4)}, {a.coordinates.longitude.toFixed(4)}
                      </Text>
                    )}
                    <View style={[styles.alertFooter, { borderTopColor: colors.cardBorder }]}>
                      <Pressable style={[styles.actionBtn, { borderColor: '#22C55E' }]} onPress={() => approve(a.id)}>
                        <FontAwesome5 name="check-circle" size={15} color="#22C55E" />
                        <Text style={[styles.actionLabel, { color: '#22C55E' }]}>Aprobar</Text>
                      </Pressable>
                      <Pressable style={[styles.actionBtn, { borderColor: '#EF4444' }]} onPress={() => reject(a.id)}>
                        <FontAwesome5 name="times-circle" size={15} color="#EF4444" />
                        <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Rechazar</Text>
                      </Pressable>
                    </View>
                  </Card>
                );
              })}
            </View>
          </>
        )}

        {!loading && (
          <View style={styles.alertGrid}>
            {alerts
              .filter((a) => !a.pendingReview)
              .map((a) => {
              const s = severityCfg(a.severity);
              return (
                <Card key={a.id} style={styles.alertCard}>
                  <View style={styles.alertHead}>
                    <View style={styles.alertHeadLeft}>
                      <View style={[styles.alertIconWrap, { backgroundColor: s.bg }]}>
                        <FontAwesome5 name={s.icon} size={16} color={s.color} />
                      </View>
                      <View style={styles.alertHeadText}>
                        <Text style={[styles.alertTitle, { color: BrandColors.primary }]} numberOfLines={1}>
                          {a.title}
                        </Text>
                        <Text style={[styles.alertDate, { color: colors.contentTextMuted }]}>{formatTime(a.createdAt)}</Text>
                      </View>
                    </View>
                    <View style={styles.alertHeadBadges}>
                      <Badge label={s.label} color={s.color} bg={s.bg} />
                      <Badge label={a.source} color={colors.contentTextMuted} bg={inputBg} />
                      {a.active && <Badge label="Activa" color="#22C55E" bg="rgba(34,197,94,0.15)" />}
                    </View>
                  </View>
                  <Text style={[styles.alertMsg, { color: colors.cardText }]} numberOfLines={3}>
                    {a.message}
                  </Text>
                  <View style={[styles.alertFooter, { borderTopColor: colors.cardBorder }]}>
                    {a.active && (
                      <Pressable style={[styles.actionBtn, { borderColor: '#F59E0B' }]} onPress={() => deactivate(a.id)}>
                        <FontAwesome5 name="pause-circle" size={14} color="#F59E0B" />
                        <Text style={[styles.actionLabel, { color: '#F59E0B' }]}>Pausar</Text>
                      </Pressable>
                    )}
                    <Pressable style={[styles.actionBtn, { borderColor: '#EF4444' }]} onPress={() => remove(a.id)}>
                      <FontAwesome5 name="trash-alt" size={13} color="#EF4444" />
                      <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Eliminar</Text>
                    </Pressable>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.four },
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
  alertGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  alertCard: { width: '30%', gap: Spacing.two },
  alertIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  alertHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1, minWidth: 0 },
  alertHeadText: { flex: 1, minWidth: 0 },
  alertTitle: { fontFamily: Fonts.headline, fontSize: 16, fontWeight: '700' },
  alertDate: { fontFamily: Fonts.body, fontSize: 11 },
  alertHeadBadges: { alignItems: 'flex-end', gap: Spacing.one, flexShrink: 0 },
  alertMsg: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 20 },
  alertCoords: { fontFamily: Fonts.body, fontSize: 11 },
  alertFooter: {
    marginTop: 'auto',
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, cursor: 'pointer' },
  actionLabel: { fontFamily: Fonts.body, fontSize: 12, fontWeight: '600' },
  skeletonIcon: { width: 40, height: 40, borderRadius: 12 },
  skeletonLine: { height: 12, borderRadius: 4, marginTop: 8 },
});
