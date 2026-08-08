import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const mobileMockup = 'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786166249/mobile-inicio_aeyivo.jpg';

const steps = [
  {
    id: 1,
    icon: 'eye',
    title: '1. Observa',
    description:
      'Identificá actividad marina sospechosa: pesca ilegal, contaminación o residuos desde tu embarcación o zona costera.',
  },
  {
    id: 2,
    icon: 'camera',
    title: '2. Documenta',
    description:
      'Capturá fotos y video con la app. Ubicación GPS y timestamp se registran automáticamente para validación oficial.',
  },
  {
    id: 3,
    icon: 'paper-plane',
    title: '3. Envia',
    description:
      'Tu reporte anonimizado se integra a dashboards institucionales y genera alertas en tiempo real para fiscalías.',
  },
];

export function ReportesSection() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={[styles.section, isMobile && styles.sectionMobile]}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <Text style={[styles.title, isMobile && styles.titleMobile]}>¿Cómo Reportar?</Text>
        <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
          Tres pasos simples para enviar tu reporte y generar acción.
        </Text>
      </View>

      <View style={styles.phoneWrap}>
        <View style={[styles.phone, isMobile && styles.phoneMobile]}>
          <View style={styles.phoneBezel}>
            <Image source={mobileMockup} style={styles.phoneImage} contentFit="cover" />
          </View>
        </View>
      </View>

      <View style={[styles.steps, isMobile && styles.stepsMobile]}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {index > 0 && !isMobile && <View style={styles.divider} />}
            <View style={[styles.step, isMobile && styles.stepMobile]}>
              <View style={[styles.circle, isMobile && styles.circleMobile]}>
                <FontAwesome5 name={step.icon} size={isMobile ? 24 : 28} color={BrandColors.primary} />
              </View>
              <Text style={[styles.stepTitle, isMobile && styles.stepTitleMobile]}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.five,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
  },
  sectionMobile: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  headerMobile: {
    marginBottom: Spacing.five,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    color: BrandColors.primary,
    fontWeight: '700',
    marginBottom: Spacing.three,
    fontStyle: 'italic',
  },
  titleMobile: {
    fontSize: 30,
  },
  subtitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: BrandColors.neutral,
    opacity: 0.72,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  subtitleMobile: {
    fontSize: 16,
    lineHeight: 24,
  },
  phoneWrap: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  phone: {
    width: 280,
    height: 560,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderWidth: 8,
    borderColor: BrandColors.tertiary,
    padding: 0,
  },
  phoneMobile: {
    width: 220,
    height: 440,
  },
  phoneBezel: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    borderRadius: 30,
    padding: 8,
    overflow: 'hidden',
  },
  phoneImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  steps: {
    flexDirection: 'row',
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  stepsMobile: {
    flexDirection: 'column',
    gap: Spacing.five,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  stepMobile: {
    paddingHorizontal: 0,
  },
  divider: {
    width: 1,
    marginHorizontal: Spacing.four,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(152,185,177,0.25)',
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: BrandColors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  circleMobile: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: Spacing.three,
  },
  stepTitle: {
    fontFamily: Fonts.headline,
    fontSize: 22,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
    marginBottom: Spacing.two,
    textAlign: 'center',
  },
  stepTitleMobile: {
    fontSize: 20,
  },
  stepDescription: {
    fontSize: 15,
    color: BrandColors.neutral,
    opacity: 0.72,
    lineHeight: 23,
    fontFamily: Fonts.body,
    textAlign: 'center',
    maxWidth: 280,
  },
});
