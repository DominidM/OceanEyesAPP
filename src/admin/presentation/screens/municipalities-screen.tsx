import React from 'react';

import { AdminShell } from '@admin/layout/admin-shell';
import { MunicipalitiesList } from '@admin/presentation/sections/municipalities/municipalities-list/page';

export function MunicipalitiesScreen() {
  return (
    <AdminShell title="Municipalidades" breadcrumb={[{ label: 'Municipalidades' }]}>
      <MunicipalitiesList />
    </AdminShell>
  );
}

export default MunicipalitiesScreen;
