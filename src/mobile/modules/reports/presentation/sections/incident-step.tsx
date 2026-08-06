import * as Audio from 'expo-audio';
import React, { useState } from 'react';
import {Pressable, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { formatDuration } from '@/shared/utils/format-duration';

import {
  CUSTOM_INCIDENT_ICONS,
  CUSTOM_INCIDENT_ICON_KEYS,
  getIncidentType,
  INCIDENT_TYPES,
  isCustomIconKey,
  type CustomIconKey,
} from '../incident-types';
import { IncidentColors as C } from '../theme';

export type ReportAudio = {
  uri: string;
  durationMillis: number;
};

import type { ReportCategory } from '@/shared/firebase/types';

export type IncidentSelection = {
  incident: { id: ReportCategory; label: string; iconKey?: string };
  audio: ReportAudio | null;
};

type IncidentStepProps = {
  initial?: IncidentSelection['incident'] | null;
  onBack: () => void;
  onContinue: (selection: IncidentSelection) => void;
};

const CUSTOM_INCIDENT_MAX_LENGTH = 60;

export function IncidentStep({ initial, onBack, onContinue }: IncidentStepProps) {
  const insets = useSafeAreaInsets();
  const initialId = initial?.id && getIncidentType(initial.id) ? initial.id : INCIDENT_TYPES[0].id;
  const [selectedId, setSelectedId] = useState<ReportCategory>(initialId);
  const [customText, setCustomText] = useState(initial?.id === 'otro' ? initial.label : '');
  const [customIconKey, setCustomIconKey] = useState<CustomIconKey | null>(
    initial?.iconKey && isCustomIconKey(initial.iconKey) ? initial.iconKey : 'warning',
  );
  const [micDenied, setMicDenied] = useState(false);

  const recorder = Audio.useAudioRecorder(Audio.RecordingPresets.HIGH_QUALITY);
  const recorderState = Audio.useAudioRecorderState(recorder);

  const stopRecordingIfActive = () => {
    if (recorderState.isRecording) {
      recorder.stop();
    }
  };

  const handleRecordPress = async () => {
    if (recorderState.isRecording) {
      await recorder.stop();
      return;
    }
    const status = await Audio.requestRecordingPermissionsAsync();
    if (!status.granted) {
      setMicDenied(true);
      return;
    }
    setMicDenied(false);
    await Audio.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const handleBack = () => {
    stopRecordingIfActive();
    onBack();
  };

  const handleContinue = async () => {
    if (recorderState.isRecording) {
      await recorder.stop();
    }
    const incident = getIncidentType(selectedId) ?? INCIDENT_TYPES[0];
    const isCustom = selectedId === 'otro';
    onContinue({
      incident: {
        id: incident.id,
        label: isCustom ? customText.trim() : incident.label,
        iconKey: isCustom ? customIconKey ?? 'warning' : undefined,
      },
      audio: recorder.uri ? { uri: recorder.uri, durationMillis: recorderState.durationMillis } : null,
    });
  };

  const canContinue = selectedId !== 'otro' || customText.trim().length > 0;

  const timerLabel = formatDuration(recorderState.durationMillis);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={handleBack}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
            <AppSymbol
              name={{ ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' }}
              color={C.textStrong}
              size={20}
            />
          </Pressable>
          <AppText style={styles.headerTitle}>Selecciona el incidente</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressBlock}>
          <AppText style={styles.stepLabel}>Paso 4 de 5</AppText>
          <View style={styles.track}>
            <View style={styles.fill} />
          </View>
        </View>

        <View style={styles.grid}>
          {INCIDENT_TYPES.map((incident) => {
            const selected = incident.id === selectedId;
            return (
              <Pressable
                key={incident.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSelectedId(incident.id)}
                style={({ pressed }) => [
                  styles.card,
                  selected && styles.cardSelected,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.cardIcon}>
                  <AppSymbol name={incident.icon} color={selected ? C.accent : C.textStrong} size={34} />
                </View>
                <AppText style={[styles.cardLabel, selected && styles.cardLabelSelected]}>
                  {incident.label}
                </AppText>
                {selected ? (
                  <View style={styles.badge}>
                    <AppSymbol
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      color={C.badgeCheck}
                      size={12}
                    />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {selectedId === 'otro' ? (
          <View style={styles.customCard}>
            <AppText style={styles.customTitle}>Describe el incidente</AppText>
            <TextInput
              value={customText}
              onChangeText={setCustomText}
              maxLength={CUSTOM_INCIDENT_MAX_LENGTH}
              placeholder="Escribe el incidente"
              placeholderTextColor={C.textBody}
              style={styles.customInput}
            />
            <AppText style={styles.customHint}>Elige un ícono que lo represente mejor</AppText>
            <View style={styles.iconGrid}>
              {CUSTOM_INCIDENT_ICON_KEYS.map((key) => {
                const selectedIcon = key === customIconKey;
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedIcon }}
                    onPress={() => setCustomIconKey(key)}
                    style={({ pressed }) => [
                      styles.iconOption,
                      selectedIcon && styles.iconOptionSelected,
                      pressed && styles.pressed,
                    ]}>
                    <AppSymbol
                      name={CUSTOM_INCIDENT_ICONS[key]}
                      color={selectedIcon ? C.accent : C.textStrong}
                      size={24}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.audioCard}>
          <View style={styles.audioRow}>
            <View style={styles.audioIcon}>
              <AppSymbol
                name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
                color={C.accent}
                size={20}
              />
            </View>
            <View style={styles.audioTexts}>
              <AppText style={styles.audioTitle}>Grabar audio</AppText>
              <AppText style={styles.audioSubtitle}>Graba un audio describiendo el incidente</AppText>
            </View>
          </View>

          <View style={styles.audioControls}>
            <AppText style={styles.timer}>{timerLabel}</AppText>
            <Pressable
              accessibilityRole="button"
              onPress={handleRecordPress}
              style={({ pressed }) => [styles.recordButton, pressed && styles.pressed]}>
              <AppText style={styles.recordButtonLabel}>
                {recorderState.isRecording ? 'Detener' : 'Grabar'}
              </AppText>
            </Pressable>
          </View>

          {micDenied ? (
            <AppText style={styles.micDenied}>Sin permiso de micrófono. Habilítalo en los ajustes.</AppText>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.ctaArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
          disabled={!canContinue}
          onPress={handleContinue}
          style={({ pressed }) => [styles.cta, !canContinue && styles.ctaDisabled, pressed && styles.pressed]}>
          <AppText style={styles.ctaLabel}>Continuar</AppText>
        </Pressable>
      </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
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
    paddingBottom: 16,
  },
  stepLabel: {
    color: C.textStrong,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'right',
    includeFontPadding: false,
  },
  track: {
    width: '100%',
    height: 10,
    backgroundColor: C.progressTrack,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    width: '80%',
    height: 10,
    backgroundColor: C.progressFill,
    borderRadius: 9999,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    width: '48%',
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: C.cardBg,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: C.accent,
  },
  cardIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    color: C.textStrong,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  cardLabelSelected: {
    color: C.accent,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.badgeBg,
    borderRadius: 9999,
  },
  customCard: {
    marginTop: 12,
    gap: 12,
    padding: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
  },
  customTitle: {
    color: C.textStrong,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  customInput: {
    height: 48,
    paddingHorizontal: 14,
    color: C.textStrong,
    fontFamily: Fonts.body,
    fontSize: 14,
    backgroundColor: C.cardBg,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 8,
  },
  customHint: {
    color: C.textBody,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 16,
    includeFontPadding: false,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.cardBg,
    borderWidth: 2,
    borderColor: C.cardBorder,
    borderRadius: 9999,
  },
  iconOptionSelected: {
    borderColor: C.accent,
  },
  audioCard: {
    marginTop: 16,
    gap: 16,
    padding: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 12,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accentSoft,
    borderRadius: 9999,
  },
  audioTexts: {
    flex: 1,
    gap: 4,
  },
  audioTitle: {
    color: C.textStrong,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  audioSubtitle: {
    color: C.textBody,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 16,
    includeFontPadding: false,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: 12,
    backgroundColor: C.cardBg,
    borderRadius: 8,
  },
  timer: {
    color: C.timerText,
    fontFamily: Fonts.body,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    includeFontPadding: false,
  },
  recordButton: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: C.recordButton,
    borderRadius: 8,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  recordButtonLabel: {
    color: C.recordButtonText,
    fontFamily: Fonts.label,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    includeFontPadding: false,
  },
  micDenied: {
    color: C.textBody,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 16,
    includeFontPadding: false,
  },
  ctaArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: C.background,
  },
  cta: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accent,
    borderRadius: 12,
    shadowColor: C.ctaShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    textAlign: 'center',
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
