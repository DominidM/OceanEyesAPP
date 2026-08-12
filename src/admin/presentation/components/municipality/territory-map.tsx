import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polygon, type MapPressEvent } from 'react-native-maps';

import { useAdminTheme } from '@admin/theme/context';
import type { GeoBounds } from '@/shared/firebase/types';

type TerritoryMapProps = {
  bounds?: GeoBounds;
  onChange: (bounds: GeoBounds) => void;
  height?: number;
};

type Corner = { latitude: number; longitude: number };

export function TerritoryMap({ bounds, onChange, height = 360 }: TerritoryMapProps) {
  const { colors } = useAdminTheme();
  const [firstCorner, setFirstCorner] = useState<Corner | null>(null);
  const center = bounds
    ? { latitude: (bounds.south + bounds.north) / 2, longitude: (bounds.west + bounds.east) / 2 }
    : { latitude: -12.1211, longitude: -77.0297 };

  const selectCorner = (event: MapPressEvent) => {
    const corner = event.nativeEvent.coordinate;
    if (!firstCorner) {
      setFirstCorner(corner);
      return;
    }
    onChange({
      south: Math.min(firstCorner.latitude, corner.latitude),
      west: Math.min(firstCorner.longitude, corner.longitude),
      north: Math.max(firstCorner.latitude, corner.latitude),
      east: Math.max(firstCorner.longitude, corner.longitude),
    });
    setFirstCorner(null);
  };

  const polygon = bounds ? [
    { latitude: bounds.south, longitude: bounds.west },
    { latitude: bounds.north, longitude: bounds.west },
    { latitude: bounds.north, longitude: bounds.east },
    { latitude: bounds.south, longitude: bounds.east },
  ] : [];

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.hint, { color: colors.contentTextMuted }]}>
        {firstCorner ? 'Ahora toca la esquina opuesta.' : 'Toca dos esquinas opuestas para marcar el territorio.'}
      </Text>
      <MapView
        style={{ height, width: '100%' }}
        initialRegion={{ ...center, latitudeDelta: bounds ? Math.max(bounds.north - bounds.south, 0.02) * 1.5 : 0.12, longitudeDelta: bounds ? Math.max(bounds.east - bounds.west, 0.02) * 1.5 : 0.12 }}
        onPress={selectCorner}
      >
        {firstCorner && <Marker coordinate={firstCorner} />}
        {bounds && <Polygon coordinates={polygon} fillColor="rgba(13,148,136,0.22)" strokeColor="#0D9488" strokeWidth={3} />}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', gap: 8 },
  hint: { fontSize: 13 },
});
