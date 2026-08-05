import { router } from 'expo-router';
import React from 'react';

import { AdminShell } from '@admin/layout/admin-shell';
import { RewardForm, type RewardFormValues } from '@admin/presentation/components/rewards/reward-form';
import { SectionHeader } from '@admin/presentation/components/ui';
import { createReward } from '@/shared/firebase/rewards';

export function RewardsNewScreen() {
  const handleSubmit = async (values: RewardFormValues) => {
    await createReward({
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
    <AdminShell title="Nueva recompensa" breadcrumb={[{ label: 'Recompensas', href: '/admin/rewards' }, { label: 'Nueva' }]}>
      <SectionHeader
        title="Crear recompensa"
        subtitle="Registra una nueva recompensa que los usuarios puedan canjear."
      />
      <RewardForm
        submitLabel="Crear recompensa"
        busyLabel="Creando..."
        onCancel={() => router.push('/admin/rewards')}
        onSubmit={handleSubmit}
      />
    </AdminShell>
  );
}

export default RewardsNewScreen;
