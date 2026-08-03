import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { seedAdminAndTestData, seedRewards } from '@/shared/firebase/seed';
import { AdminShell } from '@admin/shared/components/admin-shell';

import { RecentReportsSection } from '../sections/recent-reports-section';
import { StatsStrip } from '../sections/stats-strip';

export function DashboardScreen() {
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg('');
    try {
      await seedRewards();
      await seedAdminAndTestData('admin@oceaneyes.com', 'admin123');
      setSeedMsg('Datos de prueba creados. Admin: admin@oceaneyes.com / admin123');
      ;(window as any).location.reload();
    } catch (e: any) {
      setSeedMsg(e?.message ?? 'Error al crear datos.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AdminShell title="Dashboard">
      <StatsStrip />
      {!!seedMsg && <Text style={styles.msg}>{seedMsg}</Text>}
      <Pressable onPress={!seeding ? handleSeed : undefined} style={[styles.seedButton, seeding && styles.seedButtonDisabled]}>
        <Text style={styles.seedLabel}>{seeding ? 'Creando datos...' : 'Generar datos de prueba'}</Text>
      </Pressable>
      <RecentReportsSection />
    </AdminShell>
  );
}

export default DashboardScreen;

const styles = StyleSheet.create({
  seedButton: {
    alignSelf: 'flex-start',
    backgroundColor: BrandColors.secondary,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  seedButtonDisabled: {
    opacity: 0.6,
  },
  seedLabel: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
  },
  msg: {
    color: BrandColors.primary,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: BrandColors.tertiary,
    padding: Spacing.two,
    borderRadius: 8,
  },
});
