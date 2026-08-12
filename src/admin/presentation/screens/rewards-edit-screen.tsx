import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { AdminShell } from '@admin/layout/admin-shell';
import { RewardForm, type RewardFormValues } from '@admin/presentation/components/rewards/reward-form';
import { SectionHeader, AdminLoading } from '@admin/presentation/components/ui';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { getRewardById, updateReward } from '@/shared/firebase/rewards';
import type { Reward } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';

export function RewardsEditScreen() {
  const { colors } = useAdminTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reward, setReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getRewardById(id)
      .then((r) => setReward(r))
      .catch((e) => setError(e?.message || String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (values: RewardFormValues) => {
    if (!id) return;
    await updateReward(id, {
      title: values.title,
      description: values.description,
      pointsCost: values.pointsCost,
      stock: values.stock,
      active: values.active,
      sponsor: values.sponsor,
      imageURL: values.imageURL,
    });
    router.push('/admin/rewards');
  };

  return (
    <AdminShell title="Editar recompensa" breadcrumb={[{ label: 'Recompensas', href: '/admin/rewards' }, { label: 'Editar' }]}>
      <SectionHeader
        title="Editar recompensa"
        subtitle="Modifica los datos de la recompensa y guarda los cambios."
      />

      {loading && <AdminLoading variant="form" />}

      {!loading && !reward && (
        <View style={{ gap: Spacing.three }}>
          <Text style={{ color: colors.contentTextMuted, fontFamily: Fonts.body, fontSize: 14 }}>
            {error || 'No se encontró la recompensa.'}
          </Text>
        </View>
      )}

      {!loading && reward && (
        <RewardForm
          key={reward.id}
          initial={{
            title: reward.title,
            description: reward.description,
            pointsCost: reward.pointsCost,
            stock: reward.stock,
            active: reward.active,
            sponsor: reward.sponsor,
            imageURL: reward.imageURL,
          }}
          submitLabel="Guardar cambios"
          busyLabel="Guardando..."
          onCancel={() => router.push('/admin/rewards')}
          onSubmit={handleSubmit}
        />
      )}
    </AdminShell>
  );
}

export default RewardsEditScreen;
