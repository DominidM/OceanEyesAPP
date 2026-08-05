import React from 'react';

import { AdminShell } from '@admin/layout/admin-shell';
import { UsersList } from '../sections/users/users-list/page';

export function UsersScreen() {
  return (
    <AdminShell title="Usuarios">
      <UsersList />
    </AdminShell>
  );
}

export default UsersScreen;
