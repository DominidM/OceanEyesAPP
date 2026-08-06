import { useRouter } from 'expo-router';
// import { Redirect } from 'expo-router'; // TODO: reactivar cuando Firebase esté configurado y se requiera forzar login
import React, { useEffect, useState } from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { useAuth } from '@/shared/firebase/auth-context';
import { useGuestStatus } from '@/shared/hooks/use-guest-status';
import { shadow } from '@/shared/utils/shadows';

import { useReportSubmission } from '../hooks/use-report-submission';
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
  const { user, profile, loading } = useAuth();
  const isGuest = useGuestStatus();
  const { submit, sending, sendError, queued, submitted } = useReportSubmission();
  const [step, setStep] = useState(1);
  const [dni, setDni] = useState('');
  const [consent, setConsent] = useState(false);
  const [anonymous, setAnonymous] = useState(true);
  const [media, setMedia] = useState<CaptureMedia | null>(null);
  const [location, setLocation] = useState<ReportLocation | null>(null);
  const [incident, setIncident] = useState<IncidentSelection['incident'] | null>(null);
  const [audio, setAudio] = useState<ReportAudio | null>(null);
  const [createdAt] = useState(() => new Date());

  const profileDni = profile?.dni && /^\d{8}$/.test(profile.dni) ? profile.dni : '';
  const hasDni = Boolean(profileDni);

  useEffect(() => {
    if (hasDni && dni !== profileDni) setDni(profileDni);
  }, [hasDni, profileDni, dni]);

  useEffect(() => {
    if (isGuest && !anonymous) setAnonymous(true);
  }, [isGuest, anonymous]);

  const handleDniChange = (value: string) => {
    setDni(value.replace(/\D/g, ''));
  };

  const handleConsentToggle = () => setConsent((current) => !current);

  const canContinue = consent && (anonymous || dni.length === 8);

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
    if (!incident || sending) return;
    void submit(
      {
        category: incident.id,
        title: incident.label,
        isAnonymous: anonymous,
        location:
          location?.latitude != null && location.longitude != null
            ? { latitude: location.latitude, longitude: location.longitude, address: location.placeName ?? undefined }
            : undefined,
        customIcon: incident.iconKey,
      },
      media ? [{ uri: media.uri, kind: media.type }] : [],
    );
  };

  if (loading) return null;
  // if (!user) return <Redirect href="/mobile/login" />;
  // TODO: reactivar el guard cuando Firebase Auth esté configurado y se quiera forzar login.

  if (submitted) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successCircle}>
          <AppSymbol
            name={
              queued
                ? { ios: 'cloud.fill', android: 'cloud', web: 'cloud' }
                : { ios: 'checkmark', android: 'check', web: 'check' }
            }
            color={SC.accent}
            size={40}
          />
        </View>
        <AppText style={styles.successTitle}>
          {queued ? 'Reporte guardado' : 'Reporte enviado'}
        </AppText>
        <AppText style={styles.successBody}>
          {queued
            ? !user
              ? 'Tu reporte quedó guardado en el dispositivo. Inicia sesión para poder enviarlo.'
              : 'Tu reporte se guardó en el dispositivo y se enviará automáticamente cuando sea posible.'
            : 'Gracias por colaborar con la vigilancia marítima. Tu reporte será revisado.'}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={handleCancel}
          style={({ pressed }) => [styles.successButton, pressed && styles.pressed]}>
          <AppText style={styles.successButtonLabel}>Volver al inicio</AppText>
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
          initial={incident}
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
          sending={sending}
          sendError={sendError}
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
              hasDni={hasDni}
              guest={isGuest}
              consent={consent}
              onConsentToggle={handleConsentToggle}
              anonymous={anonymous}
              onAnonymousToggle={() => setAnonymous((value) => !value)}
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
