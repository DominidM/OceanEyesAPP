import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export function useCurrentLocation() {
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [position, setPosition] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setPosition(current);
    } catch {
      setPosition(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      setLoading(false);
      return;
    }
    void refetch();
  }, [permission, refetch]);

  return { permission, requestPermission, position, loading, error, refetch };
}
