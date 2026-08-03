import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { firestore } from '@/shared/firebase/app';
import { useAdminTheme } from '@admin/shared/theme/context';

import { StatCard } from '../components/stat-card';

export function StatsStrip() {
  const { colors } = useAdminTheme();
  const [total, setTotal] = useState<number | null>(null);
  const [verificados, setVerificados] = useState<number | null>(null);
  const [pendientes, setPendientes] = useState<number | null>(null);
  const [usuarios, setUsuarios] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const [totalSnap, vSnap, pSnap, uSnap] = await Promise.all([
        getDocs(query(collection(firestore, 'reports'))),
        getDocs(query(collection(firestore, 'reports'), where('status', '==', 'verificado'))),
        getDocs(query(collection(firestore, 'reports'), where('status', 'in', ['pendiente', 'en_revision']))),
        getDocs(query(collection(firestore, 'users'), where('status', '==', 'active'))),
      ]);
      setTotal(totalSnap.size);
      setVerificados(vSnap.size);
      setPendientes(pSnap.size);
      setUsuarios(uSnap.size);
    };
    load().catch(() => {});
  }, []);

  const stats = [
    { label: 'Reportes totales', value: String(total ?? '...'), accent: colors.primary },
    { label: 'Verificados', value: String(verificados ?? '...'), accent: colors.success },
    { label: 'Pendientes', value: String(pendientes ?? '...'), accent: colors.warning },
    { label: 'Usuarios activos', value: String(usuarios ?? '...'), accent: colors.contentText },
  ];

  return (
    <View style={styles.strip}>
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} accent={stat.accent} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
});
