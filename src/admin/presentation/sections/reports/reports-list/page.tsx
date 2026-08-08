import {
  addDoc,
  collection,
  doc,
  limit as fireLimit,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
} from 'firebase/firestore';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { firebaseAuth, firestore } from '@/shared/firebase/app';
import { banDevice } from '@/shared/firebase/bans';
import { verifyReport } from '@/shared/firebase/reports';
import type { ReportStatus } from '@/shared/firebase/types';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { Badge, Card, EmptyState, IconButton, LoadingState, PaginationFooter, SectionHeader } from '@admin/presentation/components/ui';
import { useWallet } from '@admin/presentation/hooks/useWallet';
import { useAdminTheme } from '@admin/theme/context';
import { buildArbiscanTxUrl } from '@shared/blockchain/ledger';

type AdminReport = {
  id: string;
  title: string;
  category: string;
  status: ReportStatus;
  isAnonymous: boolean;
  userId: string;
  deviceHash?: string | null;
  txHash?: string;
  createdAt?: { toDate?: () => Date };
};

const PAGE_SIZE = 8;

const CATEGORY_LABELS: Record<string, string> = {
  pesca_ilegal: 'Pesca ilegal',
  basura_marina: 'Basura',
  variacion_mar: 'Variación del mar',
  derrame_hidrocarburos: 'Derrame de hidrocarburos',
  fauna_herida: 'Fauna herida',
  redes_fantasmas: 'Redes abandonadas',
  embarcacion_sospechosa: 'Embarcación sospechosa',
  marea_roja: 'Marea roja',
  otro: 'Otro',
};

export function ReportsList() {
  const { colors } = useAdminTheme();
  const { signer } = useWallet();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<any[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const currentPageRef = useRef(currentPage);

  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

  const hoverBg = 'rgba(148,163,184,0.08)';

  const totalPages = Math.max(1, Math.ceil(totalDocs / PAGE_SIZE));
  const start = reports.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, totalDocs);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      let q = query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'), fireLimit(PAGE_SIZE));
      if (page > 1 && pageCursors.length >= page - 1) {
        q = query(q, startAfter(pageCursors[page - 2]));
      }

      const snap = await getDocs(q);
      const docs = snap.docs.map((item) => ({ id: item.id, ...item.data() }) as AdminReport);
      setReports(docs);
      setCurrentPage(page);

      if (snap.docs.length > 0) {
        setPageCursors((prev) => {
          const next = [...prev];
          next[page - 1] = snap.docs[snap.docs.length - 1];
          return next;
        });
      } else {
        setPageCursors((prev) => prev.slice(0, page - 1));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [pageCursors]);

  const fetchTotal = useCallback(async () => {
    try {
      const snap = await getCountFromServer(collection(firestore, 'reports'));
      setTotalDocs(snap.data().count);
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchTotal();
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeStatus = async (report: AdminReport, status: Extract<ReportStatus, 'en_revision' | 'verificado' | 'descartado'>) => {
    if (verifyingId) return;
    setActionError(null);
    try {
      if (status === 'verificado') {
        setVerifyingId(report.id);
        await verifyReport(report.id, firebaseAuth?.currentUser?.uid ?? 'admin', signer ?? undefined);
      } else {
        await updateDoc(doc(firestore, 'reports', report.id), {
          status,
          reviewedBy: firebaseAuth?.currentUser?.uid,
          reviewedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await addDoc(collection(firestore, 'reports', report.id, 'statusHistory'), {
        fromStatus: report.status,
        toStatus: status,
        changedBy: firebaseAuth?.currentUser?.uid,
        createdAt: serverTimestamp(),
      });
      loadPage(currentPageRef.current);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Error al cambiar el estado del reporte.');
    } finally {
      setVerifyingId(null);
    }
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

  return (
    <View style={styles.content}>
      <SectionHeader
        title="Moderación de incidencias"
        subtitle="Revisa reportes de pesca, basura marina y variaciones del mar."
      />

      {!signer && (
        <Text style={[styles.walletHint, { color: colors.warning }]}>
          Conecta tu wallet en la parte superior para registrar los puntos on-chain.
        </Text>
      )}
      {actionError && (
        <Text style={[styles.errorText, { color: colors.danger }]}>{actionError}</Text>
      )}

      {loading && reports.length === 0 && (
        <LoadingState label="Cargando reportes..." />
      )}
      {!loading && totalDocs === 0 && (
        <EmptyState
          icon="clipboard-text-outline"
          title="Sin reportes"
          description="No hay incidencias registradas todavía. Los usuarios pueden reportar pesca ilegal, basura marina y variaciones del mar."
        />
      )}

      {totalDocs > 0 && (
        <Card style={styles.tableCard}>
          <View style={[styles.tableHead, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.th, styles.thMain, { color: colors.contentTextMuted }]}>Incidente</Text>
            <Text style={[styles.th, styles.thDate, { color: colors.contentTextMuted }]}>Fecha</Text>
            <Text style={[styles.th, styles.thCategory, { color: colors.contentTextMuted }]}>Categoría</Text>
            <Text style={[styles.th, styles.thStatus, { color: colors.contentTextMuted }]}>Estado</Text>
            <Text style={[styles.th, styles.thActions, { color: colors.contentTextMuted }]}>Detalles</Text>
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
                  onPress={() => router.push({ pathname: '/admin/reports/[id]', params: { id: report.id } })}
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
                    {report.status === 'verificado' && report.txHash && (
                      <Pressable
                        onPress={() => Linking.openURL(buildArbiscanTxUrl(report.txHash!))}
                        style={({ hovered }) => [styles.txLink, hovered && { opacity: 0.7 }]}>
                        <Text style={[styles.txLinkText, { color: colors.accent }]}>Ver tx en Arbiscan</Text>
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.cellActions}>
                    {report.status === 'pendiente' && (
                      <IconButton icon="eye-outline" label="Revisar" color={colors.contentTextMuted} onPress={() => changeStatus(report, 'en_revision')} />
                    )}
                    {(report.status === 'pendiente' || report.status === 'en_revision') && (
                      <IconButton
                        icon={verifyingId === report.id ? 'progress-clock' : 'check-circle-outline'}
                        label={verifyingId === report.id ? 'Verificando...' : 'Verificar'}
                        color={verifyingId === report.id ? colors.contentTextMuted : colors.success}
                        onPress={verifyingId ? undefined : () => changeStatus(report, 'verificado')}
                        style={verifyingId === report.id ? { opacity: 0.5 } : undefined}
                      />
                    )}
                    {(report.status === 'pendiente' || report.status === 'en_revision') && (
                      <IconButton icon="close-circle-outline" label="Rechazar" color={colors.danger} onPress={() => changeStatus(report, 'descartado')} />
                    )}
                    {report.status === 'descartado' && report.deviceHash && (
                      <IconButton icon="cancel" label="Banear dispositivo" color={colors.danger} onPress={() => handleBanDevice(report)} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <PaginationFooter
            start={start}
            end={end}
            total={totalDocs}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => loadPage(currentPage - 1)}
            onNext={() => loadPage(currentPage + 1)}
            loading={loading}
          />
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.four },
  empty: { fontFamily: Fonts.body, fontSize: 14 },
  walletHint: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '600' },
  errorText: { fontFamily: Fonts.body, fontSize: 13 },
  tableCard: { gap: 0, padding: 0, overflow: 'hidden' },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    gap: Spacing.three,
  },
  th: { fontFamily: Fonts.label, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  thMain: { flex: 1 },
  thDate: { width: 76 },
  thCategory: { width: 128 },
  thStatus: { width: 108, textAlign: 'center' },
  thActions: { width: 160, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.three,
    cursor: 'pointer',
  },
  cellMain: { flex: 1, gap: 2, minWidth: 0 },
  rowTitle: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '600' },
  rowMeta: { fontFamily: Fonts.body, fontSize: 12 },
  cellDate: { width: 76, fontFamily: Fonts.body, fontSize: 12 },
  cellCategory: { width: 128, fontFamily: Fonts.body, fontSize: 12, textTransform: 'capitalize' },
  cellStatus: { width: 108, alignItems: 'center' },
  txLink: { marginTop: Spacing.one, cursor: 'pointer' },
  txLinkText: { fontFamily: Fonts.label, fontSize: 11, fontWeight: '700' },
  cellActions: { width: 160, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.one },
});