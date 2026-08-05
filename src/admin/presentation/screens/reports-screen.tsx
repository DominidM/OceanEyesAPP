import React from 'react';

import { AdminShell } from '@admin/layout/admin-shell';
import { ReportsList } from '../sections/reports/reports-list/page';

export function ReportsScreen() {
  return (
    <AdminShell title="Reportes">
      <ReportsList />
    </AdminShell>
  );
}

export default ReportsScreen;
