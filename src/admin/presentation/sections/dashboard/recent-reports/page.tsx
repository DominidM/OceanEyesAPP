import { collection, getDocs, limit as fireLimit, orderBy, query, startAfter } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { firestore } from '@/shared/firebase/app';
import type { Report, ReportStatus } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';
import { Card, Badge } from '@admin/presentation/components/ui';

const PAGE_SIZE = 6;

export function RecentReportsSection() {
  const { colors } = useAdminTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (reset = false) => {
    try {
      let q = query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'), fireLimit(PAGE_SIZE));
      if (!reset && lastDoc) q = query(q, startAfter(lastDoc));

      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Report);
      setReports(reset ? docs : [...reports, ...docs]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch {
    }
  }, [lastDoc, reports]);

  useEffect(() => { load(true); }, []);

  const mapStatus = (status: ReportStatus) => {
    switch (status) {
      case 'verificado': return { label: 'Verificado', color: colors.success, bg: colors.successBg };
      case 'descartado': return { label: 'Descartado', color: colors.danger, bg: colors.dangerBg };
      case 'en_revision': return { label: 'En revisión', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
      default: return { label: 'Pendiente', color: colors.warning, bg: colors.warningBg };
    }
  };

  return (
    <Card style={styles.tableCard}>
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.cardText }]}>Últimos reportes</Text>
        <Pressable onPress={() => router.push('/admin/reports')}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todos →</Text>
        </Pressable>
      </View>

      <View style={[styles.tableHead, { borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.th, styles.thFlex, { color: colors.contentTextMuted }]}>Incidente</Text>
        <Text style={[styles.th, styles.thDate, { color: colors.contentTextMuted }]}>Fecha</Text>
        <Text style={[styles.th, styles.thStatus, { color: colors.contentTextMuted }]}>Estado</Text>
      </View>

      {reports.length === 0 ? (
        <Text style={[styles.empty, { color: colors.contentTextMuted }]}>No hay reportes todavía.</Text>
      ) : (
        <View>
          {reports.map((report) => {
            const st = mapStatus(report.status);
            const dateStr = report.createdAt?.toDate?.()
              ? report.createdAt.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
              : '—';
            return (
              <View
                key={report.id}
                style={[styles.row, { borderBottomColor: colors.cardBorder }]}
              >
                <View style={styles.cellFlex}>
                  <Text style={[styles.rowTitle, { color: colors.cardText }]} numberOfLines={1}>
                    {report.title}
                  </Text>
                  <Text style={[styles.rowMeta, { color: colors.contentTextMuted }]}>
                    #{report.id.slice(0, 6)} · {report.category}
                  </Text>
                </View>
                <Text style={[styles.cellDate, { color: colors.contentTextMuted }]}>{dateStr}</Text>
                <View style={styles.cellStatus}>
                  <Badge label={st.label} color={st.color} bg={st.bg} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {hasMore && (
        <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
          <Pressable onPress={() => load()} style={styles.loadMore}>
            <Text style={[styles.loadMoreLabel, { color: colors.primary }]}>Cargar más</Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  tableCard: { gap: 0, padding: 0, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  headerTitle: { fontFamily: Fonts.headline, fontSize: 15, fontWeight: '700' },
  seeAll: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '600', cursor: 'pointer' },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  th: { fontFamily: Fonts.label, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  thFlex: { flex: 1 },
  thDate: { width: 84 },
  thStatus: { width: 110, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.three,
  },
  cellFlex: { flex: 1, gap: 2, minWidth: 0 },
  rowTitle: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '600' },
  rowMeta: { fontFamily: Fonts.body, fontSize: 12, textTransform: 'capitalize' },
  cellDate: { width: 84, fontFamily: Fonts.body, fontSize: 12 },
  cellStatus: { width: 110, alignItems: 'flex-end' },
  empty: { fontFamily: Fonts.body, fontSize: 14, padding: Spacing.four },
  footer: {
    alignItems: 'center',
    padding: Spacing.three,
    borderTopWidth: 1,
  },
  loadMore: { cursor: 'pointer' },
  loadMoreLabel: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '700' },
});