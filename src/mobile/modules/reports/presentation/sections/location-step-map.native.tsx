import React from 'react';
import { StyleSheet } from 'react-native';
import MapView from 'react-native-maps';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type LocationMapProps = {
  region: Region;
  interactive?: boolean;
  onRegionChangeComplete?: (region: Region) => void;
};

export function LocationMap({ region, interactive = false, onRegionChangeComplete }: LocationMapProps) {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={region}
      rotateEnabled={false}
      pitchEnabled={false}
      showsCompass={false}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      onRegionChangeComplete={interactive ? onRegionChangeComplete : undefined}
    />
  );
}
