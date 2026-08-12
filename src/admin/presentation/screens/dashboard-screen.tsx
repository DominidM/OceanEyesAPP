import React from 'react';

import { AdminShell } from '@admin/layout/admin-shell';
import { DashboardCharts } from '../sections/dashboard/dashboard-charts/page';
import { RecentReportsSection } from '../sections/dashboard/recent-reports/page';
import { RecentAlertsSection } from '../sections/dashboard/recent-alerts/page';

export function DashboardScreen() {
  return (
    <AdminShell title="Dashboard">
      <DashboardCharts />
      <RecentAlertsSection />
      <RecentReportsSection />
    </AdminShell>
  );
}

export default DashboardScreen;
