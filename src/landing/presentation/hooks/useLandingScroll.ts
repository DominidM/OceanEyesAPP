import { useLayoutEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import type { LandingSectionKey } from '@landing/config/landing-nav';

export function useLandingScroll(positions: Partial<Record<LandingSectionKey, number>>) {
  const scrollRef = useRef<ScrollView>(null);
  const positionsRef = useRef(positions);
  positionsRef.current = positions;
  const params = useLocalSearchParams<{ section?: LandingSectionKey }>();
  const targetSection = params.section;

  const scrollTo = (key: LandingSectionKey) => {
    const offset = positionsRef.current[key];
    if (offset === undefined) return;
    scrollRef.current?.scrollTo({ y: offset, animated: true });
  };

  useLayoutEffect(() => {
    if (!targetSection) return;
    const offset = positionsRef.current[targetSection];
    if (offset === undefined) return;

    let raf2 = 0;
    let raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: offset, animated: true });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [targetSection]);

  const toReportes = () => scrollTo('reportes');
  const toHowItWorks = () => scrollTo('how-it-works');
  const toHelp = () => scrollTo('ayudar');

  return { scrollRef, toReportes, toHowItWorks, toHelp };
}
