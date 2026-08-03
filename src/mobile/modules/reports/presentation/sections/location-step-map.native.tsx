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
};

export function LocationMap({ region }: LocationMapProps) {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={region}
      rotateEnabled={false}
      pitchEnabled={false}
      showsCompass={false}
    />
  );
}
