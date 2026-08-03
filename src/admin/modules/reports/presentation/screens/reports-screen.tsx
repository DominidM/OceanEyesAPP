import {
  addDoc,
  collection,
  getDocs,
  limit as fireLimit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  doc,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { firebaseAuth, firestore } from '@/shared/firebase/app';
import type { ReportStatus } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/shared/theme/context';
import { AdminShell } from '@admin/shared/components/admin-shell';
import { Card, Badge, Button } from '@admin/shared/ui';

type AdminReport = {
  id: string;
  title: string;
  category: string;
  status: ReportStatus;
  isAnonymous: boolean;
  userId: string;
  createdAt?: { toDate?: () => Date };
};

const PAGE_SIZE = 8;

export function ReportsScreen() {
  const { colors } = useAdminTheme();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      let q = query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'), fireLimit(PAGE_SIZE));
      if (!reset && lastDoc) q = query(q, startAfter(lastDoc));

      const snap = await getDocs(q);
      const docs = snap.docs.map((item) => ({ id: item.id, ...item.data() }) as AdminReport);
      setReports(reset ? docs : [...reports, ...docs]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [lastDoc, reports]);

  useEffect(() => { loadReports(true); }, []);

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
    loadReports(true);
  };

  const statusChip = (status: ReportStatus) => {
    switch (status) {
      case 'verificado': return { label: 'Verificado', color: colors.success, bg: colors.successBg };
      case 'descartado': return { label: 'Descartado', color: colors.danger, bg: colors.dangerBg };
      case 'en_revision': return { label: 'En revisión', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
      default: return { label: 'Pendiente', color: colors.warning, bg: colors.warningBg };
    }
  };

  return (
    <AdminShell title="Reportes">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.contentText }]}>Moderación de incidencias</Text>
            <Text style={[styles.subtitle, { color: colors.contentTextMuted }]}>
              Revisa reportes de pesca, basura marina y variaciones del mar.
            </Text>
          </View>
          <Button label="Actualizar" variant="secondary" onPress={() => loadReports(true)} />
        </View>

        {loading && reports.length === 0 && (
          <Text style={[styles.empty, { color: colors.contentTextMuted }]}>Cargando reportes...</Text>
        )}
        {!loading && reports.length === 0 && (
          <Text style={[styles.empty, { color: colors.contentTextMuted }]}>No hay reportes todavía.</Text>
        )}

        <View style={styles.list}>
          {reports.map((report) => {
            const st = statusChip(report.status);
            return (
              <Card key={report.id} style={styles.row}>
                <View style={styles.rowBody}>
                  <Text style={[styles.rowTitle, { color: colors.cardText }]}>{report.title}</Text>
                  <View style={styles.rowMeta}>
                    <Badge label={st.label} color={st.color} bg={st.bg} />
                    <Text style={[styles.cat, { color: colors.contentTextMuted }]}>
                      {report.category} · {report.isAnonymous ? 'Anónimo' : 'Identificado'}
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  {report.status === 'pendiente' && (
                    <Button label="Revisar" variant="secondary" onPress={() => changeStatus(report, 'en_revision')} />
                  )}
                  {(report.status === 'pendiente' || report.status === 'en_revision') && (
                    <Button label="Verificar" variant="primary" onPress={() => changeStatus(report, 'verificado')} />
                  )}
                  {(report.status === 'pendiente' || report.status === 'en_revision') && (
                    <Button label="Rechazar" variant="danger" onPress={() => changeStatus(report, 'descartado')} />
                  )}
                </View>
              </Card>
            );
          })}
        </View>

        {hasMore && !loading && (
          <Button label="Cargar más reportes" variant="secondary" onPress={() => loadReports(false)} style={styles.more} />
        )}
      </ScrollView>
    </AdminShell>
  );
}

export default ReportsScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: Spacing.four },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.four },
  title: { fontFamily: Fonts.headline, fontSize: 20, fontWeight: '700' },
  subtitle: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 21, marginTop: 4 },
  empty: { fontFamily: Fonts.body, fontSize: 14 },
  list: { gap: Spacing.two },
  row: { gap: Spacing.three },
  rowBody: { gap: Spacing.one },
  rowTitle: { fontFamily: Fonts.label, fontSize: 16, fontWeight: '700' },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cat: { fontFamily: Fonts.body, fontSize: 13 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  more: { marginTop: Spacing.two },
});
