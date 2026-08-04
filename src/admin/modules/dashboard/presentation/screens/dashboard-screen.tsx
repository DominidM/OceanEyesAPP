import React from 'react';

import { AdminShell } from '@admin/shared/components/admin-shell';

import { DashboardCharts } from '../sections/dashboard-charts';
import { RecentReportsSection } from '../sections/recent-reports-section';

export function DashboardScreen() {
  return (
    <AdminShell title="Dashboard">
      <DashboardCharts />
      <RecentReportsSection />
    </AdminShell>
  );
}

export default DashboardScreen;
