import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card, EmptyState, AdminLoading, SectionHeader } from '@admin/presentation/components/ui';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { useAdminTheme } from '@admin/theme/context';
import { useAuth } from '@/shared/firebase/auth-context';
import { approveMunicipality, rejectMunicipality, subscribeAllMunicipalities } from '@/shared/firebase/municipalities';
import type { Municipality } from '@/shared/firebase/types';

type TabKey = 'registrados' | 'pendientes';

function formatTime(ts: any) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusCfg(status: Municipality['status']) {
  switch (status) {
    case 'active':
      return { label: 'Activa', color: '#10B981', bg: 'rgba(16,185,129,0.15)' };
    case 'rejected':
      return { label: 'Rechazada', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' };
    default:
      return { label: 'Pendiente', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' };
  }
}

export function MunicipalitiesList() {
  const { user } = useAuth();
  const { colors, mode } = useAdminTheme();
  const isDark = mode === 'dark';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#1E293B' : '#E2E8F0';
  const inputBg = isDark ? '#0F172A' : '#F8FAFC';
  const hoverBg = 'rgba(148,163,184,0.08)';

  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [tab, setTab] = useState<TabKey>('registrados');

  useEffect(() => {
    const unsub = subscribeAllMunicipalities((list) => {
      setMunicipalities(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const approve = async (id: string) => {
    setBusy(id);
    try {
      await approveMunicipality(id, user?.uid ?? 'unknown');
    } finally {
      setBusy(null);
    }
  };

  const reject = async (id: string) => {
    if (!rejectReason.trim()) return;
    setBusy(id);
    try {
      await rejectMunicipality(id, user?.uid ?? 'unknown', rejectReason.trim());
      setRejectingId(null);
      setRejectReason('');
    } finally {
      setBusy(null);
    }
  };

  const pending = municipalities.filter((m) => m.status === 'pending');
  const registered = municipalities.filter((m) => m.status === 'active' || m.status === 'rejected');
  const displayed = tab === 'pendientes' ? pending : registered;

  return (
    <View style={styles.content}>
      <SectionHeader
        title="Adhesión municipal"
        subtitle="Revisa las solicitudes de municipalidades y actívalas para que puedan emitir alertas oficiales."
      />

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, tab === 'registrados' && styles.tabActive, { borderColor: tab === 'registrados' ? colors.primary : borderColor, backgroundColor: tab === 'registrados' ? colors.inputBg : 'transparent' }]}
          onPress={() => setTab('registrados')}
        >
          <MaterialCommunityIcons name="office-building" size={14} color={tab === 'registrados' ? colors.primary : muted} />
          <Text style={[styles.tabText, { color: tab === 'registrados' ? colors.primary : muted }]}>
            Registrados ({registered.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'pendientes' && styles.tabActive, { borderColor: tab === 'pendientes' ? colors.primary : borderColor, backgroundColor: tab === 'pendientes' ? colors.inputBg : 'transparent' }]}
          onPress={() => setTab('pendientes')}
        >
          <MaterialCommunityIcons name="clock-outline" size={14} color={tab === 'pendientes' ? colors.primary : muted} />
          <Text style={[styles.tabText, { color: tab === 'pendientes' ? colors.primary : muted }]}>
            Pendientes ({pending.length})
          </Text>
        </Pressable>
      </View>

      {loading && (
        <Card style={styles.tableCard}>
          <View style={[styles.tableHead, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.th, styles.thName, { color: colors.contentTextMuted }]}>Municipalidad</Text>
            <Text style={[styles.th, styles.thLocation, { color: colors.contentTextMuted }]}>Ubicación</Text>
            <Text style={[styles.th, styles.thContact, { color: colors.contentTextMuted }]}>Contacto</Text>
            <Text style={[styles.th, styles.thStatus, { color: colors.contentTextMuted }]}>Estado</Text>
            <Text style={[styles.th, styles.thDate, { color: colors.contentTextMuted }]}>Fecha</Text>
            <Text style={[styles.th, styles.thActions, { color: colors.contentTextMuted }]}>Acciones</Text>
          </View>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={[styles.row, { borderBottomColor: colors.cardBorder }]}>
              <View style={styles.thName}><View style={[styles.skeleton, { backgroundColor: inputBg }]} /></View>
              <View style={styles.thLocation}><View style={[styles.skeleton, { backgroundColor: inputBg }]} /></View>
              <View style={styles.thContact}><View style={[styles.skeleton, { backgroundColor: inputBg }]} /></View>
              <View style={styles.thStatus}><View style={[styles.skeletonSmall, { backgroundColor: inputBg }]} /></View>
              <View style={styles.thDate}><View style={[styles.skeleton, { backgroundColor: inputBg }]} /></View>
              <View style={styles.thActions}><View style={[styles.skeletonBtn, { backgroundColor: inputBg }]} /></View>
            </View>
          ))}
        </Card>
      )}

      {!loading && displayed.length === 0 && (
        <EmptyState
          icon="office-building"
          title={tab === 'pendientes' ? 'No hay solicitudes pendientes.' : 'No hay municipalidades registradas.'}
          description={tab === 'pendientes' ? 'Cuando una municipalidad se registre, su solicitud aparecerá aquí.' : 'Aún no hay municipalidades aprobadas o rechazadas.'}
        />
      )}

      {!loading && displayed.length > 0 && (
        <Card style={styles.tableCard}>
          <View style={[styles.tableHead, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.th, styles.thName, { color: colors.contentTextMuted }]}>Municipalidad</Text>
            <Text style={[styles.th, styles.thLocation, { color: colors.contentTextMuted }]}>Ubicación</Text>
            <Text style={[styles.th, styles.thContact, { color: colors.contentTextMuted }]}>Contacto</Text>
            <Text style={[styles.th, styles.thStatus, { color: colors.contentTextMuted }]}>Estado</Text>
            <Text style={[styles.th, styles.thDate, { color: colors.contentTextMuted }]}>Fecha</Text>
            <Text style={[styles.th, styles.thActions, { color: colors.contentTextMuted }]}>Acciones</Text>
          </View>

          {displayed.map((m) => {
            const cfg = statusCfg(m.status);
            const isPending = m.status === 'pending';
            const isRejecting = rejectingId === m.id;
            return (
              <Pressable
                key={m.id}
                style={({ hovered }) => [
                  styles.row,
                  { borderBottomColor: colors.cardBorder },
                  hovered && { backgroundColor: hoverBg },
                ]}
              >
                <View style={styles.cellName}>
                  <Text style={[styles.cellNameText, { color: colors.primary }]} numberOfLines={1}>
                    {m.name}
                  </Text>
                  {m.status === 'rejected' && m.rejectedReason && (
                    <Text style={[styles.cellRejectReason, { color: colors.danger }]} numberOfLines={1}>
                      {m.rejectedReason}
                    </Text>
                  )}
                </View>
                <Text style={[styles.cellLocation, { color: muted }]} numberOfLines={1}>
                  {m.province}, {m.region}
                </Text>
                <View style={styles.cellContact}>
                  <Text style={[styles.cellContactText, { color: muted }]} numberOfLines={1}>
                    {m.contactName ?? '—'}
                  </Text>
                  <Text style={[styles.cellContactMeta, { color: muted }]} numberOfLines={1}>
                    {m.contactEmail ?? '—'}
                  </Text>
                </View>
                <View style={styles.cellStatus}>
                  <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
                </View>
                <Text style={[styles.cellDate, { color: muted }]}>
                  {formatTime(m.createdAt)}
                </Text>
                <View style={styles.cellActions}>
                  {isPending && !isRejecting && (
                    <View style={styles.actionsRow}>
                      <Pressable
                        style={[styles.actionBtn, { borderColor: '#22C55E' }]}
                        onPress={() => approve(m.id)}
                      >
                        <MaterialCommunityIcons name="check-circle-outline" size={14} color="#22C55E" />
                        <Text style={[styles.actionLabel, { color: '#22C55E' }]}>
                          {busy === m.id ? '...' : 'Aprobar'}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[styles.actionBtn, { borderColor: '#EF4444' }]}
                        onPress={() => setRejectingId(m.id)}
                      >
                        <MaterialCommunityIcons name="close-circle-outline" size={14} color="#EF4444" />
                        <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Rechazar</Text>
                      </Pressable>
                    </View>
                  )}
                  {isPending && isRejecting && (
                    <View style={styles.rejectBox}>
                      <TextInput
                        style={[styles.rejectInput, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
                        value={rejectReason}
                        onChangeText={setRejectReason}
                        placeholder="Motivo"
                        placeholderTextColor={muted}
                      />
                      <View style={styles.rejectActions}>
                        <Pressable
                          style={[styles.actionBtn, { borderColor: '#22C55E' }]}
                          onPress={() => reject(m.id)}
                          disabled={busy === m.id || !rejectReason.trim()}
                        >
                          <Text style={[styles.actionLabel, { color: '#22C55E' }]}>OK</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.actionBtn, { borderColor: muted }]}
                          onPress={() => { setRejectingId(null); setRejectReason(''); }}
                        >
                          <Text style={[styles.actionLabel, { color: muted }]}>X</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                  {m.status === 'rejected' && (
                    <Pressable
                      style={[styles.actionBtn, { borderColor: colors.primary }]}
                      onPress={() => approve(m.id)}
                      disabled={busy === m.id}
                    >
                      <MaterialCommunityIcons name="refresh" size={14} color={colors.primary} />
                      <Text style={[styles.actionLabel, { color: colors.primary }]}>
                        {busy === m.id ? '...' : 'Reactivar'}
                      </Text>
                    </Pressable>
                  )}
                  {m.status === 'active' && (
                    <Text style={[styles.activeLabel, { color: '#22C55E' }]}>Activa</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </Card>
      )}
    </View>
  );
}

export default MunicipalitiesList;

const styles = StyleSheet.create({
  content: { gap: Spacing.four },
  tabRow: { flexDirection: 'row', gap: Spacing.two },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    cursor: 'pointer',
  },
  tabActive: {},
  tabText: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '600' },
  tableCard: { gap: 0, padding: 0, overflow: 'hidden' },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.three,
  },
  th: { fontFamily: Fonts.label, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  thName: { flex: 1.5, minWidth: 0 },
  thLocation: { width: 140 },
  thContact: { flex: 1, minWidth: 0 },
  thStatus: { width: 90, alignItems: 'center' },
  thDate: { width: 90 },
  thActions: { width: 180, alignItems: 'flex-end' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.three,
  },
  cellName: { flex: 1.5, gap: 2, minWidth: 0 },
  cellNameText: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '600' },
  cellRejectReason: { fontFamily: Fonts.body, fontSize: 11 },
  cellLocation: { width: 140, fontFamily: Fonts.body, fontSize: 13 },
  cellContact: { flex: 1, gap: 2, minWidth: 0 },
  cellContactText: { fontFamily: Fonts.body, fontSize: 13 },
  cellContactMeta: { fontFamily: Fonts.body, fontSize: 11 },
  cellStatus: { width: 90, alignItems: 'center' },
  cellDate: { width: 90, fontFamily: Fonts.body, fontSize: 12 },
  cellActions: { width: 180, alignItems: 'flex-end' },
  actionsRow: { flexDirection: 'row', gap: Spacing.two, justifyContent: 'flex-end' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    cursor: 'pointer',
  },
  actionLabel: { fontFamily: Fonts.body, fontSize: 12, fontWeight: '600' },
  activeLabel: { fontFamily: Fonts.body, fontSize: 12, fontWeight: '600' },
  rejectBox: { gap: Spacing.two, alignItems: 'flex-end', width: '100%' },
  rejectActions: { flexDirection: 'row', gap: Spacing.two, justifyContent: 'flex-end' },
  rejectInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    fontFamily: Fonts.body,
    fontSize: 13,
    width: '100%',
  },
  skeleton: { height: 14, borderRadius: 4 },
  skeletonSmall: { height: 22, width: 60, borderRadius: 999 },
  skeletonBtn: { height: 32, width: 80, borderRadius: 8 },
});
