import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { useAdminTheme } from '@admin/theme/context';

export type DataRow = { label: string; value: string };

type ReportDataListProps = {
  rows: DataRow[];
};

export function ReportDataList({ rows }: ReportDataListProps) {
  const { colors } = useAdminTheme();

  const pairs: DataRow[][] = [];
  for (let i = 0; i < rows.length; i += 2) pairs.push(rows.slice(i, i + 2));

  return (
    <View style={styles.list}>
      {pairs.map((pair, i) => (
        <View key={i} style={[styles.pairRow, { borderBottomColor: colors.cardBorder }]}>
          {pair.map((r, idx) => (
            <React.Fragment key={r.label}>
              {idx > 0 ? (
                <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
              ) : null}
              <View style={styles.cell}>
                <Text style={[styles.label, { color: colors.contentTextMuted }]}>{r.label}</Text>
                <Text style={[styles.value, { color: colors.cardText }]}>{r.value}</Text>
              </View>
            </React.Fragment>
          ))}
          {pair.length === 1 ? <View style={styles.cell} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 0 },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  cell: { flex: 1, minWidth: 0, gap: Spacing.half },
  divider: { width: 1, alignSelf: 'stretch' },
  label: { fontFamily: Fonts.label, fontSize: 12, fontWeight: '600' },
  value: { fontFamily: Fonts.body, fontSize: 14, flexShrink: 1 },
});
