import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card, SectionHeader, AdminLoading } from '@admin/presentation/components/ui';
import { ReportDataList } from '@admin/presentation/components/reports/report-data-list';
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
      {!loading && (
        <SectionHeader
          title={reward?.title ?? 'Recompensa'}
          subtitle="Detalle de la recompensa del catálogo."
          actions={[
            <Button key="back" label="Volver" variant="secondary" onPress={() => router.push('/admin/rewards')} />,
          ]}
        />
      )}

      {loading && <AdminLoading variant="detail" />}

      {!loading && !reward && (
        <Text style={{ color: colors.contentTextMuted }}>No se encontró la recompensa.</Text>
      )}

      {!loading && reward && (
        <>
          <View style={styles.layout}>
            {reward.imageURL ? (
              <Card style={[styles.imageCard, { borderColor: colors.cardBorder }]}>
                <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Imagen</Text>
                <Image source={{ uri: reward.imageURL }} style={styles.rewardImage} contentFit="cover" />
              </Card>
            ) : null}

            <Card style={[styles.card, !reward.imageURL && { flex: 1 }]}>
              <View style={[styles.subBlock, { borderColor: colors.cardBorder }]}>
                <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Datos de la recompensa</Text>

                <View style={styles.headingRow}>
                  <Badge
                    label={active ? 'Activo' : 'Inactivo'}
                    color={active ? colors.success : colors.contentTextMuted}
                    bg={active ? colors.successBg : 'rgba(100,116,139,0.10)'}
                  />
                </View>

                <ReportDataList rows={rows} />
              </View>
            </Card>
          </View>

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
  layout: { flexDirection: 'row', gap: Spacing.four },
  imageCard: { width: 280, flexShrink: 0, gap: Spacing.three, borderWidth: 1, borderRadius: 12 },
  rewardImage: { width: '100%', height: 220, borderRadius: 12 },
  card: { flex: 1, gap: Spacing.three },
  subBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  subBlockTitle: { fontFamily: Fonts.label, fontSize: 14, fontWeight: '700' },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  footerActions: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap', justifyContent: 'flex-end' },
});
