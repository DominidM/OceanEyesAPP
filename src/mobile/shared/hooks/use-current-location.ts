import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

const LOCATION_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Tiempo de espera de ubicación agotado.')), ms);
    }),
  ]);
}

export function useCurrentLocation() {
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [position, setPosition] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const current = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        LOCATION_TIMEOUT_MS,
      );
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
