import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { firestore } from '@/shared/firebase/app';
import type { Reward } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';
import { Badge, Card, SectionHeader, LoadingState, EmptyState } from '@admin/presentation/components/ui';

type RewardRow = Reward & { id: string };

export function RewardsList() {
  const { colors } = useAdminTheme();
  const [rewards, setRewards] = useState<RewardRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(firestore, 'rewards'), orderBy('pointsCost', 'asc')),
      );
      setRewards(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RewardRow));
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
      {!loading && rewards.length === 0 && (
        <EmptyState
          icon="gift-outline"
          title="Sin recompensas"
          description="No hay recompensas registradas en el catálogo."
        />
      )}

      {rewards.length > 0 && (
        <Card style={styles.tableCard}>
          <View style={[styles.tableHead, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.th, styles.thMain, { color: colors.contentTextMuted }]}>Recompensa</Text>
            <Text style={[styles.th, styles.thNum, { color: colors.contentTextMuted }]}>Puntos</Text>
            <Text style={[styles.th, styles.thNum, { color: colors.contentTextMuted }]}>Stock</Text>
            <Text style={[styles.th, styles.thState, { color: colors.contentTextMuted }]}>Estado</Text>
          </View>

          <View>
            {rewards.map((reward) => {
              const stockLabel = reward.stock === null ? '∞' : String(reward.stock);
              const active = reward.active;
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
                </Pressable>
              );
            })}
          </View>
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
  thNum: { width: 100, textAlign: 'center' },
  thState: { width: 108, textAlign: 'center' },
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
  cellNum: { width: 100, fontFamily: Fonts.label, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  cellState: { width: 108, alignItems: 'center' },
});