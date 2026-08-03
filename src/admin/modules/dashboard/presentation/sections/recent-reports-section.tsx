import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { firestore } from '@/shared/firebase/app';
import type { Report, ReportStatus } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/shared/theme/context';
import { SectionTitle, Badge } from '@admin/shared/ui';

export function RecentReportsSection() {
  const { colors } = useAdminTheme();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(
        query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'), limit(10)),
      );
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Report));
    };
    load().catch(() => {});
  }, []);

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
});
