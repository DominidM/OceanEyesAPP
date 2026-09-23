import { useLayoutEffect, useRef } from 'react';
import { Platform, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import {
  LANDING_SECTION_DOM_ID,
  type LandingSectionKey,
} from '@landing/config/landing-nav';
import { prefersReducedMotion } from './useReducedMotion';

type Positions = Partial<Record<LandingSectionKey, number>>;
type Ref<T> = { current: T | null };

/**
 * Scrolls to a landing section, preferring the browser's smooth
 * `scrollIntoView` (which honours `scroll-margin-top` for the fixed header)
 * and falling back to the ScrollView offset when no anchor exists yet.
 * Never animates when the user prefers reduced motion.
 */
function scrollToSection(key: LandingSectionKey, scrollRef: Ref<ScrollView>, positionsRef: { current: Positions }) {
  const reduced = prefersReducedMotion();

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const anchor = document.getElementById(LANDING_SECTION_DOM_ID[key]);
    if (anchor && typeof anchor.scrollIntoView === 'function') {
      anchor.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      return;
    }
  }

  const offset = positionsRef.current[key];
  if (offset === undefined) return;
  scrollRef.current?.scrollTo({ y: offset, animated: !reduced });
}

export function useLandingScroll(positions: Positions) {
  const scrollRef = useRef<ScrollView>(null);
  const positionsRef = useRef<Positions>(positions);
  positionsRef.current = positions;
  const params = useLocalSearchParams<{ section?: LandingSectionKey }>();
  const targetSection = params.section;

  const scrollTo = (key: LandingSectionKey) => {
    scrollToSection(key, scrollRef, positionsRef);
  };

  useLayoutEffect(() => {
    if (!targetSection || !(targetSection in LANDING_SECTION_DOM_ID)) return;

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        scrollToSection(targetSection, scrollRef, positionsRef);
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
