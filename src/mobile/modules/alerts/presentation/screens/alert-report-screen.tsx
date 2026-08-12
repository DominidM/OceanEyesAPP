import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {ActivityIndicator, Pressable, StyleSheet, TextInput, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { AppSymbol, type SymbolName } from '@/shared/components/app-symbol';
import { KeyboardScrollView } from '@/shared/components/keyboard-scroll-view';
import { useAuth } from '@/shared/firebase/auth-context';
import { subscribeAlertReports, submitAlertReport } from '@/shared/firebase/alerts';
import type { AlertReportType, AlertSeverity } from '@/shared/firebase/types';
import { useCurrentLocation } from '@/shared/hooks/use-current-location';

const ALERT_TYPES: { key: AlertReportType; label: string; icon: SymbolName }[] = [
  {
    key: 'retroceso_mar',
    label: 'Mar retrocedió',
    icon: { ios: 'arrow.left.circle.fill', android: 'trending-down', web: 'trending-down' },
  },
  {
    key: 'oleaje_extremo',
    label: 'Oleaje extremo',
    icon: { ios: 'water.waves', android: 'waves', web: 'waves' },
  },
  {
    key: 'contaminacion',
    label: 'Mancha oscura/contaminación',
    icon: { ios: 'drop.fill', android: 'water-drop', web: 'water-drop' },
  },
  {
    key: 'otro',
    label: 'Otro peligro',
    icon: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  },
];

const SEVERITIES: { key: AlertSeverity; label: string; color: string; bg: string }[] = [
  { key: 'info', label: 'Informativa', color: '#0891B2', bg: 'rgba(8,145,178,0.12)' },
  { key: 'warning', label: 'Precaución', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { key: 'danger', label: 'Peligro', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
];

export function AlertReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { permission, requestPermission, position, loading: locating, refetch } = useCurrentLocation();

  const [type, setType] = useState<AlertReportType>('retroceso_mar');
  const [severity, setSeverity] = useState<AlertSeverity>('warning');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const canSend = !!user && !!position && !sending;

  useEffect(() => {
    if (!submittedId) return;
    const unsub = subscribeAlertReports((reports) => {
      const mine = reports.find((r) => r.id === submittedId);
      setConfirmed(mine?.status === 'verified');
    });
    return unsub;
  }, [submittedId]);

  const send = async () => {
    setError('');
    if (!user || !position) return;
    setSending(true);
    try {
      const res = await submitAlertReport({
        userId: user.uid,
        type,
        severity,
        description: description.trim(),
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
      setSubmittedId(res.reportId);
      setConfirmed(false);
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo enviar la alerta.');
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setSubmittedId(null);
    setConfirmed(false);
    setType('retroceso_mar');
    setSeverity('warning');
    setDescription('');
  };

  if (submittedId) {
    const promoted = confirmed;
    return (
      <View style={styles.screen}>
        <View style={styles.resultBox}>
          <View style={[styles.resultCircle, { backgroundColor: promoted ? 'rgba(239,68,68,0.14)' : 'rgba(8,145,178,0.14)' }]}>
            <AppSymbol
              name={
                promoted
                  ? { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }
                  : { ios: 'clock.fill', android: 'schedule', web: 'schedule' }
              }
              color={promoted ? '#EF4444' : '#0891B2'}
              size={40}
            />
          </View>
          <AppText style={styles.resultTitle}>
            {promoted ? 'Alerta confirmada por la comunidad' : 'Reporte de alerta enviado'}
          </AppText>
          <AppText style={styles.resultBody}>
            {promoted
              ? 'Tu señal, junto a la de otros vecinos, activó una alerta oficial visible para todos en la zona.'
              : 'Cuando 3 vecinos o más confirmen la misma señal en tu zona, se activará una alerta oficial. Te avisaremos aquí mismo si ocurre.'}
          </AppText>
          <View style={styles.resultActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <AppText style={styles.primaryButtonLabel}>Volver</AppText>
            </Pressable>
            {confirmed && (
              <Pressable
                accessibilityRole="button"
                onPress={reset}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <AppText style={styles.secondaryButtonLabel}>Reportar otra señal</AppText>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
          <AppSymbol
            name={{ ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' }}
            color={BrandColors.neutral}
            size={20}
          />
        </Pressable>
        <AppText style={styles.headerTitle}>Alertar a mi zona</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.notice}>
          <AppSymbol
            name={{ ios: 'eye.fill', android: 'visibility', web: 'visibility' }}
            color={BrandColors.primary}
            size={18}
          />
          <AppText style={styles.noticeText}>
            ¿Ves una señal de peligro en el mar? Avisa a tu comunidad. Tu reporte vale por el peso de un
            pescador cuando lo confirmas a bordo.
          </AppText>
        </View>

        <View style={styles.field}>
          <AppText style={styles.label}>¿Qué señal observas?</AppText>
          <View style={styles.typeGrid}>
            {ALERT_TYPES.map((t) => {
              const selected = t.key === type;
              return (
                <Pressable
                  key={t.key}
                  accessibilityRole="button"
                  onPress={() => setType(t.key)}
                  style={({ pressed }) => [
                    styles.typeCard,
                    selected && styles.typeCardSelected,
                    pressed && styles.pressed,
                  ]}>
                  <AppSymbol
                    name={t.icon}
                    color={selected ? '#FFFFFF' : BrandColors.primary}
                    size={26}
                  />
                  <AppText style={[styles.typeLabel, selected && styles.typeLabelSelected]} numberOfLines={2}>
                    {t.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <AppText style={styles.label}>Nivel de riesgo</AppText>
          <View style={styles.severityRow}>
            {SEVERITIES.map((s) => {
              const selected = s.key === severity;
              return (
                <Pressable
                  key={s.key}
                  accessibilityRole="button"
                  onPress={() => setSeverity(s.key)}
                  style={({ pressed }) => [
                    styles.severityChip,
                    { borderColor: selected ? s.color : '#D9CFC5', backgroundColor: selected ? s.bg : 'transparent' },
                    pressed && styles.pressed,
                  ]}>
                  {selected ? (
                    <AppSymbol
                      name={{ ios: 'checkmark.circle.fill', android: 'check-circle', web: 'check-circle' }}
                      color={s.color}
                      size={14}
                    />
                  ) : null}
                  <AppText style={[styles.severityLabel, { color: selected ? s.color : 'rgba(44,44,44,0.7)' }]}>
                    {s.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <AppText style={styles.label}>Descripción (opcional)</AppText>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: el mar se retiró unos 30 metros y volvió con fuerza"
            placeholderTextColor="rgba(44,44,44,0.4)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <AppText style={styles.label}>Tu ubicación</AppText>
          {locating ? (
            <View style={styles.locationBox}>
              <ActivityIndicator color={BrandColors.primary} size="small" />
              <AppText style={styles.locationText}>Obteniendo ubicación...</AppText>
            </View>
          ) : permission && !permission.granted ? (
            <View style={styles.locationBox}>
              <AppText style={styles.locationText}>Necesitamos tu ubicación para alertar a tu zona.</AppText>
              {permission.canAskAgain ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void requestPermission()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
                  <AppText style={styles.retryButtonLabel}>Permitir ubicación</AppText>
                </Pressable>
              ) : null}
            </View>
          ) : position == null ? (
            <View style={styles.locationBox}>
              <AppText style={styles.locationText}>No pudimos obtener tu ubicación.</AppText>
              <Pressable
                accessibilityRole="button"
                onPress={() => void refetch()}
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
                <AppText style={styles.retryButtonLabel}>Reintentar</AppText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.locationBox}>
              <AppSymbol
                name={{ ios: 'location.fill', android: 'my-location', web: 'my-location' }}
                color="#22C55E"
                size={16}
              />
              <AppText style={styles.locationText}>
                {`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`}
              </AppText>
            </View>
          )}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <AppText style={styles.errorText}>{error}</AppText>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canSend}
          onPress={send}
          style={({ pressed }) => [
            styles.submitButton,
            !canSend && styles.submitButtonDisabled,
            pressed && canSend && styles.pressed,
          ]}>
          {sending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <AppText style={styles.submitButtonLabel}>
              {position ? 'Enviar señal a mi zona' : 'Selecciona tu ubicación primero'}
            </AppText>
          )}
        </Pressable>
      </KeyboardScrollView>
    </View>
  );
}

export default AlertReportScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D9CFC5',
    backgroundColor: 'rgba(239, 235, 227, 0.95)',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: -0.27,
    textAlign: 'center',
    includeFontPadding: false,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    backgroundColor: 'rgba(19, 78, 94, 0.08)',
    borderRadius: 12,
  },
  noticeText: {
    flex: 1,
    color: 'rgba(44, 44, 44, 0.82)',
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    includeFontPadding: false,
  },
  field: {
    gap: 8,
  },
  label: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    includeFontPadding: false,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    flexBasis: '47%',
    minHeight: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  typeCardSelected: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  typeLabel: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
    includeFontPadding: false,
  },
  typeLabelSelected: {
    color: '#FFFFFF',
  },
  severityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  severityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  severityLabel: {
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
  },
  input: {
    minHeight: 96,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  locationText: {
    flex: 1,
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    includeFontPadding: false,
  },
  retryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: BrandColors.primary,
  },
  retryButtonLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    includeFontPadding: false,
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    includeFontPadding: false,
  },
  submitButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: BrandColors.primary,
    borderRadius: 14,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
  resultBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  resultCircle: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  resultTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.36,
    textAlign: 'center',
    includeFontPadding: false,
  },
  resultBody: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
  resultActions: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
    includeFontPadding: false,
  },
  secondaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.primary,
  },
  secondaryButtonLabel: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
    includeFontPadding: false,
  },
});