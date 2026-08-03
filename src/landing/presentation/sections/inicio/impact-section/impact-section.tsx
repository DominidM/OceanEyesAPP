import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

const stats = [
  { number: '+12%', label: 'Reducción de la Contaminación' },
  { number: '+120', label: 'Comunidades Activas' },
  { number: '+1K', label: 'Reportes Anuales' },
  { number: '98%', label: 'Tasa de Respuesta' },
];

export function ImpactSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<View>(null);

  useEffect(() => {
    const node = ref.current as unknown as HTMLElement | null;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <View style={styles.section} ref={ref}>
      <Text style={styles.title}>Nuestro Impacto Esperado</Text>

      <View style={styles.grid}>
        {stats.map((stat, i) => (
          <View
            key={stat.label}
            style={[styles.stat, visible && styles.statVisible, { transitionDelay: `${i * 150}ms` }]}
          >
            <Text style={styles.statNumber}>{stat.number}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    backgroundColor: '#0A0F1D',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: Spacing.six,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
    maxWidth: 900,
    width: '100%',
    justifyContent: 'center',
  },
  stat: {
    flexBasis: 380,
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    opacity: 0,
    transform: [{ translateY: 30 }],
    transitionProperty: 'opacity, transform',
    transitionDuration: '600ms',
    transitionTimingFunction: 'ease',
  },
  statVisible: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  statNumber: {
    fontSize: 51,
    fontWeight: '700',
    color: BrandColors.secondary,
    fontFamily: Fonts.body,
    marginBottom: Spacing.one,
  },
  statLabel: {
    fontSize: 14,
    color: '#9D9FA1',
    fontFamily: Fonts.body,
    letterSpacing: 1.3,
    textAlign: 'center',
  },
});
