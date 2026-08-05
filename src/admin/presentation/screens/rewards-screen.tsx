import React from 'react';

import { AdminShell } from '@admin/layout/admin-shell';
import { RewardsList } from '../sections/rewards/rewards-list/page';

export function RewardsScreen() {
  return (
    <AdminShell title="Recompensas" breadcrumb={[{ label: 'Recompensas' }]}>
      <RewardsList />
    </AdminShell>
  );
}

export default RewardsScreen;