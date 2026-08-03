import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { firestore } from '@/shared/firebase/app';
import type { Report, ReportStatus } from '@/shared/firebase/types';

import { ReportRow } from '../components/report-row';

export function RecentReportsSection() {
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

  if (reports.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>Reportes recientes</Text>
        <Text style={styles.empty}>No hay reportes todavía. Los reportes aparecerán aquí cuando los usuarios empiecen a reportar.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Reportes recientes</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  title: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  list: {
    gap: Spacing.two,
  },
  empty: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 21,
  },
});
