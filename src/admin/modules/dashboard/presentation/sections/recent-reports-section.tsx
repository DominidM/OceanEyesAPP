import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { firestore } from '@/shared/firebase/app';
import type { Report, ReportStatus } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/shared/theme/context';

import { ReportRow } from '../components/report-row';

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

  const mapStatus = (status: ReportStatus): 'pendiente' | 'verificado' | 'descartado' => {
    if (status === 'verificado') return 'verificado';
    if (status === 'descartado') return 'descartado';
    return 'pendiente';
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.contentText }]}>Reportes recientes</Text>
      {reports.length === 0 ? (
        <Text style={[styles.empty, { color: colors.contentTextMuted }]}>
          No hay reportes todavía. Los reportes aparecerán aquí cuando los usuarios empiecen a reportar.
        </Text>
      ) : (
        <View style={styles.list}>
          {reports.map((report) => (
            <ReportRow
              key={report.id}
              id={report.id}
              title={report.title}
              status={mapStatus(report.status)}
              date={report.createdAt?.toDate?.().toLocaleString() ?? ''}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  empty: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  list: {
    gap: Spacing.two,
  },
});
