import { useLayoutEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import type { LandingSectionKey } from '@landing/config/landing-nav';

const SECTION_OFFSETS: Record<LandingSectionKey, number> = {
  reportes: 1200,
  'how-it-works': 2000,
  ayudar: 2800,
};

export function useLandingScroll() {
  const scrollRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{ section?: LandingSectionKey }>();
  const targetSection = params.section;

  useLayoutEffect(() => {
    if (!targetSection) return;
    const offset = SECTION_OFFSETS[targetSection];
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

  const toReportes = () => {
    scrollRef.current?.scrollTo({ y: 1200, animated: true });
  };

  const toHowItWorks = () => {
    scrollRef.current?.scrollTo({ y: 2000, animated: true });
  };

  const toHelp = () => {
    scrollRef.current?.scrollTo({ y: 2800, animated: true });
  };

  return { scrollRef, toReportes, toHowItWorks, toHelp };
}