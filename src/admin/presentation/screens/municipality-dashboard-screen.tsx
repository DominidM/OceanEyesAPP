import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card, EmptyState, KpiStat, LoadingState, SectionHeader } from '@admin/presentation/components/ui';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { useAdminTheme } from '@admin/theme/context';
import { useAuth } from '@/shared/firebase/auth-context';
import { subscribeMunicipalityByOwner } from '@/shared/firebase/municipalities';
import { subscribeOrganizations } from '@/shared/firebase/organizations';
import { createAlert, deactivateAlert, deleteAlert, subscribeAlertReports, subscribeOwnAlerts } from '@/shared/firebase/alerts';
import type { Municipality, Organization } from '@/shared/firebase/types';

function statusCfg(status: string | undefined) {
  switch (status) {
    case 'active':
      return { label: 'Activa', color: '#10B981', bg: 'rgba(16,185,129,0.15)' };
    case 'rejected':
      return { label: 'Rechazada', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' };
    default:
      return { label: 'Pendiente de aprobación', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' };
  }
}

function formatTime(ts: any) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

export function MunicipalityDashboardScreen() {
  const { user } = useAuth();
  const { colors, mode } = useAdminTheme();
  const isDark = mode === 'dark';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#1E293B' : '#E2E8F0';
  const inputBg = isDark ? '#0F172A' : '#F8FAFC';

  const [municipality, setMunicipality] = useState<Municipality | null | undefined>(undefined);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [alertReports, setAlertReports] = useState<{ total: number }>({ total: 0 });
  const [ownAlerts, setOwnAlerts] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsubMunicipality = subscribeMunicipalityByOwner(user.uid, (m) => setMunicipality(m));
    const unsubOrgs = subscribeOrganizations((list) => setOrganizations(list));
    const unsubReports = subscribeAlertReports((reports) => setAlertReports({ total: reports.length }));
    const unsubOwn = subscribeOwnAlerts(user.uid, (alerts) => setOwnAlerts(alerts));
    return () => {
      unsubMunicipality();
      unsubOrgs();
      unsubReports();
      unsubOwn();
    };
  }, [user]);

  const config = statusCfg(municipality?.status);
  const activated = municipality?.status === 'active';

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
        severity: 'warning',
        source: 'municipal',
        sentBy: user?.uid ?? 'unknown',
      });
      setTitle('');
      setMessage('');
      setCreating(false);
    } catch (e: any) {
      setFormError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell title="Mi municipio" breadcrumb={[{ label: 'Mi municipio' }]}>
      <SectionHeader
        title="Mi municipio"
        subtitle={
          municipality
            ? `${municipality.name} · ${municipality.province}, ${municipality.region}`
            : 'Municipalidad vinculada a esta cuenta'
        }
        actions={[<Badge key="status" label={config.label} color={config.color} bg={config.bg} />]}
      />

      {municipality === undefined && <LoadingState label="Cargando municipalidad..." />}

      {municipality === null && (
        <Card>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Sin municipalidad vinculada</Text>
          <Text style={[styles.body, { color: muted }]}>
            Esta cuenta aún no tiene una municipalidad registrada. Contáctate con el equipo de OceanEyes para completar tu onboarding.
          </Text>
        </Card>
      )}

      {municipality && !activated && (
        <Card>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Solicitud en revisión</Text>
          <Text style={[styles.body, { color: muted }]}>
            Tu solicitud de adhesión fue enviada. El equipo de OceanEyes la está revisando.
            Cuando sea aprobada podrás emitir alertas oficiales para tu comunidad.
          </Text>
          <Text style={[styles.body, { color: muted }]}>Contacto registrado: {municipality.contactEmail ?? '—'}</Text>
          {municipality.status === 'rejected' && municipality.rejectedReason && (
            <Text style={[styles.body, { color: colors.danger }]}>
              Motivo de rechazo: {municipality.rejectedReason}
            </Text>
          )}
        </Card>
      )}

      {activated && (
        <View style={styles.kpiRow}>
          <KpiStat value={ownAlerts.length} label="Alertas propias" color={colors.primary} />
          <KpiStat value={alertReports.total} label="Reportes ciudadanos recientes" color={colors.accent} />
          <KpiStat value={organizations.length} label="ONGs aliadas" color="#10B981" />
        </View>
      )}

      {activated && (
        <Card>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>Emitir alerta oficial</Text>
            <Button label={creating ? 'Cancelar' : 'Nueva alerta'} variant={creating ? 'secondary' : 'primary'} onPress={() => setCreating((v) => !v)} />
          </View>

          {creating && (
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: muted }]}>Título</Text>
                <TextInput
                  style={[styles.input, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ej: Restricción temporal de la caleta"
                  placeholderTextColor={muted}
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: muted }]}>Mensaje</Text>
                <TextInput
                  style={[styles.input, styles.inputMulti, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Describe la medida o aviso oficial..."
                  placeholderTextColor={muted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              {!!formError && <Text style={[styles.error, { color: colors.danger }]}>{formError}</Text>}
              <View style={styles.actions}>
                <Button label={busy ? 'Enviando...' : 'Emitir alerta'} onPress={submit} disabled={busy} />
              </View>
            </View>
          )}
        </Card>
      )}

      {activated &&
        ownAlerts.map((a) => (
          <Card key={a.id}>
            <View style={styles.alertRow}>
              <View style={styles.alertBody}>
                <View style={styles.alertTop}>
                  <Badge label="Oficial" color="#134E5E" bg="rgba(19,78,94,0.12)" />
                  <Badge label={a.source} color={muted} bg={inputBg} />
                  {a.active && <Badge label="Activa" color="#22C55E" bg="rgba(34,197,94,0.15)" />}
                </View>
                <Text style={[styles.alertTitle, { color: colors.primary }]}>{a.title}</Text>
                <Text style={[styles.alertMsg, { color: muted }]}>{a.message}</Text>
                <Text style={[styles.alertDate, { color: muted }]}>{formatTime(a.createdAt)}</Text>
              </View>
              <View style={styles.alertActions}>
                {a.active && (
                  <Pressable style={styles.actionBtn} onPress={async () => { await deactivateAlert(a.id); }}>
                    <FontAwesome5 name="pause-circle" size={18} color="#F59E0B" />
                    <Text style={[styles.actionLabel, { color: '#F59E0B' }]}>Pausar</Text>
                  </Pressable>
                )}
                <Pressable style={styles.actionBtn} onPress={async () => { await deleteAlert(a.id); }}>
                  <FontAwesome5 name="trash-alt" size={16} color="#EF4444" />
                  <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        ))}

      {activated && ownAlerts.length === 0 && !creating && (
        <EmptyState
          icon="bullhorn"
          title="No has emitido alertas aún."
          description="Cuando emitas alertas oficiales aparecerán aquí y para tu comunidad."
        />
      )}

      {organizations.length > 0 && (
        <Card>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>ONGs aliadas</Text>
          <Text style={[styles.body, { color: muted }]}>
            Organizaciones verificadas que colaboran con la vigilancia marina en tu región.
          </Text>
          <View style={styles.orgList}>
            {organizations
              .filter((o) => o.verified)
              .map((o) => (
                <View key={o.id} style={[styles.orgItem, { borderColor }]}>
                  <View style={styles.orgText}>
                    <Text style={[styles.orgName, { color: colors.primary }]}>{o.name}</Text>
                    <Text style={[styles.orgCategory, { color: muted }]}>{o.category}</Text>
                    {o.website ? (
                      <Text style={[styles.orgWebsite, { color: colors.accent }]}>{o.website}</Text>
                    ) : null}
                  </View>
                  <Badge label="Verificada" color="#10B981" bg="rgba(16,185,129,0.15)" />
                </View>
              ))}
          </View>
        </Card>
      )}
    </AdminShell>
  );
}

export default MunicipalityDashboardScreen;

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  cardTitle: { fontFamily: Fonts.headline, fontSize: 18, fontWeight: '700', marginBottom: Spacing.two },
  body: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 21 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.three },
  form: { gap: Spacing.three, marginTop: Spacing.three },
  field: { gap: Spacing.one },
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
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  error: { fontFamily: Fonts.body, fontSize: 13 },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.three },
  alertBody: { flex: 1, gap: Spacing.one },
  alertTop: { flexDirection: 'row', gap: Spacing.one, alignItems: 'center' },
  alertTitle: { fontFamily: Fonts.headline, fontSize: 16, fontWeight: '700' },
  alertMsg: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 20 },
  alertDate: { fontFamily: Fonts.body, fontSize: 11 },
  alertActions: { gap: Spacing.two, alignItems: 'center' },
  actionBtn: { alignItems: 'center', gap: 2 },
  actionLabel: { fontFamily: Fonts.body, fontSize: 10 },
  orgList: { gap: Spacing.two, marginTop: Spacing.two },
  orgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
  },
  orgText: { gap: Spacing.half, flex: 1 },
  orgName: { fontFamily: Fonts.headline, fontSize: 15, fontWeight: '700' },
  orgCategory: { fontFamily: Fonts.body, fontSize: 13 },
  orgWebsite: { fontFamily: Fonts.body, fontSize: 12 },
});