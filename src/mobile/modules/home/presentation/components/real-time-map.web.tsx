import React from 'react';
import { StyleSheet, View } from 'react-native';

type MapReport = {
  id: string;
  latitude: number;
  longitude: number;
};

type RealTimeMapProps = {
  reports: MapReport[];
};

export function RealTimeMap({ reports }: RealTimeMapProps) {
  return (
    <View
      style={styles.map}
      accessibilityLabel={`${reports.length} reportes en el mapa`}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E5E7EB',
  },
});
