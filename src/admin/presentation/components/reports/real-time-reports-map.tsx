import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAdminTheme } from '@admin/theme/context';
import type { Report } from '@/shared/firebase/types';

type Props = {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  height?: number;
};

export function RealTimeReportsMap({ reports, height = 560 }: Props) {
  const { colors } = useAdminTheme();
  return (
    <View style={[styles.placeholder, { height, borderColor: colors.cardBorder }]}>
      <Text style={{ color: colors.contentTextMuted }}>
        Mapa disponible en el panel web · {reports.length} reportes
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
  },
});
