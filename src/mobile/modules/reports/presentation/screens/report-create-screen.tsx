import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { shadow } from '@/shared/utils/shadows';

import { DniStep } from '../sections/dni-step';
import { CaptureStep } from '../sections/capture-step';
import { IncidentStep, type IncidentSelection, type ReportAudio } from '../sections/incident-step';
import { LocationStep, type ReportLocation } from '../sections/location-step';
import type { CaptureMedia } from '../sections/media-preview';
import { ReportTopBar } from '../sections/report-top-bar';
import { SummaryStep } from '../sections/summary-step';
import { ReportFlowColors as C, SummaryColors as SC } from '../theme';

const TOTAL_STEPS = 5;
const STEP_PROGRESS = 20;

export function ReportCreateScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [dni, setDni] = useState('');
  const [consent, setConsent] = useState(false);
  const [media, setMedia] = useState<CaptureMedia | null>(null);
  const [location, setLocation] = useState<ReportLocation | null>(null);
  const [incident, setIncident] = useState<IncidentSelection['incident'] | null>(null);
  const [audio, setAudio] = useState<ReportAudio | null>(null);
  const [createdAt] = useState(() => new Date());

  const handleDniChange = (value: string) => {
    setDni(value.replace(/\D/g, ''));
  };

  const handleConsentToggle = () => setConsent((current) => !current);

  const canContinue = dni.length === 8 && consent;

  const handleContinue = () => {
    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  };

  const handleCancel = () => router.back();

  const handleMedia = (next: CaptureMedia) => {
    setMedia(next);
  };

  const handleConfirmLocation = (next: ReportLocation) => {
    setLocation(next);
    setStep(4);
  };

  const handleIncidentContinue = (selection: IncidentSelection) => {
    setIncident(selection.incident);
    setAudio(selection.audio);
    setStep(5);
  };

  const handleSend = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successCircle}>
          <AppSymbol
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            color={SC.accent}
            size={40}
          />
        </View>
        <Text style={styles.successTitle}>Reporte enviado</Text>
        <Text style={styles.successBody}>
          Gracias por colaborar con la vigilancia marítima. Tu reporte será revisado.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={handleCancel}
          style={({ pressed }) => [styles.successButton, pressed && styles.pressed]}>
          <Text style={styles.successButtonLabel}>Volver al inicio</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {step === 2 ? (
        <CaptureStep onClose={handleCancel} onContinue={handleContinue} onMedia={handleMedia} />
      ) : step === 3 ? (
        <LocationStep onBack={() => setStep(2)} onConfirm={handleConfirmLocation} />
      ) : step === 4 ? (
        <IncidentStep
          initialIncidentId={incident?.id}
          onBack={() => setStep(3)}
          onContinue={handleIncidentContinue}
        />
      ) : step === 5 ? (
        <SummaryStep
          photo={media}
          location={location}
          incident={incident}
          audio={audio}
          createdAt={createdAt}
          onBack={() => setStep(4)}
          onEdit={() => setStep(4)}
          onSend={handleSend}
        />
      ) : (
        <View style={styles.frame}>
          <ReportTopBar step={step} totalSteps={TOTAL_STEPS} progress={step * STEP_PROGRESS} />
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <DniStep
              dni={dni}
              onDniChange={handleDniChange}
              consent={consent}
              onConsentToggle={handleConsentToggle}
              canContinue={canContinue}
              onContinue={handleContinue}
              onCancel={handleCancel}
            />
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default ReportCreateScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: C.background,
  },
  frame: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: 430,
    backgroundColor: C.background,
    ...shadow('lift'),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  successScreen: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
    backgroundColor: SC.background,
  },
  successCircle: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SC.accentSoft,
    borderRadius: 9999,
  },
  successTitle: {
    color: SC.textStrong,
    fontFamily: Fonts.label,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.36,
    textAlign: 'center',
    includeFontPadding: false,
  },
  successBody: {
    color: SC.textBody,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
  successButton: {
    width: '100%',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: SC.primaryBtn,
    borderRadius: 12,
  },
  successButtonLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
