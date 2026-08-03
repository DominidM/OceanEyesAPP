import { Image } from 'expo-image';
import { useNetworkState } from 'expo-network';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol, type SymbolName } from '@/shared/components/app-symbol';

import { getIncidentType } from '../incident-types';
import { SummaryColors as C } from '../theme';
import type { CaptureMedia } from './media-preview';
import type { ReportLocation } from './location-step';
import type { ReportAudio, IncidentSelection } from './incident-step';

type SummaryStepProps = {
  photo: CaptureMedia | null;
  location: ReportLocation | null;
  incident: IncidentSelection['incident'] | null;
  audio: ReportAudio | null;
  createdAt: Date;
  onBack: () => void;
  onEdit: () => void;
  onSend: () => void;
  sending?: boolean;
  sendError?: string;
};

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const LEGAL_NOTE =
  'NOTA LEGAL: LA INFORMACIÓN PROPORCIONADA ES CONFIDENCIAL. LA FALSIFICACIÓN DE REPORTES PUEDE SER SANCIONADA SEGÚN LA NORMATIVA VIGENTE DE VIGILANCIA MARÍTIMA.';

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${meridiem}`;
}

function formatDuration(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(
    totalSeconds % 60,
  ).padStart(2, '0')}`;
}

export function SummaryStep({ photo, location, incident, audio, createdAt, onBack, onEdit, onSend, sending = false, sendError = '' }: SummaryStepProps) {
  const insets = useSafeAreaInsets();
  const [verified, setVerified] = useState(false);
  const network = useNetworkState();
  const online = network.isConnected === true && network.isInternetReachable !== false;

  const incidentType = incident ? getIncidentType(incident.id) : undefined;
  const incidentIcon: SymbolName =
    incidentType?.icon ?? { ios: 'drop.fill', android: 'water-drop', web: 'water-drop' };

  const locationValue = location?.placeName
    ? location.placeName
    : location?.latitude != null
      ? `${location.latitude.toFixed(4)}, ${location.longitude?.toFixed(4) ?? ''}`
      : 'No confirmada';

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={onBack}
          style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
          <AppSymbol
            name={{ ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' }}
            color={C.headerIcon}
            size={20}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Resumen del Reporte</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressLabels}>
          <Text style={styles.stepLabel}>Paso 5 de 5</Text>
          <Text style={styles.percentLabel}>100%</Text>
        </View>
        <View style={styles.track}>
          <View style={styles.fill} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.mediaArea}>
            {photo ? (
              <>
                <Image source={{ uri: photo.uri }} style={styles.media} contentFit="cover" />
                <View pointerEvents="none" style={styles.mediaOverlay} />
              </>
            ) : (
              <View style={[styles.mediaFallback, styles.mediaOverlay]}>
                <AppSymbol
                  name={{ ios: 'photo', android: 'photo', web: 'photo' }}
                  color={C.accent}
                  size={40}
                />
              </View>
            )}
            <View style={styles.mediaButton}>
              <AppSymbol
                name={
                  photo?.type === 'video'
                    ? { ios: 'play.fill', android: 'play-arrow', web: 'play-arrow' }
                    : { ios: 'photo.fill', android: 'photo', web: 'photo' }
                }
                color={C.accent}
                size={30}
              />
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Resumen del Reporte</Text>
              <Text style={styles.cardSubtitle}>Revisa los detalles antes de enviar</Text>
            </View>

            <View style={[styles.connectivityBadge, !online && styles.connectivityBadgeOffline]}>
              <AppSymbol
                name={
                  online
                    ? { ios: 'wifi', android: 'wifi', web: 'wifi' }
                    : { ios: 'wifi.slash', android: 'wifi-off', web: 'wifi-off' }
                }
                color={C.accent}
                size={16}
              />
              <Text style={styles.connectivityText}>
                {online
                  ? 'En línea — listo para enviar'
                  : 'Sin conexión — se guardará y se enviará al reconectar'}
              </Text>
            </View>

            <View style={styles.items}>
              <SummaryItem
                icon={{ ios: 'mappin.and.ellipse', android: 'location-on', web: 'location-on' }}
                label="Ubicación"
                value={locationValue}
              />
              <SummaryItem
                icon={{ ios: 'calendar', android: 'calendar-today', web: 'calendar-today' }}
                label={null}
                value={formatDate(createdAt)}
                valueOnly
              />
              <SummaryItem icon={incidentIcon} label="Incidente" value={incident?.label ?? 'Sin definir'} />
              <SummaryItem
                icon={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
                label={null}
                value={
                  audio ? `Audio grabado (${formatDuration(audio.durationMillis)})` : 'Sin audio grabado'
                }
                valueOnly
              />
            </View>
          </View>
        </View>

        <View style={styles.verification}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: verified }}
            onPress={() => setVerified((current) => !current)}
            style={styles.verifyRow}>
            <View style={[styles.checkbox, verified && styles.checkboxChecked]}>
              {verified ? (
                <AppSymbol
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  color={C.checkboxCheck}
                  size={12}
                />
              ) : null}
            </View>
            <Text style={styles.verifyLabel}>Confirmo que la información proporcionada es verídica</Text>
          </Pressable>
          <Text style={styles.legalNote}>{LEGAL_NOTE}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {!!sendError && <Text style={styles.sendError}>{sendError}</Text>}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !verified }}
          disabled={!verified || sending}
          onPress={onSend}
          style={({ pressed }) => [styles.primaryButton, !verified && styles.primaryDisabled, pressed && styles.pressed]}>
          <Text style={styles.primaryLabel}>{sending ? 'Enviando reporte...' : 'Enviar reporte'}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onEdit}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryLabel}>Editar antes de enviar</Text>
        </Pressable>

        <View style={styles.termsRow}>
          <AppSymbol
            name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
            color={C.termsText}
            size={9}
          />
          <Text style={styles.termsText}>Al enviar aceptas nuestros términos y condiciones</Text>
        </View>
      </View>
    </View>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  valueOnly = false,
}: {
  icon: SymbolName;
  label: string | null;
  value: string;
  valueOnly?: boolean;
}) {
  return (
    <View style={styles.item}>
      <View style={styles.itemIcon}>
        <AppSymbol name={icon} color={C.accent} size={20} />
      </View>
      {valueOnly ? (
        <Text style={styles.itemValue} numberOfLines={2}>
          {value}
        </Text>
      ) : (
        <View style={styles.itemTexts}>
          <Text style={styles.itemLabel}>{label}</Text>
          <Text style={styles.itemValue} numberOfLines={2}>
            {value}
          </Text>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: C.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: C.headerBorder,
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
  progressBlock: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: C.headerBg,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepLabel: {
    color: C.textStrong,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    includeFontPadding: false,
  },
  percentLabel: {
    color: C.accent,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    includeFontPadding: false,
  },
  track: {
    width: '100%',
    height: 8,
    backgroundColor: C.progressTrack,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: 8,
    backgroundColor: C.progressFill,
    borderRadius: 9999,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  mediaArea: {
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.mediaOverlay,
  },
  mediaFallback: {
    backgroundColor: C.mediaFallback,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaButton: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.mediaButtonBg,
    borderRadius: 9999,
    shadowColor: C.mediaButtonShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 6,
  },
  cardBody: {
    gap: 16,
    padding: 20,
  },
  cardHeader: {
    gap: 4,
  },
  cardTitle: {
    color: C.textStrong,
    fontFamily: Fonts.label,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
  cardSubtitle: {
    color: C.textBody,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
  },
  connectivityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accentBorder,
    borderRadius: 8,
  },
  connectivityBadgeOffline: {
    backgroundColor: C.accentSoft,
  },
  connectivityText: {
    flex: 1,
    color: C.accent,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    includeFontPadding: false,
  },
  items: {
    gap: 16,
    paddingTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accentSoft,
    borderRadius: 8,
  },
  itemTexts: {
    flex: 1,
    justifyContent: 'center',
    gap: 0,
  },
  itemLabel: {
    color: C.textStrong,
    fontFamily: Fonts.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    includeFontPadding: false,
  },
  itemValue: {
    flex: 1,
    color: C.textStrong,
    fontFamily: Fonts.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    includeFontPadding: false,
  },
  verification: {
    gap: 16,
    paddingHorizontal: 4,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: C.checkboxBorder,
    borderRadius: 4,
  },
  checkboxChecked: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  verifyLabel: {
    flex: 1,
    color: C.textStrong,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    includeFontPadding: false,
  },
  legalNote: {
    color: C.legalText,
    fontFamily: Fonts.body,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  footer: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: C.footerBg,
    borderTopWidth: 1,
    borderTopColor: C.footerBorder,
  },
  primaryButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primaryBtn,
    borderRadius: 12,
    shadowColor: C.primaryBtnShadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 6,
  },
  primaryDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    includeFontPadding: false,
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.secondaryBorder,
    borderRadius: 12,
  },
  secondaryLabel: {
    color: C.secondaryText,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: 0.7,
  },
  termsText: {
    color: C.textStrong,
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 15,
    textAlign: 'center',
    includeFontPadding: false,
  },
  sendError: {
    color: '#B42318',
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
});
