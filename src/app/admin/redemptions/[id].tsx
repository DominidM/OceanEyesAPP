import { doc, getDoc } from 'firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { firestore } from '@/shared/firebase/app';
import { getRedemptionById, updateRedemptionStatus } from '@/shared/firebase/rewards';
import type { Redemption, RedemptionStatus } from '@/shared/firebase/types';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card, SectionHeader, AdminLoading } from '@admin/presentation/components/ui';
import { ReportDataList } from '@admin/presentation/components/reports/report-data-list';
import { useAdminTheme } from '@admin/theme/context';

type RedemptionDetail = Redemption & {
  userName: string;
  userEmail: string;
  rewardTitle: string;
  rewardDescription: string;
};

const STATUS_LABELS: Record<RedemptionStatus, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const ACTION_DESCRIPTIONS: Record<string, string> = {
  confirmado: 'Aprobá el canje para que el equipo comience a preparar el envío de la recompensa.',
  en_preparacion: 'Marcá el pedido como en preparación cuando el equipo esté empaquetando la recompensa.',
  enviado: 'Registrá el envío cuando la recompensa haya sido despachada hacia el usuario.',
  entregado: 'Confirmá que el usuario recibió su recompensa. Este es el último paso del flujo.',
  cancelado: 'Cancelá el canje si no es posible cumplirlo. El usuario será notificado.',
};

const NEXT_ACTIONS: Record<RedemptionStatus, { label: string; next: RedemptionStatus; variant: 'primary' | 'secondary' | 'danger' }[]> = {
  pendiente: [
    { label: 'Confirmar', next: 'confirmado', variant: 'primary' },
    { label: 'Cancelar', next: 'cancelado', variant: 'danger' },
  ],
  confirmado: [
    { label: 'Preparar', next: 'en_preparacion', variant: 'primary' },
    { label: 'Cancelar', next: 'cancelado', variant: 'danger' },
  ],
  en_preparacion: [
    { label: 'Enviar', next: 'enviado', variant: 'primary' },
    { label: 'Cancelar', next: 'cancelado', variant: 'danger' },
  ],
  enviado: [
    { label: 'Entregar', next: 'entregado', variant: 'primary' },
    { label: 'Cancelar', next: 'cancelado', variant: 'danger' },
  ],
  entregado: [],
  cancelado: [],
};

export function RedemptionDetailScreen() {
  const { colors } = useAdminTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [redemption, setRedemption] = useState<RedemptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const r = await getRedemptionById(id);
      if (!r) return;

      let userName = '—';
      let userEmail = '—';
      let rewardTitle = '—';
      let rewardDescription = '—';

      try {
        const userSnap = await getDoc(doc(firestore, 'users', r.userId));
        if (userSnap.exists()) {
          const u = userSnap.data();
          userName = u.displayName ?? u.email ?? r.userId.slice(0, 8);
          userEmail = u.email ?? '—';
        }
      } catch {}

      try {
        const rewardSnap = await getDoc(doc(firestore, 'rewards', r.rewardId));
        if (rewardSnap.exists()) {
          const rw = rewardSnap.data();
          rewardTitle = rw.title ?? r.rewardId.slice(0, 8);
          rewardDescription = rw.description ?? '—';
        }
      } catch {}

      setRedemption({ ...r, userName, userEmail, rewardTitle, rewardDescription });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAction = async (next: RedemptionStatus) => {
    if (!id || acting) return;
    setActing(true);
    try {
      await updateRedemptionStatus(id, next);
      await load();
    } catch {} finally {
      setActing(false);
    }
  };

  const statusBadge = (status: RedemptionStatus) => {
    switch (status) {
      case 'pendiente': return { label: STATUS_LABELS[status], color: colors.warning, bg: colors.warningBg };
      case 'confirmado': return { label: STATUS_LABELS[status], color: '#2563EB', bg: 'rgba(37,99,235,0.12)' };
      case 'en_preparacion': return { label: STATUS_LABELS[status], color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' };
      case 'enviado': return { label: STATUS_LABELS[status], color: colors.accent, bg: 'rgba(152,185,177,0.15)' };
      case 'entregado': return { label: STATUS_LABELS[status], color: colors.success, bg: colors.successBg };
      case 'cancelado': return { label: STATUS_LABELS[status], color: colors.danger, bg: colors.dangerBg };
    }
  };

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return '—';
    return ts.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const actions = redemption ? NEXT_ACTIONS[redemption.status] : [];
  const badge = redemption ? statusBadge(redemption.status) : null;

  const rows = redemption
    ? [
        { label: 'Usuario', value: redemption.userName },
        { label: 'Email', value: redemption.userEmail },
        { label: 'Recompensa', value: redemption.rewardTitle },
        { label: 'Descripción', value: redemption.rewardDescription },
        { label: 'Puntos gastados', value: `${redemption.pointsSpent} pts` },
        { label: 'Estado', value: STATUS_LABELS[redemption.status] },
        { label: 'Fecha', value: formatDate(redemption.createdAt) },
      ]
    : [];

  return (
    <AdminShell title="Detalle del canje" breadcrumb={[{ label: 'Canjes', href: '/admin/redemptions' }, { label: 'Detalle' }]}>
      {!loading && (
        <SectionHeader
          title={redemption?.rewardTitle ?? 'Canje'}
          subtitle={`Canje de ${redemption?.userName ?? '—'}`}
          actions={[
            <Button key="back" label="Volver" variant="secondary" onPress={() => router.push('/admin/redemptions')} />,
          ]}
        />
      )}

      {loading && <AdminLoading variant="detail" />}

      {!loading && !redemption && (
        <Text style={{ color: colors.contentTextMuted }}>No se encontró el canje.</Text>
      )}

      {!loading && redemption && (
        <>
          <Card style={styles.card}>
            <View style={[styles.subBlock, { borderColor: colors.cardBorder }]}>
              <View style={styles.headingRow}>
                <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Datos del canje</Text>
                {badge && <Badge label={badge.label} color={badge.color} bg={badge.bg} />}
              </View>
              <ReportDataList rows={rows} />
            </View>
          </Card>

          {actions.length > 0 && (
            <Card style={styles.card}>
              <View style={[styles.subBlock, { borderColor: colors.cardBorder }]}>
                <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Acciones</Text>
                <Text style={[styles.actionsDesc, { color: colors.contentTextMuted }]}>
                  Elegí una acción para avanzar el estado del canje. Cada paso notificará al usuario.
                </Text>
                <View style={styles.actionsList}>
                  {actions.map((a) => (
                    <View key={a.next} style={[styles.actionItem, { borderColor: colors.cardBorder }]}>
                      <View style={styles.actionInfo}>
                        <Text style={[styles.actionLabel, { color: colors.contentText }]}>{a.label}</Text>
                        <Text style={[styles.actionHint, { color: colors.contentTextMuted }]}>
                          {ACTION_DESCRIPTIONS[a.next] ?? ''}
                        </Text>
                      </View>
                      <Button
                        label={acting ? '...' : a.label}
                        variant={a.variant}
                        onPress={() => handleAction(a.next)}
                        disabled={acting}
                      />
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          )}
        </>
      )}
    </AdminShell>
  );
}

export default RedemptionDetailScreen;

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  subBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  subBlockTitle: { fontFamily: Fonts.label, fontSize: 14, fontWeight: '700' },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  actionsDesc: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 20 },
  actionsList: { gap: Spacing.two },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: 10,
    padding: Spacing.three,
  },
  actionInfo: { flex: 1, gap: 2 },
  actionLabel: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '600' },
  actionHint: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 18 },
});
