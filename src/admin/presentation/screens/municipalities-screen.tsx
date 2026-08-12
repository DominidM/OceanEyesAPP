import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card, EmptyState, AdminLoading, SectionHeader } from '@admin/presentation/components/ui';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { useAdminTheme } from '@admin/theme/context';
import { useAuth } from '@/shared/firebase/auth-context';
import { approveMunicipality, rejectMunicipality, subscribeAllMunicipalities } from '@/shared/firebase/municipalities';
import type { Municipality } from '@/shared/firebase/types';

function formatTime(ts: any) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
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

export function MunicipalitiesScreen() {
  const { user } = useAuth();
  const { colors, mode } = useAdminTheme();
  const isDark = mode === 'dark';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#1E293B' : '#E2E8F0';
  const inputBg = isDark ? '#0F172A' : '#F8FAFC';

  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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

  return (
    <AdminShell title="Municipalidades" breadcrumb={[{ label: 'Municipalidades' }]}>
      {!loading && (
        <SectionHeader
          title="Adhesión municipal"
          subtitle="Revisa las solicitudes de municipalidades y actívalas para que puedan emitir alertas oficiales."
        />
      )}

      {loading && <AdminLoading variant="list" />}

      {!loading && pending.length === 0 && (
        <EmptyState
          icon="office-building"
          title="No hay solicitudes pendientes."
          description="Cuando una municipalidad se registre, su solicitud aparecerá aquí."
        />
      )}

      {municipalities.map((m) => {
        const cfg = statusCfg(m.status);
        const isPending = m.status === 'pending';
        const isRejecting = rejectingId === m.id;
        return (
          <Card key={m.id}>
            <View style={styles.row}>
              <View style={styles.body}>
                <View style={styles.top}>
                  <Text style={[styles.name, { color: colors.primary }]}>{m.name}</Text>
                  <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
                </View>
                <Text style={[styles.meta, { color: muted }]}>
                  {m.province}, {m.region}
                </Text>
                <Text style={[styles.meta, { color: muted }]}>
                  Contacto: {m.contactName ?? '—'} · {m.contactEmail ?? '—'} · {m.phone ?? '—'}
                </Text>
                {m.status === 'rejected' && m.rejectedReason && (
                  <Text style={[styles.meta, { color: colors.danger }]}>Motivo: {m.rejectedReason}</Text>
                )}
                <Text style={[styles.date, { color: muted }]}>Solicitada: {formatTime(m.createdAt)}</Text>
              </View>

              <View style={styles.actions}>
                {isPending && (
                  <>
                    {isRejecting ? (
                      <View style={styles.rejectBox}>
                        <TextInput
                          style={[styles.rejectInput, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
                          value={rejectReason}
                          onChangeText={setRejectReason}
                          placeholder="Motivo del rechazo"
                          placeholderTextColor={muted}
                        />
                        <Button label="Confirmar" variant="danger" onPress={() => reject(m.id)} disabled={busy === m.id || !rejectReason.trim()} />
                        <Button label="Cancelar" variant="secondary" onPress={() => { setRejectingId(null); setRejectReason(''); }} />
                      </View>
                    ) : (
                      <View style={styles.actionsRow}>
                        <Button label={busy === m.id ? 'Activando...' : 'Aprobar'} onPress={() => approve(m.id)} disabled={busy === m.id} />
                        <Button label="Rechazar" variant="secondary" onPress={() => setRejectingId(m.id)} />
                      </View>
                    )}
                  </>
                )}
                {m.status === 'rejected' && (
                  <Button label="Reactivar" onPress={() => approve(m.id)} disabled={busy === m.id} />
                )}
              </View>
            </View>
          </Card>
        );
      })}
    </AdminShell>
  );
}

export default MunicipalitiesScreen;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.three },
  body: { flex: 1, gap: Spacing.one, minWidth: 0 },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  name: { fontFamily: Fonts.headline, fontSize: 16, fontWeight: '700', flex: 1, minWidth: 0 },
  meta: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 19 },
  date: { fontFamily: Fonts.body, fontSize: 11 },
  actions: { minWidth: 140, gap: Spacing.two, alignItems: 'flex-end' },
  actionsRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap', justifyContent: 'flex-end' },
  rejectBox: { gap: Spacing.two, alignItems: 'flex-end', width: '100%' },
  rejectInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.body,
    fontSize: 14,
    width: '100%',
  },
});