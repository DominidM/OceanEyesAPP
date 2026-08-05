import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAdminTheme } from '@admin/theme/context';

type ReportMapProps = {
  latitude: number;
  longitude: number;
  title?: string;
  height?: number;
};

export function ReportMap({ latitude, longitude, height = 320 }: ReportMapProps) {
  const { colors } = useAdminTheme();
  return (
    <View style={[styles.placeholder, { height, borderColor: colors.cardBorder, backgroundColor: colors.appBg }]}>
      <Text style={[styles.coords, { color: colors.contentTextMuted }]}>
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coords: { fontFamily: 'monospace', fontSize: 13 },
});
