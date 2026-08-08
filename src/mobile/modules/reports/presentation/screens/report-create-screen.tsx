import { useRouter } from 'expo-router';
// import { Redirect } from 'expo-router'; // TODO: reactivar cuando Firebase esté configurado y se requiera forzar login
import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { useAuth } from '@/shared/firebase/auth-context';
import { useGuestStatus } from '@/shared/hooks/use-guest-status';
import { useBan } from '@/shared/identity/ban-context';
import { useConnectivity } from '@/shared/offline/connectivity-context';
import { useDb } from '@/shared/hooks/use-db';
import { useViewModel } from '@/shared/viewmodels/use-view-model';
import { shadow } from '@/shared/utils/shadows';

import { ReportCreateViewModel, TOTAL_STEPS } from '../viewmodels/report-create.viewmodel';
import { DniStep } from '../sections/dni-step';
import { CaptureStep } from '../sections/capture-step';
import { IncidentStep } from '../sections/incident-step';
import { LocationStep } from '../sections/location-step';
import { ReportTopBar } from '../sections/report-top-bar';
import { SummaryStep } from '../sections/summary-step';
import { ReportFlowColors as C, SummaryColors as SC } from '../theme';

export function ReportCreateScreen() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const isGuest = useGuestStatus();
  const { verdict } = useBan();
  const { online } = useConnectivity();
  const db = useDb('reports');

  const [vm, state] = useViewModel(
    () => new ReportCreateViewModel({ db, online, verdict, profile, user, isGuest, onExit: () => router.back() }),
    { db, online, verdict, profile, user, isGuest, onExit: () => router.back() },
  );

  if (loading) return null;
  // if (!user) return <Redirect href="/mobile/login" />;
  // TODO: reactivar el guard cuando Firebase Auth esté configurado y se quiera forzar login.

  if (state.submitted) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successCircle}>
          <AppSymbol
            name={
              state.queued
                ? { ios: 'cloud.fill', android: 'cloud', web: 'cloud' }
                : { ios: 'checkmark', android: 'check', web: 'check' }
            }
            color={SC.accent}
            size={40}
          />
        </View>
        <AppText style={styles.successTitle}>
          {state.queued ? 'Reporte guardado' : 'Reporte enviado'}
        </AppText>
        <AppText style={styles.successBody}>
          {state.queued
            ? !user
              ? 'Tu reporte quedó guardado en el dispositivo. Inicia sesión para poder enviarlo.'
              : 'Tu reporte se guardó en el dispositivo y se enviará automáticamente cuando sea posible.'
            : 'Gracias por colaborar con la vigilancia marítima. Tu reporte será revisado.'}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={vm.exit}
          style={({ pressed }) => [styles.successButton, pressed && styles.pressed]}>
          <AppText style={styles.successButtonLabel}>Volver al inicio</AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {state.step === 2 ? (
        <CaptureStep onClose={vm.exit} onContinue={vm.next} onMedia={vm.setMedia} />
      ) : state.step === 3 ? (
        <LocationStep onBack={vm.back} onConfirm={vm.confirmLocation} />
      ) : state.step === 4 ? (
        <IncidentStep
          initial={state.incident}
          onBack={vm.back}
          onContinue={vm.continueIncident}
        />
      ) : state.step === 5 ? (
        <SummaryStep
          photo={state.media}
          location={state.location}
          incident={state.incident}
          audio={state.audio}
          createdAt={state.createdAt}
          onBack={vm.back}
          onEdit={vm.back}
          onSend={() => void vm.send()}
          sending={state.sending}
          sendError={state.sendError}
        />
      ) : (
        <View style={styles.frame}>
          <ReportTopBar step={state.step} totalSteps={TOTAL_STEPS} progress={vm.progress} />
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <DniStep
              dni={state.dni}
              onDniChange={vm.setDni}
              hasDni={vm.hasDni}
              guest={isGuest}
              consent={state.consent}
              onConsentToggle={vm.toggleConsent}
              anonymous={state.anonymous}
              onAnonymousToggle={vm.toggleAnonymous}
              canContinue={vm.canContinue}
              onContinue={vm.next}
              onCancel={vm.exit}
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
  mediaNote: {
    color: SC.textBody,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    opacity: 0.8,
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
