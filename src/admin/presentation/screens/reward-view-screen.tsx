import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card, SectionHeader, LoadingState } from '@admin/presentation/components/ui';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { getRewardById } from '@/shared/firebase/rewards';
import type { Reward } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';

export function RewardViewScreen() {
  const { colors } = useAdminTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getRewardById(id)
      .then((r) => setReward(r))
      .finally(() => setLoading(false));
  }, [id]);

  const active = reward?.active ?? false;

  const rows: { label: string; value: string }[] = reward
    ? [
        { label: 'Título', value: reward.title },
        { label: 'Descripción', value: reward.description || '—' },
        { label: 'Costo', value: `${reward.pointsCost} pts` },
        { label: 'Stock', value: reward.stock === null ? '∞ (ilimitado)' : String(reward.stock) },
        { label: 'Patrocinador', value: reward.sponsor || '—' },
        {
          label: 'Creado',
          value: reward.createdAt?.toDate?.()
            ? reward.createdAt.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
        },
      ]
    : [];

  return (
    <AdminShell title="Ver recompensa" breadcrumb={[{ label: 'Recompensas', href: '/admin/rewards' }, { label: 'Ver' }]}>
      <SectionHeader
        title={reward?.title ?? 'Recompensa'}
        subtitle="Detalle de la recompensa del catálogo."
        actions={[
          <Button key="back" label="Volver" variant="secondary" onPress={() => router.push('/admin/rewards')} />,
        ]}
      />

      {loading && <LoadingState label="Cargando recompensa..." />}

      {!loading && !reward && (
        <Text style={{ color: colors.contentTextMuted }}>No se encontró la recompensa.</Text>
      )}

      {!loading && reward && (
        <>
          <Card style={styles.card}>
            <View style={styles.headingRow}>
              <Text style={[styles.name, { color: colors.cardText }]}>{reward.title}</Text>
              <Badge
                label={active ? 'Activo' : 'Inactivo'}
                color={active ? colors.success : colors.contentTextMuted}
                bg={active ? colors.successBg : 'rgba(100,116,139,0.10)'}
              />
            </View>

            <View style={styles.infoList}>
              {rows.map((r) => (
                <View key={r.label} style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
                  <Text style={[styles.infoLabel, { color: colors.contentTextMuted }]}>{r.label}</Text>
                  <Text style={[styles.infoValue, { color: colors.cardText }]}>{r.value}</Text>
                </View>
              ))}
            </View>

            {reward.imageURL ? (
              <Text style={[styles.imageLink, { color: colors.primary }]} numberOfLines={2}>
                {reward.imageURL}
              </Text>
            ) : null}
          </Card>

          <View style={styles.footerActions}>
            <Button label="Editar" onPress={() => router.push(`/admin/rewards/${reward.id}/edit`)} />
            <Button label="Volver al catálogo" variant="secondary" onPress={() => router.push('/admin/rewards')} />
          </View>
        </>
      )}
    </AdminShell>
  );
}

export default RewardViewScreen;

const styles = StyleSheet.create({
  card: { maxWidth: 560 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.three, flexWrap: 'wrap' },
  name: { fontFamily: Fonts.headline, fontSize: 22, fontWeight: '700' },
  infoList: { gap: 0 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  infoLabel: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '600' },
  infoValue: { fontFamily: Fonts.body, fontSize: 14, textAlign: 'right', flexShrink: 1 },
  imageLink: { fontFamily: Fonts.body, fontSize: 13, marginTop: Spacing.three },
  footerActions: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
});
