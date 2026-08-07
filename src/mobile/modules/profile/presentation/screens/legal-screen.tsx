import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';

const backIcon: SymbolName = { ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' };

type LegalSection = { heading: string; paragraphs: string[] };

type LegalContent = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

const LEGAL_CONTENT: Record<'terms' | 'privacy', LegalContent> = {
  terms: {
    title: 'Términos y condiciones',
    intro:
      'Estos Términos y condiciones regulan el uso de la aplicación OceanEyes. Al acceder o utilizar la aplicación aceptas, de forma íntegra y sin reservas, los términos descritos a continuación. Si no estás de acuerdo con ellos, te solicitamos que no utilices la aplicación.',
    sections: [
      {
        heading: '1. Aceptación de los términos',
        paragraphs: [
          'Al crear una cuenta, descargar la aplicación o hacer uso de cualquiera de sus funcionalidades, aceptas quedar vinculado por estos Términos y condiciones, así como por nuestra Política de privacidad, la cual forma parte integral de este documento.',
          'Si utilizas la aplicación en nombre de una organización, declaras contar con la autoridad necesaria para aceptar estos términos en su nombre.',
        ],
      },
      {
        heading: '2. Uso permitido de la aplicación',
        paragraphs: [
          'OceanEyes es una plataforma comunitaria orientada a la vigilancia y denuncia ciudadana de pesca ilegal, basura marina y variaciones del mar. Te comprometes a utilizar la aplicación únicamente para estos fines legítimos.',
          'Queda prohibido utilizar la aplicación para actividades ilícitas, para vulnerar derechos de terceros, para acceder sin autorización a sistemas ajenos o para intentar alterar, descompilar o explotar el software de la aplicación con fines distintos a los previstos.',
        ],
      },
      {
        heading: '3. Reportes y contenido de la comunidad',
        paragraphs: [
          'Al enviar un reporte declaras, bajo tu responsabilidad, que la información proporcionada es veraz, precisa y no viola derechos de terceros. Los reportes son revisados por la comunidad y por el equipo de moderación antes de ser publicados.',
          'OceanEyes puede eliminar, ocultar o rechazar cualquier reporte que considere falso, duplicado, ofensivo o que no cumpla con los estándares de la comunidad.',
        ],
      },
      {
        heading: '4. Puntos y recompensas',
        paragraphs: [
          'Los reportes verificados pueden otorgar puntos de recompensa. La acumulación y el canje de estos puntos se sujetarán a las reglas publicadas en la aplicación, las cuales OceanEyes puede modificar en cualquier momento.',
          'El envío deliberado de información falsa, la creación de cuentas múltiples o cualquier práctica abusiva para acumular puntos dará lugar a la cancelación de los puntos obtenidos y a la suspensión o eliminación de la cuenta.',
        ],
      },
      {
        heading: '5. Cuenta, seguridad y datos',
        paragraphs: [
          'Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de todas las actividades realizadas con tu cuenta. Debes notificar a OceanEyes cualquier uso no autorizado.',
          'Te comprometes a proporcionar información veraz y actualizada al registrar tu cuenta. OceanEyes podrá solicitar documentación adicional para verificar tu identidad en caso de detectar actividad sospechosa.',
        ],
      },
      {
        heading: '6. Conducta prohibida',
        paragraphs: [
          'No está permitido usar la aplicación para acosar, difamar, intimidar o publicar contenido que vulnere la privacidad de terceros. Tampoco está permitido el envío de correo no solicitado (spam), la difusión de malware o la publicación de contenido ilegal.',
          'Queda prohibida la suplantación de identidad, el uso de cuentas de terceros sin autorización y cualquier conducta que interfiera con el correcto funcionamiento de la plataforma.',
        ],
      },
      {
        heading: '7. Suspensión y terminación',
        paragraphs: [
          'OceanEyes puede suspender temporal o definitivamente, y sin previo aviso, las cuentas que incumplan estos términos, que infrinjan la ley o que pongan en riesgo la seguridad de la comunidad.',
          'Podrás solicitar la eliminación de tu cuenta en cualquier momento. La terminación de la cuenta no te exime de las obligaciones contraídas con anterioridad a dicha terminación.',
        ],
      },
      {
        heading: '8. Propiedad intelectual',
        paragraphs: [
          'La aplicación, su diseño, logotipos, marcas, textos y demás elementos son propiedad de OceanEyes o de sus licenciantes y están protegidos por las leyes de propiedad intelectual aplicables.',
          'No se concede ningún derecho de uso, reproducción, distribución o explotación de estos contenidos salvo autorización expresa por escrito.',
        ],
      },
      {
        heading: '9. Limitación de responsabilidad',
        paragraphs: [
          'OceanEyes se ofrece "tal cual" y no garantiza la disponibilidad ininterrumpida del servicio, la exactitud de los reportes ni la idoneidad de la aplicación para un fin particular.',
          'OceanEyes no será responsable por daños directos, indirectos o consecuentes derivados del uso o la imposibilidad de uso de la aplicación, incluyendo la pérdida de datos o de puntos de recompensa.',
        ],
      },
      {
        heading: '10. Modificaciones de los términos',
        paragraphs: [
          'OceanEyes podrá actualizar estos Términos y condiciones en cualquier momento. Los cambios entrarán en vigor desde su publicación en la aplicación.',
          'El uso continuado de la aplicación después de la publicación de los cambios implicará la aceptación de los nuevos términos.',
        ],
      },
      {
        heading: '11. Ley aplicable y contacto',
        paragraphs: [
          'Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia será sometida a la jurisdicción de los tribunales competentes de Lima.',
          'Para consultas sobre estos términos puedes escribirnos a soporte@oceaneys.app.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Política de privacidad',
    intro:
      'En OceanEyes nos comprometemos a proteger la privacidad de nuestros usuarios. Esta Política de privacidad explica qué información recopilamos, cómo la usamos y los derechos que tienes sobre tus datos personales.',
    sections: [
      {
        heading: '1. Datos que recopilamos',
        paragraphs: [
          'Recopilamos tu nombre, correo electrónico y, si los proporcionas, teléfono y DNI, para gestionar tu cuenta y tus recompensas. También almacenamos los datos de tus reportes, incluidas fotos, ubicación y descripción.',
          'Podemos recopilar información técnica de uso, como el dispositivo, el sistema operativo y las fechas de acceso, con la finalidad de mejorar la experiencia.',
        ],
      },
      {
        heading: '2. Uso de tus datos',
        paragraphs: [
          'Tus datos se utilizan para gestionar tu cuenta, procesar reportes, otorgar y canjear recompensas, así como para la moderación y verificación del contenido publicado.',
          'La información de tus reportes se usa únicamente para los fines de la plataforma y nunca con fines publicitarios.',
        ],
      },
      {
        heading: '3. Almacenamiento y seguridad',
        paragraphs: [
          'Tus datos se almacenan de forma segura mediante medidas técnicas y organizativas adecuadas para prevenir su pérdida, uso indebido o acceso no autorizado.',
          'Los datos se conservan durante el tiempo que resulte necesario para cumplir las finalidades descritas y para atender obligaciones legales.',
        ],
      },
      {
        heading: '4. Derechos del usuario',
        paragraphs: [
          'Puedes solicitar el acceso, la rectificación o la eliminación de tus datos personales en cualquier momento escribiéndonos a soporte@oceaneys.app.',
          'También puedes oponerte al tratamiento de tus datos o solicitar su portabilidad en los casos previstos por la normativa aplicable.',
        ],
      },
      {
        heading: '5. Compartir información con terceros',
        paragraphs: [
          'No vendemos ni compartimos tus datos personales con terceros con fines publicitarios.',
          'Podemos compartir información con proveedores de servicios que nos ayudan a operar la plataforma, siempre bajo acuerdos de confidencialidad y únicamente para los fines descritos en esta política.',
        ],
      },
      {
        heading: '6. Cambios en la política',
        paragraphs: [
          'Podemos actualizar esta Política de privacidad periódicamente. Los cambios serán notificados mediante su publicación en la aplicación.',
          'Si los cambios son relevantes, te lo comunicaremos a través del correo registrado o de un aviso dentro de la aplicación.',
        ],
      },
    ],
  },
};

export function LegalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { page } = useLocalSearchParams<{ page?: string }>();
  const content = LEGAL_CONTENT[page === 'privacy' ? 'privacy' : 'terms'];

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <AppSymbol name={backIcon} color={BrandColors.primary} size={22} />
        </Pressable>
        <AppText style={styles.topBarTitle}>{content.title}</AppText>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
        <AppText style={styles.intro}>{content.intro}</AppText>
        {content.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <AppText style={styles.heading}>{section.heading}</AppText>
            {section.paragraphs.map((paragraph, index) => (
              <AppText key={index} style={styles.paragraph}>
                {paragraph}
              </AppText>
            ))}
          </View>
        ))}
        <AppText style={styles.updated}>Última actualización: agosto 2026</AppText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.tertiary,
  },
  scroll: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D9CFC5',
    backgroundColor: 'rgba(239, 235, 227, 0.95)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  topBarSpacer: {
    width: 40,
  },
  intro: {
    color: 'rgba(44, 44, 44, 0.7)',
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: Spacing.four,
    includeFontPadding: false,
  },
  section: {
    marginBottom: Spacing.four,
  },
  heading: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: Spacing.two,
    includeFontPadding: false,
  },
  paragraph: {
    color: 'rgba(44, 44, 44, 0.8)',
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 23,
    marginBottom: Spacing.two,
    includeFontPadding: false,
  },
  updated: {
    color: 'rgba(44, 44, 44, 0.45)',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
