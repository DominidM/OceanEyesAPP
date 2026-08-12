import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { firestore } from '@/shared/firebase/app';
import { getAllRedemptions } from '@/shared/firebase/rewards';
import type { Redemption, RedemptionStatus } from '@/shared/firebase/types';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Card, EmptyState, AdminLoading, SectionHeader } from '@admin/presentation/components/ui';
import { useAdminTheme } from '@admin/theme/context';

type RedemptionRow = Redemption & {
  userName: string;
  rewardTitle: string;
};

const STATUS_LABELS: Record<RedemptionStatus, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
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

export function RedemptionsScreen() {
  const { colors } = useAdminTheme();
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await getAllRedemptions();
      const rows: RedemptionRow[] = [];
      for (const r of list) {
        let userName = '—';
        let rewardTitle = '—';
        try {
          const userSnap = await getDoc(doc(firestore, 'users', r.userId));
          if (userSnap.exists()) {
            const u = userSnap.data();
            userName = u.displayName ?? u.email ?? r.userId.slice(0, 8);
          }
        } catch {}
        try {
          const rewardSnap = await getDoc(doc(firestore, 'rewards', r.rewardId));
          if (rewardSnap.exists()) {
            rewardTitle = rewardSnap.data().title ?? r.rewardId.slice(0, 8);
          }
        } catch {}
        rows.push({ ...r, userName, rewardTitle });
      }
      setRedemptions(rows);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  return (
    <AdminShell title="Canjes" breadcrumb={[{ label: 'Canjes' }]}>
      {!(loading && redemptions.length === 0) && (
        <SectionHeader
          title="Gestión de canjes"
          subtitle="Administra los canjes de recompensas. Revisá cada pedido y avanzá su flujo."
        />
      )}

      {loading && redemptions.length === 0 && <AdminLoading variant="list" />}

      {!loading && redemptions.length === 0 && (
        <EmptyState
          icon="gift-outline"
          title="Sin canjes"
          description="No hay canjes registrados todavía. Cuando un usuario canjee una recompensa aparecerá aquí."
        />
      )}

      {redemptions.length > 0 && (
        <Card style={styles.tableCard}>
          <View style={[styles.tableHead, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.th, styles.thUser, { color: colors.contentTextMuted }]}>Usuario</Text>
            <Text style={[styles.th, styles.thReward, { color: colors.contentTextMuted }]}>Recompensa</Text>
            <Text style={[styles.th, styles.thPoints, { color: colors.contentTextMuted }]}>Puntos</Text>
            <Text style={[styles.th, styles.thStatus, { color: colors.contentTextMuted }]}>Estado</Text>
            <Text style={[styles.th, styles.thDate, { color: colors.contentTextMuted }]}>Fecha</Text>
            <Text style={[styles.th, styles.thActions, { color: colors.contentTextMuted }]}>Acciones</Text>
          </View>

          {redemptions.map((r) => {
            const badge = statusBadge(r.status);
            const actions = NEXT_ACTIONS[r.status];
            return (
              <View key={r.id} style={[styles.row, { borderBottomColor: colors.cardBorder }]}>
                <View style={styles.cellUser}>
                  <Text style={[styles.rowTitle, { color: colors.cardText }]} numberOfLines={1}>
                    {r.userName}
                  </Text>
                  <Text style={[styles.rowMeta, { color: colors.contentTextMuted }]}>
                    #{r.id.slice(0, 8)}
                  </Text>
                </View>
                <Text style={[styles.cellReward, { color: colors.contentTextMuted }]} numberOfLines={1}>
                  {r.rewardTitle}
                </Text>
                <Text style={[styles.cellPoints, { color: colors.danger }]}>
                  -{r.pointsSpent}
                </Text>
                <View style={styles.cellStatus}>
                  <Badge label={badge.label} color={badge.color} bg={badge.bg} />
                </View>
                <Text style={[styles.cellDate, { color: colors.contentTextMuted }]}>
                  {formatDate(r.createdAt)}
                </Text>
                <View style={styles.cellActions}>
                  <Pressable
                    style={[styles.detailsBtn, { borderColor: colors.cardBorder }]}
                    onPress={() => router.push({ pathname: '/admin/redemptions/[id]', params: { id: r.id } })}
                  >
                    <MaterialCommunityIcons name="information-outline" size={14} color={colors.contentText} />
                    <Text style={[styles.detailsBtnText, { color: colors.contentText }]}>Detalles</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </Card>
      )}
    </AdminShell>
  );
}

export default RedemptionsScreen;

const styles = StyleSheet.create({
  tableCard: { gap: 0, padding: 0, overflow: 'hidden' },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  th: { fontFamily: Fonts.label, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  thUser: { flex: 1.4, minWidth: 0 },
  thReward: { flex: 1.2, minWidth: 0 },
  thPoints: { width: 70, textAlign: 'center' },
  thStatus: { width: 120, textAlign: 'center' },
  thDate: { width: 90 },
  thActions: { width: 120, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.two,
  },
  cellUser: { flex: 1.4, gap: 2, minWidth: 0 },
  rowTitle: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '600' },
  rowMeta: { fontFamily: Fonts.body, fontSize: 12 },
  cellReward: { flex: 1.2, fontFamily: Fonts.body, fontSize: 13, minWidth: 0 },
  cellPoints: { width: 70, fontFamily: Fonts.body, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  cellStatus: { width: 120, alignItems: 'center' },
  cellDate: { width: 90, fontFamily: Fonts.body, fontSize: 12 },
  cellActions: { width: 120, alignItems: 'center' },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    cursor: 'pointer',
  },
  detailsBtnText: { fontFamily: Fonts.body, fontSize: 12, fontWeight: '600' },
});
