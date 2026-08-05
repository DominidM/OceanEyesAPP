import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AdminShell } from '@admin/layout/admin-shell';
import { SectionHeader } from '@admin/presentation/components/ui';

export function RedemptionsScreen() {
  return (
    <AdminShell title="Canjes" breadcrumb={[{ label: 'Canjes' }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SectionHeader
          title="Canjes"
          subtitle="Cuando un usuario canjea una recompensa, el sistema te notifica aquí para que gestiones su entrega."
        />
      </ScrollView>
    </AdminShell>
  );
}

export default RedemptionsScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: 16 },
});
