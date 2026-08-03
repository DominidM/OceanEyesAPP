import React from 'react';

import { AdminShell } from '@admin/shared/components/admin-shell';

import { RecentReportsSection } from '../sections/recent-reports-section';
import { StatsStrip } from '../sections/stats-strip';

export function DashboardScreen() {
  return (
    <AdminShell title="Dashboard">
      <StatsStrip />
      <RecentReportsSection />
    </AdminShell>
  );
}

export default DashboardScreen;
