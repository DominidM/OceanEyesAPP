import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

function FAQItem({ question, answer, isOpen, onToggle, compact }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  const animation = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  const toggle = () => {
    Animated.timing(animation, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    onToggle();
  };

  const rotateChevron = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Pressable
      style={[styles.faqItem, isOpen && styles.faqItemOpen, compact && styles.faqItemCompact]}
      onPress={toggle}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, isOpen && styles.faqQuestionOpen, compact && styles.faqQuestionCompact]}>
          {question}
        </Text>
        <Animated.View style={{ transform: [{ rotate: rotateChevron }] }}>
          <FontAwesome5
            name="chevron-down"
            size={14}
            color={isOpen ? BrandColors.primary : BrandColors.secondary}
          />
        </Animated.View>
      </View>
      <Animated.View style={{ overflow: 'hidden', maxHeight, opacity }}>
        <Text style={styles.faqAnswer}>{answer}</Text>
      </Animated.View>
    </Pressable>
  );
}

const faqs = [
  {
    question: '¿Qué es Ocean Eyes?',
    answer:
      'Ocean Eyes es una app móvil diseñada para que pescadores y ciudadanos reporten actividades de pesca ilegal, contaminación y residuos marinos en tiempo real. Los reportes se integran a dashboards institucionales para generar acciones de fiscalización y conservación.',
  },
  {
    question: '¿Cómo funciona el sistema de reportes?',
    answer:
      'Simplemente observá, documentá con foto o video desde la app, y enviá. La ubicación GPS y timestamp se registran automáticamente. Tus datos se anonimizan y se integran a sistemas de monitoreo para respuesta de autoridades.',
  },
  {
    question: '¿Mi identidad está protegida?',
    answer:
      'Sí. Todos los reportes son anónimos por defecto. Solo usamos DNI para validación interna y nunca se comparte con terceros. Tu seguridad es nuestra prioridad.',
  },
  {
    question: '¿En qué zonas está disponible?',
    answer:
      'Ocean Eyes cubre toda la costa peruana. Estamos expandiendo progresivamente a nuevas regiones. Si tu zona aún no aparece, ¡reportala desde ya que tus datos igual se registran!',
  },
  {
    question: '¿Cómo se verifican los reportes?',
    answer:
      'Cada reporte pasa por capas de verificación: validación comunitaria, revisión técnica por biólogos e ingenieros, y derivación a fiscalías ambientales. Las fotos y coordenadas GPS son clave para este proceso.',
  },
  {
    question: '¿Puedo usar la app sin internet?',
    answer:
      'Sí. La app funciona offline: capturá fotos y video sin conexión. Los reportes se sincronizan automáticamente cuando recuperes señal, enviándose con todos los metadatos (GPS, timestamp).',
  },
  {
    question: '¿Qué tipo de incidentes puedo reportar?',
    answer:
      'Podés reportar pesca ilegal (redes prohibidas, embarcaciones no autorizadas), contaminación (derrames, residuos plásticos), floraciones algales nocivas, y puntos de acumulación de basura marina para coordinar limpiezas.',
  },
  {
    question: '¿Recibo alguna recompensa por reportar?',
    answer:
      'Sí. Los reportes verificados generan puntos que podés canjear por beneficios como combustible, equipos de pesca y seguros. Estamos construyendo una red de recompensas con aliados locales.',
  },
];

export function FAQSection() {
  const { isMobile } = useBreakpoints();
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <View style={[styles.section, isMobile && styles.sectionMobile]}>
      <View style={styles.list}>
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openId === index}
            onToggle={() => setOpenId(openId === index ? null : index)}
            compact={isMobile}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    backgroundColor: BrandColors.tertiary,
    alignItems: 'center',
  },
  sectionMobile: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  list: {
    maxWidth: 900,
    width: '100%',
    gap: Spacing.three,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.five,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.secondary,
  },
  faqItemCompact: {
    padding: Spacing.four,
  },
  faqItemOpen: {
    borderLeftColor: BrandColors.primary,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: Fonts.headline,
    fontSize: 17,
    color: BrandColors.neutral,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  faqQuestionCompact: {
    fontSize: 15,
  },
  faqQuestionOpen: {
    color: BrandColors.primary,
  },
  faqAnswer: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: BrandColors.neutral,
    opacity: 0.78,
    lineHeight: 24,
    marginTop: Spacing.four,
    paddingTop: Spacing.four,
    borderTopWidth: 1,
    borderTopColor: 'rgba(152,185,177,0.2)',
  },
});
