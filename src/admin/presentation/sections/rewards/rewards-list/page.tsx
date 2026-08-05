import {
  collection,
  getCountFromServer,
  getDocs,
  limit as fireLimit,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { firestore } from '@/shared/firebase/app';
import { deleteReward, updateReward } from '@/shared/firebase/rewards';
import type { Reward } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';
import { Badge, Button, Card, EmptyState, IconButton, LoadingState, PaginationFooter, SectionHeader } from '@admin/presentation/components/ui';

type RewardRow = Reward & { id: string };

const PAGE_SIZE = 8;

export function RewardsList() {
  const { colors } = useAdminTheme();
  const [rewards, setRewards] = useState<RewardRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<any[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const currentPageRef = useRef(currentPage);

  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalDocs / PAGE_SIZE));
  const start = rewards.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, totalDocs);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      let q = query(collection(firestore, 'rewards'), orderBy('pointsCost', 'asc'), fireLimit(PAGE_SIZE));
      if (page > 1 && pageCursors.length >= page - 1) {
        q = query(q, startAfter(pageCursors[page - 2]));
      }

      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RewardRow);
      setRewards(docs);
      setCurrentPage(page);

      if (snap.docs.length > 0) {
        setPageCursors((prev) => {
          const next = [...prev];
          next[page - 1] = snap.docs[snap.docs.length - 1];
          return next;
        });
      } else {
        setPageCursors((prev) => prev.slice(0, page - 1));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [pageCursors]);

  const fetchTotal = useCallback(async () => {
    try {
      const snap = await getCountFromServer(collection(firestore, 'rewards'));
      setTotalDocs(snap.data().count);
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchTotal();
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleActive = async (reward: RewardRow) => {
    setBusyId(reward.id);
    try {
      await updateReward(reward.id, { active: !reward.active });
      setRewards((prev) => prev.map((r) => (r.id === reward.id ? { ...r, active: !r.active } : r)));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (reward: RewardRow) => {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (!window.confirm(`¿Eliminar la recompensa "${reward.title}"? Esta acción no se puede deshacer.`)) return;
      doDelete(reward);
      return;
    }
    Alert.alert('Eliminar recompensa', `¿Eliminar "${reward.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => doDelete(reward) },
    ]);
  };

  const doDelete = async (reward: RewardRow) => {
    setBusyId(reward.id);
    try {
      await deleteReward(reward.id);
      await fetchTotal();
      const current = currentPageRef.current;
      if (rewards.length === 1 && current > 1) {
        await loadPage(current - 1);
      } else {
        await loadPage(current);
      }
    } finally {
      setBusyId(null);
    }
  };

  const hoverBg = 'rgba(148,163,184,0.08)';

  return (
    <View style={styles.content}>
      <SectionHeader
        title="Catálogo de recompensas"
        subtitle="Recompensas que los usuarios canjean con los puntos acumulados."
      />

      {loading && rewards.length === 0 && (
        <LoadingState label="Cargando catálogo..." />
      )}
      {!loading && totalDocs === 0 && (
        <EmptyState
          icon="gift-outline"
          title="Sin recompensas"
          description="No hay recompensas registradas en el catálogo."
        />
      )}

      {totalDocs > 0 && (
        <Card style={styles.tableCard}>
          <View style={[styles.tableHead, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.th, styles.thMain, { color: colors.contentTextMuted }]}>Recompensa</Text>
            <Text style={[styles.th, styles.thNum, { color: colors.contentTextMuted }]}>Puntos</Text>
            <Text style={[styles.th, styles.thNum, { color: colors.contentTextMuted }]}>Stock</Text>
            <Text style={[styles.th, styles.thState, { color: colors.contentTextMuted }]}>Estado</Text>
            <Text style={[styles.th, styles.thActions, { color: colors.contentTextMuted }]}>Acciones</Text>
          </View>

          <View>
            {rewards.map((reward) => {
              const stockLabel = reward.stock === null ? '∞' : String(reward.stock);
              const active = reward.active;
              const busy = busyId === reward.id;
              return (
                <Pressable
                  key={reward.id}
                  style={({ hovered }) => [
                    styles.row,
                    { borderBottomColor: colors.cardBorder },
                    hovered && { backgroundColor: hoverBg },
                  ]}
                >
                  <View style={styles.cellMain}>
                    <Text style={[styles.rowTitle, { color: colors.cardText }]} numberOfLines={1}>
                      {reward.title}
                    </Text>
                    {reward.sponsor ? (
                      <Text style={[styles.rowMeta, { color: colors.contentTextMuted }]} numberOfLines={1}>
                        {reward.sponsor}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.cellNum, { color: colors.contentTextMuted }]}>
                    {reward.pointsCost} pts
                  </Text>
                  <Text style={[styles.cellNum, { color: colors.contentTextMuted }]}>
                    {stockLabel}
                  </Text>
                  <View style={styles.cellState}>
                    <Badge
                      label={active ? 'Activo' : 'Inactivo'}
                      color={active ? colors.success : colors.contentTextMuted}
                      bg={active ? colors.successBg : 'rgba(100,116,139,0.10)'}
                    />
                  </View>
                  <View style={styles.cellActions}>
                    <Button
                      label={active ? 'Desactivar' : 'Activar'}
                      variant={active ? 'danger' : 'primary'}
                      onPress={() => toggleActive(reward)}
                      disabled={busy}
                    />
                    <IconButton
                      icon="delete-outline"
                      label="Eliminar"
                      color={colors.danger}
                      onPress={() => handleDelete(reward)}
                      style={{ marginLeft: Spacing.two }}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>

          <PaginationFooter
            start={start}
            end={end}
            total={totalDocs}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => loadPage(currentPage - 1)}
            onNext={() => loadPage(currentPage + 1)}
            loading={loading}
          />
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.four },
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
  thMain: { flex: 1 },
  thNum: { width: 80, textAlign: 'center' },
  thState: { width: 96, textAlign: 'center' },
  thActions: { width: 168, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.three,
    cursor: 'auto',
  },
  cellMain: { flex: 1, gap: 2, minWidth: 0 },
  rowTitle: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '600' },
  rowMeta: { fontFamily: Fonts.body, fontSize: 12 },
  cellNum: { width: 80, fontFamily: Fonts.label, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  cellState: { width: 96, alignItems: 'center' },
  cellActions: { width: 168, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
