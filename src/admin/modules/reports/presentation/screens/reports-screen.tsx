import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { firebaseAuth, firestore } from '@/shared/firebase/app';
import type { ReportStatus } from '@/shared/firebase/types';

import { AdminShell } from '@admin/shared/components/admin-shell';

type AdminReport = {
  id: string;
  title: string;
  category: string;
  status: ReportStatus;
  isAnonymous: boolean;
  userId: string;
  createdAt?: { toDate?: () => Date };
};

export function ReportsScreen() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const snapshot = await getDocs(query(collection(firestore, 'reports'), orderBy('createdAt', 'desc')));
      setReports(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as AdminReport));
    } catch {
      setError('No se pudieron cargar los reportes. Verifica que tu usuario tenga permisos de admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const changeStatus = async (report: AdminReport, status: Extract<ReportStatus, 'in_review' | 'verified' | 'rejected'>) => {
    await updateDoc(doc(firestore, 'reports', report.id), {
      status,
      reviewedBy: firebaseAuth?.currentUser?.uid,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await addDoc(collection(firestore, 'reports', report.id, 'statusHistory'), {
      fromStatus: report.status,
      toStatus: status,
      changedBy: firebaseAuth?.currentUser?.uid,
      createdAt: serverTimestamp(),
    });
    await loadReports();
  };

  return (
    <AdminShell title="Reportes">
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Moderación de incidencias</Text>
          <Text style={styles.subtitle}>Revisa reportes de pesca, desmontes y otras incidencias ambientales.</Text>
        </View>
        <Pressable onPress={loadReports} style={styles.refresh}><Text style={styles.refreshLabel}>Actualizar</Text></Pressable>
      </View>
      {loading && <Text style={styles.muted}>Cargando reportes...</Text>}
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!loading && reports.length === 0 && !error && <Text style={styles.muted}>No hay reportes todavía.</Text>}
      <View style={styles.list}>
        {reports.map((report) => (
          <View key={report.id} style={styles.card}>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{report.title}</Text>
              <Text style={styles.cardMeta}>{report.category} · {report.isAnonymous ? 'Denunciante anónimo' : 'Identidad disponible'}</Text>
              <Text style={styles.cardStatus}>Estado: {report.status}</Text>
            </View>
            <View style={styles.actions}>
              {report.status === 'pending' && <Pressable onPress={() => changeStatus(report, 'in_review')} style={styles.secondary}><Text style={styles.secondaryLabel}>Revisar</Text></Pressable>}
              {(report.status === 'pending' || report.status === 'in_review') && <Pressable onPress={() => changeStatus(report, 'verified')} style={styles.primary}><Text style={styles.primaryLabel}>Verificar</Text></Pressable>}
              {(report.status === 'pending' || report.status === 'in_review') && <Pressable onPress={() => changeStatus(report, 'rejected')} style={styles.reject}><Text style={styles.rejectLabel}>Rechazar</Text></Pressable>}
            </View>
          </View>
        ))}
      </View>
    </AdminShell>
  );
}

export default ReportsScreen;

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.four },
  title: { color: BrandColors.neutral, fontFamily: Fonts.headline, fontSize: 20, fontWeight: '700' },
  subtitle: { color: BrandColors.neutral, fontFamily: Fonts.body, fontSize: 14, lineHeight: 21, opacity: 0.72, marginTop: 4 },
  refresh: { backgroundColor: BrandColors.primary, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  refreshLabel: { color: BrandColors.tertiary, fontFamily: Fonts.label, fontSize: 13, fontWeight: '700' },
  list: { gap: Spacing.two },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.four, borderWidth: 1, borderColor: 'rgba(19, 78, 94, 0.12)', borderRadius: 12, padding: Spacing.four },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { color: BrandColors.neutral, fontFamily: Fonts.label, fontSize: 16, fontWeight: '700' },
  cardMeta: { color: BrandColors.neutral, fontFamily: Fonts.body, fontSize: 13, opacity: 0.7 },
  cardStatus: { color: BrandColors.primary, fontFamily: Fonts.body, fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: Spacing.one },
  primary: { backgroundColor: BrandColors.primary, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  primaryLabel: { color: BrandColors.tertiary, fontFamily: Fonts.label, fontSize: 12, fontWeight: '700' },
  secondary: { borderWidth: 1, borderColor: BrandColors.primary, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  secondaryLabel: { color: BrandColors.primary, fontFamily: Fonts.label, fontSize: 12, fontWeight: '700' },
  reject: { backgroundColor: '#FDECEC', borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  rejectLabel: { color: '#B42318', fontFamily: Fonts.label, fontSize: 12, fontWeight: '700' },
  muted: { color: BrandColors.neutral, fontFamily: Fonts.body, opacity: 0.65 },
  error: { color: '#B42318', fontFamily: Fonts.body, fontSize: 14 },
});
