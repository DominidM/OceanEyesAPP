import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { shadow } from '@/shared/utils/shadows';

import { LocationColors as C } from '../theme';
import { LocationMap, type Region } from './location-step-map';

export type ReportLocation = {
  placeName: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
};

type LocationStepProps = {
  onBack: () => void;
  onConfirm: (location: ReportLocation) => void;
};

export function LocationStep({ onBack, onConfirm }: LocationStepProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [recenterNonce, setRecenterNonce] = useState(0);
  const fetchedRef = useRef(false);

  const resolvePlaceName = useCallback(async (latitude: number, longitude: number) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const parts = [address?.name, address?.street, address?.city].filter(
        (part): part is string => Boolean(part),
      );
      setPlaceName(parts.length > 0 ? parts.join(', ') : null);
    } catch {
      setPlaceName(null);
    }
  }, []);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(current);
      setMapRegion({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      await resolvePlaceName(current.coords.latitude, current.coords.longitude);
    } catch {
      setError('No se pudo obtener tu ubicación');
    } finally {
      setLoading(false);
    }
  }, [resolvePlaceName]);

  useEffect(() => {
    if (permission?.granted && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchLocation();
    }
  }, [permission?.granted, fetchLocation]);

  const handleRegionChange = useCallback(
    (next: Region) => {
      setMapRegion(next);
      void resolvePlaceName(next.latitude, next.longitude);
    },
    [resolvePlaceName],
  );

  const handleManualToggle = (value: boolean) => {
    setManual(value);
    if (!value && location) {
      const { latitude, longitude } = location.coords;
      setMapRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setRecenterNonce((nonce) => nonce + 1);
      void resolvePlaceName(latitude, longitude);
    }
  };

  const coordLabel = mapRegion
    ? `Coordenadas: ${mapRegion.latitude.toFixed(4)}, ${mapRegion.longitude.toFixed(4)}`
    : loading
      ? 'Obteniendo ubicación...'
      : 'Ubicación no disponible';

  const accuracy = manual ? null : (location?.coords.accuracy ?? null);
  const accuracyLabel = manual
    ? 'Punto elegido manualmente'
    : accuracy != null
      ? `Precisión ±${Math.round(accuracy)} m`
      : 'Precisión no disponible';

  const showPermissionPanel = permission != null && !permission.granted;

  const handleConfirm = () => {
    if (!mapRegion) return;
    onConfirm({
      placeName,
      latitude: mapRegion.latitude,
      longitude: mapRegion.longitude,
      accuracy: manual ? null : (location?.coords.accuracy ?? null),
    });
  };

  return (
    <View style={styles.screen}>
      {showPermissionPanel ? (
        <View style={styles.permissionScreen}>
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Permiso de ubicación</Text>
            <Text style={styles.permissionBody}>
              OceanEyes necesita acceso a tu ubicación para confirmar el lugar del reporte.
            </Text>
            {permission.canAskAgain ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={requestPermission}
                  style={({ pressed }) => [styles.permissionPrimary, pressed && styles.pressed]}>
                  <Text style={styles.permissionPrimaryLabel}>Permitir acceso</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={onBack}
                  hitSlop={8}
                  style={styles.permissionSecondary}>
                  <Text style={styles.permissionSecondaryLabel}>Cancelar</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.permissionHint}>
                  Habilita la ubicación en los ajustes del dispositivo para continuar.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={onBack}
                  style={({ pressed }) => [styles.permissionPrimary, pressed && styles.pressed]}>
                  <Text style={styles.permissionPrimaryLabel}>Volver</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      ) : (
        <>
          <View style={styles.mapArea}>
            {mapRegion ? (
              <LocationMap
                key={recenterNonce}
                region={mapRegion}
                interactive={manual}
                onRegionChangeComplete={handleRegionChange}
              />
            ) : loading ? (
              <View style={styles.mapLoading}>
                <ActivityIndicator color={C.accent} size="large" />
              </View>
            ) : null}

            <View pointerEvents="none" style={styles.accuracy}>
              <View style={styles.accuracyCircle}>
                <AppSymbol
                  name={{ ios: 'mappin.and.ellipse', android: 'location-on', web: 'location-on' }}
                  color={C.accent}
                  size={32}
                />
              </View>
            </View>

            <View pointerEvents="none" style={[styles.coordChipWrap, { top: insets.top + 80 }]}>
              <View style={styles.coordChip}>
                <Text style={styles.coordText}>{coordLabel}</Text>
              </View>
            </View>

            {error ? (
              <View style={[styles.errorWrap, { top: insets.top + 148 }]}>
                <Pressable
                  accessibilityRole="button"
                  onPress={fetchLocation}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
                  <AppSymbol
                    name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
                    color={C.accent}
                    size={16}
                  />
                  <Text style={styles.retryLabel}>Reintentar</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              onPress={onBack}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
              <AppSymbol
                name={{ ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' }}
                color={C.textStrong}
                size={20}
              />
            </Pressable>
            <Text style={styles.headerTitle}>Confirmar ubicación</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>¿Es esta la ubicación correcta?</Text>

            <View style={styles.detail}>
              <View style={styles.detailIcon}>
                <AppSymbol
                  name={{ ios: 'mappin.and.ellipse', android: 'location-on', web: 'location-on' }}
                  color={C.accent}
                  size={20}
                />
              </View>
              <View style={styles.detailTexts}>
                <Text style={styles.detailTitle}>{placeName ?? 'Ubicación actual'}</Text>
                <View style={styles.detailRow}>
                  <AppSymbol
                    name={{ ios: 'location.fill', android: 'near-me', web: 'near-me' }}
                    color={C.accent}
                    size={10}
                  />
                  <Text style={styles.detailSub}>{accuracyLabel}</Text>
                </View>
              </View>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Ubicación manual</Text>
              <Switch
                value={manual}
                onValueChange={handleManualToggle}
                trackColor={{ false: C.toggleTrack, true: C.accent }}
                thumbColor={C.toggleThumb}
                ios_backgroundColor={C.toggleTrack}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={!mapRegion}
              onPress={handleConfirm}
              style={({ pressed }) => [
                styles.primaryButton,
                !mapRegion && styles.primaryDisabled,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.primaryLabel}>Confirmar ubicación</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => handleManualToggle(true)}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
              <Text style={styles.secondaryLabel}>Usar ubicación manual</Text>
            </Pressable>
          </View>

          <View style={[styles.offline, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            <AppSymbol
              name={{ ios: 'wifi.slash', android: 'wifi-off', web: 'wifi-off' }}
              color={C.offlineText}
              size={16}
            />
            <Text style={styles.offlineText}>
              Estás en modo sin conexión. Tu reporte se guardará y se enviará cuando haya conexión.
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: C.background,
    overflow: 'hidden',
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: C.headerBg,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: C.textStrong,
    fontFamily: Fonts.label,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.27,
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerSpacer: {
    width: 40,
  },
  accuracy: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyCircle: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accuracyFill,
    borderWidth: 2,
    borderColor: C.accuracyBorder,
    borderRadius: 9999,
  },
  coordChipWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  coordChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: C.chipBg,
    borderWidth: 1,
    borderColor: C.chipBorder,
    borderRadius: 9999,
  },
  coordText: {
    color: C.chipText,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  errorWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
  },
  retryLabel: {
    color: C.accent,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    includeFontPadding: false,
  },
  card: {
    padding: 24,
    gap: 20,
    backgroundColor: C.surface,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    ...shadow('lift'),
  },
  cardTitle: {
    color: C.textStrong,
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    includeFontPadding: false,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: C.detailBg,
    borderRadius: 48,
  },
  detailIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accentSoft,
    borderRadius: 32,
  },
  detailTexts: {
    flex: 1,
    gap: 4,
  },
  detailTitle: {
    color: C.textStrong,
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    includeFontPadding: false,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailSub: {
    color: C.textBody,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    includeFontPadding: false,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    color: C.textStrong,
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    includeFontPadding: false,
  },
  primaryButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accent,
    borderRadius: 9999,
    shadowColor: C.accentGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  primaryDisabled: {
    opacity: 0.5,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
  },
  secondaryButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.accentBorder,
    borderRadius: 9999,
  },
  secondaryLabel: {
    color: C.accent,
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
  },
  offline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 10,
    backgroundColor: C.offlineBg,
  },
  offlineText: {
    color: C.offlineText,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    flexShrink: 1,
    includeFontPadding: false,
  },
  permissionScreen: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.background,
  },
  permissionCard: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 32,
    paddingVertical: 40,
    paddingHorizontal: 28,
    backgroundColor: C.surface,
    borderRadius: 28,
  },
  permissionTitle: {
    color: C.textStrong,
    fontFamily: Fonts.headline,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'center',
    includeFontPadding: false,
  },
  permissionBody: {
    color: C.textBody,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
  permissionHint: {
    color: C.textBody,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  permissionPrimary: {
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accent,
    borderRadius: 24,
  },
  permissionPrimaryLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
  },
  permissionSecondary: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionSecondaryLabel: {
    color: C.offlineText,
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
