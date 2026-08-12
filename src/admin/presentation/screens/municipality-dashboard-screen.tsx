import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card, EmptyState, KpiStat, AdminLoading, SectionHeader } from '@admin/presentation/components/ui';
import { BarChart } from '@admin/presentation/components/charts';
import { TerritoryMap } from '@admin/presentation/components/municipality/territory-map';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { useAdminTheme } from '@admin/theme/context';
import { useAuth } from '@/shared/firebase/auth-context';
import { subscribeMunicipalityByOwner, updateMunicipality } from '@/shared/firebase/municipalities';
import { ALERT_REPORT_TITLES, createAlert, deactivateAlert, deleteAlert, subscribeAlertReports, subscribeOwnAlerts } from '@/shared/firebase/alerts';
import { createCampaign, deleteCampaign, subscribeMunicipalityCampaigns, updateCampaign } from '@/shared/firebase/campaigns';
import { subscribeReports } from '@/shared/firebase/reports';
import { subscribeReportPointTransactions } from '@/shared/firebase/rewards';
import { REPORT_CATEGORIES, type AlertReport, type Campaign, type Municipality, type GeoBounds, type PointTransaction, type Report } from '@/shared/firebase/types';
import { buildArbiscanTxUrl } from '@shared/blockchain/ledger';

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

type MunicipalitySection = 'overview' | 'reports' | 'alerts' | 'campaigns';

const SECTION_META: Record<MunicipalitySection, { title: string; subtitle: string }> = {
  overview: { title: 'Mi municipio', subtitle: 'Resumen y configuración territorial' },
  reports: { title: 'Reportes y auditoría', subtitle: 'Reportes ciudadanos y recompensas verificadas on-chain' },
  alerts: { title: 'Señales y alertas', subtitle: 'Monitoreo comunitario y comunicaciones oficiales' },
  campaigns: { title: 'Campañas', subtitle: 'Iniciativas municipales para la comunidad' },
};

export function MunicipalityDashboardScreen({ section = 'overview' }: { section?: MunicipalitySection }) {
  const { user } = useAuth();
  const { colors, mode } = useAdminTheme();
  const { width } = useWindowDimensions();
  const isDark = mode === 'dark';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#1E293B' : '#E2E8F0';
  const inputBg = isDark ? '#0F172A' : '#F8FAFC';

  const [municipality, setMunicipality] = useState<Municipality | null | undefined>(undefined);
  const [alertReports, setAlertReports] = useState<any[]>([]);
  const [ownAlerts, setOwnAlerts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const [campTitle, setCampTitle] = useState('');
  const [campDescription, setCampDescription] = useState('');
  const [campLocation, setCampLocation] = useState('');
  const [campCreating, setCampCreating] = useState(false);
  const [campBusy, setCampBusy] = useState(false);
  const [campError, setCampError] = useState('');

  const [boundsEditing, setBoundsEditing] = useState(false);
  const [coordinatesAdvanced, setCoordinatesAdvanced] = useState(false);
  const [boundsSouth, setBoundsSouth] = useState('');
  const [boundsWest, setBoundsWest] = useState('');
  const [boundsNorth, setBoundsNorth] = useState('');
  const [boundsEast, setBoundsEast] = useState('');
  const [boundsBusy, setBoundsBusy] = useState(false);
  const [boundsError, setBoundsError] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsubMunicipality = subscribeMunicipalityByOwner(user.uid, (m) => setMunicipality(m));
    const unsubOwn = subscribeOwnAlerts(user.uid, (alerts) => setOwnAlerts(alerts));
    return () => {
      unsubMunicipality();
      unsubOwn();
    };
  }, [user]);

  useEffect(() => {
    if (!user || municipality?.id !== user.uid || municipality.status !== 'active') {
      setAlertReports([]);
      return;
    }
    return subscribeAlertReports(setAlertReports);
  }, [user, municipality?.id, municipality?.status]);

  useEffect(() => {
    if (!municipality) return;
    const unsub = subscribeMunicipalityCampaigns(municipality.id, (list) => setCampaigns(list));
    return unsub;
  }, [municipality]);

  useEffect(() => {
    if (!user || municipality?.id !== user.uid || municipality.status !== 'active' || !municipality.bounds) {
      setReports([]);
      setPointTransactions([]);
      return;
    }
    const bounds = municipality.bounds;
    return subscribeReports((verifiedReports) => {
      setReports(verifiedReports.filter((report) => {
        const location = report.location;
        return !!location
          && location.latitude >= bounds.south
          && location.latitude <= bounds.north
          && location.longitude >= bounds.west
          && location.longitude <= bounds.east;
      }));
    });
  }, [user, municipality?.id, municipality?.status, municipality?.bounds]);

  useEffect(() => {
    return subscribeReportPointTransactions(reports.map((report) => report.id), setPointTransactions);
  }, [reports]);

  const config = statusCfg(municipality?.status);
  const activated = municipality?.status === 'active';
  const migrationRequired = !!user && !!municipality && municipality.id !== user.uid;
  const sectionMeta = SECTION_META[section];

  const reportsInBounds = useCallback((r: any) => {
    const bounds = municipality?.bounds;
    if (!bounds || !r?.location) return false;
    const { latitude, longitude } = r.location;
    return (
      latitude >= bounds.south &&
      latitude <= bounds.north &&
      longitude >= bounds.west &&
      longitude <= bounds.east
    );
  }, [municipality?.bounds]);
  const territoryAlertReports = municipality?.bounds ? alertReports.filter(reportsInBounds) : [];
  const pendingSignals = territoryAlertReports.filter((r) => r.status === 'pending');
  const openDangers = pendingSignals.length;
  const reportIds = useMemo(() => new Set(reports.map((report) => report.id)), [reports]);
  const territoryTransactions = pointTransactions.filter((tx) => tx.reportId && reportIds.has(tx.reportId));
  const onChainPoints = reports.reduce(
    (sum, report) => sum + (report.onChainStatus === 'awarded' ? report.pointsAwarded ?? 0 : 0),
    0,
  );

  const territoryWeek = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const days: { start: Date; end: Date; label: string }[] = [];
    const names = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    for (let i = 6; i >= 0; i--) {
      const s = new Date(now);
      s.setDate(now.getDate() - i);
      const e = new Date(s);
      e.setDate(s.getDate() + 1);
      days.push({ start: s, end: e, label: names[s.getDay()] });
    }
    const inTerritory = municipality?.bounds
      ? alertReports.filter(reportsInBounds)
      : [];
    return days.map((d, i) => ({
      label: d.label,
      value: inTerritory.filter((r) => {
        const t = r.createdAt?.toDate?.();
        return t && t >= d.start && t < d.end;
      }).length,
      color: i === 6 ? colors.primary : colors.primary + '99',
    }));
  }, [alertReports, municipality?.bounds, reportsInBounds, colors.primary]);

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

  const submitCampaign = async () => {
    setCampError('');
    if (!municipality || !campTitle.trim() || !campDescription.trim()) {
      setCampError('Completa título y descripción.');
      return;
    }
    setCampBusy(true);
    try {
      await createCampaign({
        municipalityId: municipality.id,
        municipalityName: municipality.name,
        title: campTitle.trim(),
        description: campDescription.trim(),
        location: campLocation.trim() || undefined,
        createdBy: user?.uid ?? 'unknown',
      });
      setCampTitle('');
      setCampDescription('');
      setCampLocation('');
      setCampCreating(false);
    } catch (e: any) {
      setCampError(e?.message ?? String(e));
    } finally {
      setCampBusy(false);
    }
  };

  const saveBounds = async () => {
    setBoundsError('');
    if (!municipality) return;
    const south = parseFloat(boundsSouth);
    const west = parseFloat(boundsWest);
    const north = parseFloat(boundsNorth);
    const east = parseFloat(boundsEast);
    if ([south, west, north, east].some((n) => Number.isNaN(n))) {
      setBoundsError('Ingresa las 4 coordenadas numéricas.');
      return;
    }
    if (south > north || west > east) {
      setBoundsError('Sur debe ser menor que norte, y oeste menor que este.');
      return;
    }
    setBoundsBusy(true);
    try {
      const bounds: GeoBounds = { south, west, north, east };
      await updateMunicipality(municipality.id, { bounds });
      setBoundsEditing(false);
    } catch (e: any) {
      setBoundsError(e?.message ?? String(e));
    } finally {
      setBoundsBusy(false);
    }
  };

  const draftBounds = [boundsSouth, boundsWest, boundsNorth, boundsEast].every((value) => value.trim() !== '' && !Number.isNaN(Number(value)))
    ? { south: Number(boundsSouth), west: Number(boundsWest), north: Number(boundsNorth), east: Number(boundsEast) }
    : municipality?.bounds;

  const selectBoundsOnMap = (bounds: GeoBounds) => {
    setBoundsSouth(bounds.south.toFixed(6));
    setBoundsWest(bounds.west.toFixed(6));
    setBoundsNorth(bounds.north.toFixed(6));
    setBoundsEast(bounds.east.toFixed(6));
  };

  return (
    <AdminShell title={sectionMeta.title} breadcrumb={[{ label: sectionMeta.title }]}>
      {municipality !== undefined && (
        <SectionHeader
          title={sectionMeta.title}
          subtitle={
            municipality
              ? `${municipality.name} · ${municipality.province}, ${municipality.region} · ${sectionMeta.subtitle}`
              : 'Municipalidad vinculada a esta cuenta'
          }
          actions={[<Badge key="status" label={config.label} color={config.color} bg={config.bg} />]}
        />
      )}

      {municipality === undefined && <AdminLoading variant="list" />}

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

      {migrationRequired && (
        <Card>
          <View style={styles.alertTop}>
            <Badge label="Migración requerida" color="#EF4444" bg="rgba(239,68,68,0.12)" />
          </View>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Actualiza el ID de la municipalidad</Text>
          <Text style={[styles.body, { color: muted }]}>
            El registro usa un ID antiguo. Copia este documento en Firestore como municipalities/{user?.uid}
            y conserva todos sus campos, especialmente status, ownerUid y bounds. Hasta completar esa migración,
            las reglas bloquean los reportes territoriales y las señales comunitarias.
          </Text>
        </Card>
      )}

      {activated && section === 'overview' && (
        <View style={styles.kpiRow}>
          <KpiStat value={ownAlerts.length} label="Alertas propias" color={colors.primary} />
          <KpiStat
            value={reports.length}
            label="Reportes en tu territorio"
            color={colors.accent}
          />
          <KpiStat value={onChainPoints} label="Puntos on-chain" color="#7C3AED" />
          <KpiStat value={campaigns.length} label="Campañas activas" color="#0D9488" />
        </View>
      )}

      {activated && section === 'reports' && (
        <Card>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Reportes de la comunidad</Text>
          {reports.length === 0 ? (
            <Text style={[styles.body, { color: muted }]}>No hay reportes accesibles dentro del territorio definido.</Text>
          ) : reports.map((report) => (
            <Pressable
              key={report.id}
              onPress={() => router.push({ pathname: '/admin/municipio/reports/[id]', params: { id: report.id } })}
              style={({ hovered }) => [styles.auditItem, { borderColor }, hovered && { opacity: 0.75 }]}
            >
              <View style={styles.auditBody}>
                <Text style={[styles.alertTitle, { color: colors.primary }]}>{report.title}</Text>
                <Text style={[styles.alertMsg, { color: muted }]}>
                  {REPORT_CATEGORIES[report.category]?.label ?? report.category} · {report.status} · {report.pointsAwarded ?? 0} puntos
                </Text>
              </View>
              <View style={styles.alertTop}>
                <Badge
                  label={report.onChainStatus === 'awarded' ? 'On-chain' : 'Sin confirmar'}
                  color={report.onChainStatus === 'awarded' ? '#7C3AED' : muted}
                  bg={report.onChainStatus === 'awarded' ? 'rgba(124,58,237,0.12)' : inputBg}
                />
                {report.txHash && (
                  <Pressable onPress={(event) => { event.stopPropagation(); Linking.openURL(buildArbiscanTxUrl(report.txHash!)); }}>
                    <Text style={[styles.link, { color: colors.accent }]}>Arbiscan ↗</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          ))}
        </Card>
      )}

      {activated && section === 'reports' && (
        <Card>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Auditoría on-chain</Text>
          {territoryTransactions.length === 0 ? (
            <Text style={[styles.body, { color: muted }]}>Aún no hay transacciones de recompensas en este territorio.</Text>
          ) : territoryTransactions.map((tx) => (
            <View key={tx.id} style={[styles.auditItem, { borderColor }]}>
              <View style={styles.auditBody}>
                <Text style={[styles.alertTitle, { color: colors.primary }]}>+{tx.amount} puntos</Text>
                <Text style={[styles.alertMsg, { color: muted }]}>Reporte {tx.reportId ?? '—'} · {formatTime(tx.createdAt)}</Text>
              </View>
              {tx.txHash ? (
                <Pressable onPress={() => Linking.openURL(buildArbiscanTxUrl(tx.txHash!))}>
                  <Text style={[styles.link, { color: colors.accent }]}>Ver transacción ↗</Text>
                </Pressable>
              ) : <Badge label="Pendiente on-chain" color="#F59E0B" bg="rgba(245,158,11,0.15)" />}
            </View>
          ))}
        </Card>
      )}

      {activated && section === 'alerts' && (
        <Card>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>
            Señales de la comunidad · últimos 7 días
          </Text>
          {territoryWeek.every((d) => d.value === 0) ? (
            <Text style={[styles.body, { color: muted }]}>
              Aún no hay señales de la comunidad esta semana.
            </Text>
          ) : (
            <BarChart data={territoryWeek} width={Math.min(width - 80, 900)} height={200} />
          )}
        </Card>
      )}

      {activated && section === 'alerts' && openDangers > 0 && (
        <Card>
          <View style={styles.alertTop}>
            <Badge label="Señales pendientes" color="#F59E0B" bg="rgba(245,158,11,0.15)" />
            <Text style={[styles.alertDate, { color: muted }]}>
              {openDangers} señal(es) de la comunidad esperan tu atención
            </Text>
          </View>
          {pendingSignals.map((signal: AlertReport) => (
            <View key={signal.id} style={[styles.auditItem, { borderColor }]}>
              <View style={styles.auditBody}>
                <Text style={[styles.alertTitle, { color: colors.primary }]}>{ALERT_REPORT_TITLES[signal.type]}</Text>
                <Text style={[styles.alertMsg, { color: muted }]}>{signal.description}</Text>
              </View>
              <Button
                label="Emitir alerta oficial"
                onPress={() => {
                  setTitle(ALERT_REPORT_TITLES[signal.type]);
                  setMessage(signal.description);
                  setCreating(true);
                }}
              />
            </View>
          ))}
        </Card>
      )}

      {activated && section === 'overview' && (
        <Card>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>Territorio municipal</Text>
            <Button
              label={boundsEditing ? 'Cancelar' : municipality?.bounds ? 'Ajustar en mapa' : 'Marcar en mapa'}
              variant={boundsEditing ? 'secondary' : 'primary'}
              onPress={() => {
                const b = municipality?.bounds;
                if (b) {
                  setBoundsSouth(String(b.south));
                  setBoundsWest(String(b.west));
                  setBoundsNorth(String(b.north));
                  setBoundsEast(String(b.east));
                }
                setCoordinatesAdvanced(false);
                setBoundsEditing((v) => !v);
              }}
            />
          </View>

          {municipality?.bounds ? (
            <View style={styles.alertTop}>
              <Badge label="Límites definidos" color="#22C55E" bg="rgba(34,197,94,0.15)" />
              <Text style={[styles.alertDate, { color: muted }]}>
                Sur {municipality.bounds.south} · Oeste {municipality.bounds.west} · Norte{' '}
                {municipality.bounds.north} · Este {municipality.bounds.east}
              </Text>
            </View>
          ) : (
            <Text style={[styles.body, { color: muted }]}>
              Marca visualmente el distrito en el mapa para mostrar únicamente sus reportes ciudadanos.
            </Text>
          )}

          {boundsEditing && (
            <View style={styles.form}>
              <TerritoryMap bounds={draftBounds} onChange={selectBoundsOnMap} />
              <View style={styles.mapActions}>
                <Button
                  label={coordinatesAdvanced ? 'Ocultar coordenadas' : 'Editar coordenadas'}
                  variant="secondary"
                  onPress={() => setCoordinatesAdvanced((value) => !value)}
                />
              </View>
              {coordinatesAdvanced && <View style={styles.boundsRow}>
                {(
                  [
                    { label: 'Sur', value: boundsSouth, setter: setBoundsSouth, ph: '-12.1' },
                    { label: 'Oeste', value: boundsWest, setter: setBoundsWest, ph: '-77.0' },
                    { label: 'Norte', value: boundsNorth, setter: setBoundsNorth, ph: '-12.0' },
                    { label: 'Este', value: boundsEast, setter: setBoundsEast, ph: '-76.9' },
                  ] as const
                ).map((f) => (
                  <View key={f.label} style={styles.boundsField}>
                    <Text style={[styles.label, { color: muted }]}>{f.label}</Text>
                    <TextInput
                      style={[styles.input, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
                      value={f.value}
                      onChangeText={f.setter}
                      placeholder={f.ph}
                      placeholderTextColor={muted}
                      keyboardType="numeric"
                    />
                  </View>
                ))}
              </View>}
              {!!boundsError && <Text style={[styles.error, { color: colors.danger }]}>{boundsError}</Text>}
              <View style={styles.actions}>
                <Button
                  label={boundsBusy ? 'Guardando...' : 'Guardar límites'}
                  onPress={saveBounds}
                  disabled={boundsBusy}
                />
              </View>
            </View>
          )}
        </Card>
      )}

      {activated && section === 'campaigns' && (
        <Card>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>Campañas municipales</Text>
            <Button
              label={campCreating ? 'Cancelar' : 'Nueva campaña'}
              variant={campCreating ? 'secondary' : 'primary'}
              onPress={() => setCampCreating((v) => !v)}
            />
          </View>

          {campCreating && (
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: muted }]}>Título</Text>
                <TextInput
                  style={[styles.input, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
                  value={campTitle}
                  onChangeText={setCampTitle}
                  placeholder="Ej: Limpieza de playas de Pucusana"
                  placeholderTextColor={muted}
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: muted }]}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.inputMulti, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
                  value={campDescription}
                  onChangeText={setCampDescription}
                  placeholder="¿Qué campaña es y cómo participar?"
                  placeholderTextColor={muted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: muted }]}>Zona / lugar (opcional)</Text>
                <TextInput
                  style={[styles.input, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
                  value={campLocation}
                  onChangeText={setCampLocation}
                  placeholder="Ej: Playa Hermosa"
                  placeholderTextColor={muted}
                />
              </View>
              {!!campError && <Text style={[styles.error, { color: colors.danger }]}>{campError}</Text>}
              <View style={styles.actions}>
                <Button
                  label={campBusy ? 'Creando...' : 'Crear campaña'}
                  onPress={submitCampaign}
                  disabled={campBusy}
                />
              </View>
            </View>
          )}

          {campaigns.length === 0 && !campCreating && (
            <Text style={[styles.body, { color: muted, marginTop: Spacing.two }]}>
              Aún no hay campañas. Crea la primera para difundirla a tu comunidad.
            </Text>
          )}

          {campaigns.map((c) => (
            <View key={c.id} style={[styles.campaignItem, { borderColor }]}>
              <View style={styles.campaignBody}>
                <View style={styles.alertTop}>
                  <Text style={[styles.alertTitle, { color: colors.primary }]}>{c.title}</Text>
                  {c.active ? (
                    <Badge label="Activa" color="#0D9488" bg="rgba(13,148,136,0.15)" />
                  ) : (
                    <Badge label="Pausada" color="#F59E0B" bg="rgba(245,158,11,0.15)" />
                  )}
                </View>
                <Text style={[styles.alertMsg, { color: muted }]}>{c.description}</Text>
                {c.location ? <Text style={[styles.alertDate, { color: muted }]}>📍 {c.location}</Text> : null}
              </View>
              <View style={styles.alertActions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={async () => { await updateCampaign(c.id, { active: !c.active }); }}
                >
                  <FontAwesome5 name={c.active ? 'pause-circle' : 'play-circle'} size={18} color="#0D9488" />
                  <Text style={[styles.actionLabel, { color: '#0D9488' }]}>{c.active ? 'Pausar' : 'Activar'}</Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={async () => { await deleteCampaign(c.id); }}>
                  <FontAwesome5 name="trash-alt" size={16} color="#EF4444" />
                  <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </Card>
      )}

      {activated && section === 'alerts' && (
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

      {activated && section === 'alerts' &&
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

      {activated && section === 'alerts' && ownAlerts.length === 0 && !creating && (
        <EmptyState
          icon="bullhorn"
          title="No has emitido alertas aún."
          description="Cuando emitas alertas oficiales aparecerán aquí y para tu comunidad."
        />
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
  campaignItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    marginTop: Spacing.two,
  },
  campaignBody: { flex: 1, gap: Spacing.one, minWidth: 0 },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
    borderBottomWidth: 1,
    paddingVertical: Spacing.two,
  },
  auditBody: { flex: 1, minWidth: 240, gap: 2 },
  link: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '700' },
  mapActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  boundsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  boundsField: { flex: 1, minWidth: 120, gap: Spacing.one },
});
