import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

import { ReportRow, ReportStatus } from '../components/report-row';

type RecentReport = {
  id: string;
  title: string;
  status: ReportStatus;
  date: string;
};

const recentReports: RecentReport[] = [
  { id: '1042', title: 'Red de enmalle frente a Punta Brava', status: 'pendiente', date: 'Hoy, 09:40' },
  { id: '1041', title: 'Vertido industrial en estero Norte', status: 'verificado', date: 'Ayer, 18:12' },
  { id: '1040', title: 'Pesca ilegal en zona protegida', status: 'verificado', date: 'Ayer, 14:05' },
  { id: '1039', title: 'Arrastre cerca de arrecife', status: 'descartado', date: 'Ayer, 11:27' },
];

export function RecentReportsSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Reportes recientes</Text>
      <View style={styles.list}>
        {recentReports.map((report) => (
          <ReportRow key={report.id} {...report} />
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
});
