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
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { firebaseAuth, firestore } from '@/shared/firebase/app';
import { banDevice } from '@/shared/firebase/bans';
import type { ReportStatus } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';
import { Card, Badge, Button } from '@admin/presentation/components/ui';

type AdminReport = {
  id: string;
  title: string;
  category: string;
  status: ReportStatus;
  isAnonymous: boolean;
  userId: string;
  deviceHash?: string | null;
  createdAt?: { toDate?: () => Date };
};

const PAGE_SIZE = 8;

const CATEGORY_LABELS: Record<string, string> = {
  pesca_ilegal: 'Pesca ilegal',
  basura_marina: 'Basura',
  variacion_mar: 'Variación del mar',
};

export function ReportsList() {
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

  const handleBanDevice = async (report: AdminReport) => {
    if (!report.deviceHash) return;
    await banDevice(report.deviceHash, {
      reason: `Reporte falso/descartado: ${report.id}`,
      bannedBy: firebaseAuth?.currentUser?.uid,
    });
  };

  const statusChip = (status: ReportStatus) => {
    switch (status) {
      case 'verificado': return { label: 'Verificado', color: colors.success, bg: colors.successBg };
      case 'descartado': return { label: 'Descartado', color: colors.danger, bg: colors.dangerBg };
      case 'en_revision': return { label: 'En revisión', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
      default: return { label: 'Pendiente', color: colors.warning, bg: colors.warningBg };
    }
  };

  const hoverBg = 'rgba(148,163,184,0.08)';

  return (
    <View style={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
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

      <Card style={styles.tableCard}>
        <View style={[styles.tableHead, { borderBottomColor: colors.cardBorder }]}>
          <Text style={[styles.th, styles.thMain, { color: colors.contentTextMuted }]}>Incidente</Text>
          <Text style={[styles.th, styles.thDate, { color: colors.contentTextMuted }]}>Fecha</Text>
          <Text style={[styles.th, styles.thCategory, { color: colors.contentTextMuted }]}>Categoría</Text>
          <Text style={[styles.th, styles.thStatus, { color: colors.contentTextMuted }]}>Estado</Text>
          <Text style={[styles.th, styles.thActions, { color: colors.contentTextMuted }]}>Acciones</Text>
        </View>

        <View>
          {reports.map((report) => {
            const st = statusChip(report.status);
            const dateStr = report.createdAt?.toDate?.()
              ? report.createdAt.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
              : '—';
            return (
              <Pressable
                key={report.id}
                style={({ hovered }) => [
                  styles.row,
                  { borderBottomColor: colors.cardBorder },
                  hovered && { backgroundColor: hoverBg },
                ]}
              >
                <View style={styles.cellMain}>
                  <Text style={[styles.rowTitle, { color: colors.cardText }]} numberOfLines={1}>
                    {report.title}
                  </Text>
                  <Text style={[styles.rowMeta, { color: colors.contentTextMuted }]}>
                    #{report.id.slice(0, 6)} · {report.isAnonymous ? 'Anónimo' : 'Identificado'}
                  </Text>
                </View>
                <Text style={[styles.cellDate, { color: colors.contentTextMuted }]}>{dateStr}</Text>
                <Text style={[styles.cellCategory, { color: colors.contentTextMuted }]} numberOfLines={1}>
                  {CATEGORY_LABELS[report.category] ?? report.category}
                </Text>
                <View style={styles.cellStatus}>
                  <Badge label={st.label} color={st.color} bg={st.bg} />
                </View>
                <View style={styles.cellActions}>
                  {report.status === 'pendiente' && (
                    <Button label="Revisar" variant="secondary" onPress={() => changeStatus(report, 'en_revision')} />
                  )}
                  {(report.status === 'pendiente' || report.status === 'en_revision') && (
                    <Button label="Verificar" variant="primary" onPress={() => changeStatus(report, 'verificado')} />
                  )}
                  {(report.status === 'pendiente' || report.status === 'en_revision') && (
                    <Button label="Rechazar" variant="danger" onPress={() => changeStatus(report, 'descartado')} />
                  )}
                  {report.status === 'descartado' && report.deviceHash && (
                    <Button label="Banear dispositivo" variant="danger" onPress={() => handleBanDevice(report)} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {hasMore && !loading && (
        <Button label="Cargar más reportes" variant="secondary" onPress={() => loadReports(false)} style={styles.more} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.four },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.four },
  headerText: { flex: 1, gap: Spacing.one },
  title: { fontFamily: Fonts.headline, fontSize: 20, fontWeight: '700' },
  subtitle: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 21 },
  empty: { fontFamily: Fonts.body, fontSize: 14 },
  tableCard: { gap: 0, padding: 0, overflow: 'hidden' },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  th: { fontFamily: Fonts.label, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  thMain: { flex: 1 },
  thDate: { width: 76 },
  thCategory: { width: 128 },
  thStatus: { width: 108, textAlign: 'right' },
  thActions: { width: 260, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.three,
    cursor: 'auto',
  },
  cellMain: { flex: 1, gap: 2, minWidth: 0 },
  rowTitle: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '600' },
  rowMeta: { fontFamily: Fonts.body, fontSize: 12 },
  cellDate: { width: 76, fontFamily: Fonts.body, fontSize: 12 },
  cellCategory: { width: 128, fontFamily: Fonts.body, fontSize: 12, textTransform: 'capitalize' },
  cellStatus: { width: 108, alignItems: 'flex-end' },
  cellActions: { width: 260, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: Spacing.one },
  more: { alignSelf: 'flex-start' },
});