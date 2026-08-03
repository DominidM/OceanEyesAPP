import React from 'react';
import { StyleSheet, View } from 'react-native';

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type LocationMapProps = {
  region: Region;
};

export function LocationMap({ region }: LocationMapProps) {
  return (
    <View
      style={styles.map}
      accessibilityLabel={`Mapa en ${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}`}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E5E7EB',
  },
});
