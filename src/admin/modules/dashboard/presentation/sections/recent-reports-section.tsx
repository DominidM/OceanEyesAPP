import { collection, getDocs, limit as fireLimit, orderBy, query, startAfter } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { firestore } from '@/shared/firebase/app';
import type { Report, ReportStatus } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/shared/theme/context';
import { SectionTitle, Badge } from '@admin/shared/ui';

const PAGE_SIZE = 5;

export function RecentReportsSection() {
  const { colors } = useAdminTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (reset = false) => {
    let q = query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'), fireLimit(PAGE_SIZE));
    if (!reset && lastDoc) q = query(q, startAfter(lastDoc));

    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Report);
    setReports(reset ? docs : [...reports, ...docs]);
    setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
    setHasMore(snap.docs.length === PAGE_SIZE);
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
    <View style={styles.section}>
      <SectionTitle>Reportes recientes</SectionTitle>
      {reports.length === 0 ? (
        <Text style={[styles.empty, { color: colors.contentTextMuted }]}>
          No hay reportes todavía.
        </Text>
      ) : (
        <View style={styles.list}>
          {reports.map((report) => {
            const st = mapStatus(report.status);
            return (
              <View
                key={report.id}
                style={[styles.row, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              >
                <View style={styles.rowMain}>
                  <Text style={[styles.rowTitle, { color: colors.cardText }]}>{report.title}</Text>
                  <Text style={[styles.rowMeta, { color: colors.contentTextMuted }]}>
                    #{report.id.slice(0, 6)} · {report.createdAt?.toDate?.().toLocaleString() ?? ''}
                  </Text>
                </View>
                <Badge label={st.label} color={st.color} bg={st.bg} />
              </View>
            );
          })}
        </View>
      )}
      {(hasMore || reports.length > 0) && (
        <View style={styles.actions}>
          {hasMore && (
            <Pressable onPress={() => load()} style={[styles.link, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.linkLabel, { color: colors.primary }]}>Cargar más</Text>
            </Pressable>
          )}
          <Pressable onPress={() => router.push('/admin/reports')} style={[styles.link, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.linkLabel, { color: colors.primary }]}>Ver todos →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.three },
  empty: { fontFamily: Fonts.body, fontSize: 14 },
  list: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  rowMain: { flex: 1, gap: Spacing.one },
  rowTitle: { fontFamily: Fonts.body, fontSize: 15, fontWeight: '600' },
  rowMeta: { fontFamily: Fonts.body, fontSize: 13 },
  actions: { flexDirection: 'row', gap: Spacing.three },
  link: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, cursor: 'pointer' },
  linkLabel: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '700' },
});
