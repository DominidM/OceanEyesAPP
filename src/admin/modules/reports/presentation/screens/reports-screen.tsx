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

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { firebaseAuth, firestore } from '@/shared/firebase/app';
import type { ReportStatus } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/shared/theme/context';
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
  const { colors } = useAdminTheme();
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
      setError('No se pudieron cargar los reportes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  const changeStatus = async (report: AdminReport, status: Extract<ReportStatus, 'en_revision' | 'verificado' | 'descartado'>) => {
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
          <Text style={[styles.title, { color: colors.contentText }]}>Moderación de incidencias</Text>
          <Text style={[styles.subtitle, { color: colors.contentTextMuted }]}>Revisa reportes de pesca, basura marina y variaciones del mar.</Text>
        </View>
        <Pressable onPress={loadReports} style={[styles.refresh, { backgroundColor: colors.primary }]}>
          <Text style={[styles.refreshLabel, { color: colors.primaryText }]}>Actualizar</Text>
        </Pressable>
      </View>
      {loading && <Text style={[styles.muted, { color: colors.contentTextMuted }]}>Cargando reportes...</Text>}
      {!!error && <Text style={[styles.err, { color: colors.danger }]}>{error}</Text>}
      {!loading && reports.length === 0 && !error && <Text style={[styles.muted, { color: colors.contentTextMuted }]}>No hay reportes todavía.</Text>}
      <View style={styles.list}>
        {reports.map((report) => (
          <View key={report.id} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: colors.cardText }]}>{report.title}</Text>
              <Text style={[styles.cardMeta, { color: colors.contentTextMuted }]}>{report.category} · {report.isAnonymous ? 'Anónimo' : 'Identificado'}</Text>
              <Text style={[styles.cardStatus, { color: colors.primary }]}>Estado: {report.status}</Text>
            </View>
            <View style={styles.actions}>
              {report.status === 'pendiente' && (
                <Pressable onPress={() => changeStatus(report, 'en_revision')} style={[styles.secondary, { borderColor: colors.primary }]}>
                  <Text style={[styles.secondaryLabel, { color: colors.primary }]}>Revisar</Text>
                </Pressable>
              )}
              {(report.status === 'pendiente' || report.status === 'en_revision') && (
                <Pressable onPress={() => changeStatus(report, 'verificado')} style={[styles.primary, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.primaryLabel, { color: colors.primaryText }]}>Verificar</Text>
                </Pressable>
              )}
              {(report.status === 'pendiente' || report.status === 'en_revision') && (
                <Pressable onPress={() => changeStatus(report, 'descartado')} style={[styles.reject, { backgroundColor: colors.dangerBg }]}>
                  <Text style={[styles.rejectLabel, { color: colors.danger }]}>Rechazar</Text>
                </Pressable>
              )}
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
  title: { fontFamily: Fonts.headline, fontSize: 20, fontWeight: '700' },
  subtitle: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 21, marginTop: 4 },
  refresh: { borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  refreshLabel: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '700' },
  list: { gap: Spacing.two },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.four, borderWidth: 1, borderRadius: 12, padding: Spacing.four },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: Fonts.label, fontSize: 16, fontWeight: '700' },
  cardMeta: { fontFamily: Fonts.body, fontSize: 13 },
  cardStatus: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: Spacing.one },
  primary: { borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  primaryLabel: { fontFamily: Fonts.label, fontSize: 12, fontWeight: '700' },
  secondary: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  secondaryLabel: { fontFamily: Fonts.label, fontSize: 12, fontWeight: '700' },
  reject: { borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  rejectLabel: { fontFamily: Fonts.label, fontSize: 12, fontWeight: '700' },
  muted: { fontFamily: Fonts.body },
  err: { fontFamily: Fonts.body, fontSize: 14 },
});
