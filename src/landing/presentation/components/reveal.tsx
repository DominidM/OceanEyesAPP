import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';

import { prefersReducedMotion } from '../hooks/useReducedMotion';
import type { WebViewStyle } from '@landing/styles/web-types';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export type RevealProps = {
  children: React.ReactNode;
  /** Enter direction of the element. Defaults to `up` (fade + translateY). */
  direction?: RevealDirection;
  /** Stagger delay in ms (used for card grids). */
  delay?: number;
  /** Animation duration in ms. Defaults to 600ms. */
  duration?: number;
  /** Reveal only once (default) or every time it re-enters the viewport. */
  once?: boolean;
  /** Optional subtle scale-in, e.g. `0.97` for imagery. */
  scale?: number;
  style?: StyleProp<ViewStyle>;
};

type WebAnimatedStyle = WebViewStyle;

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const OFFSET = 24;
const THRESHOLD = 0.15;
const ROOT_MARGIN = '0px 0px -8% 0px';

type TransformList = NonNullable<Extract<WebAnimatedStyle, { transform?: unknown }>['transform']>;

function canObserve(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    typeof window.IntersectionObserver === 'function' &&
    !prefersReducedMotion()
  );
}

function deltaFor(direction: RevealDirection): { x: number; y: number } {
  switch (direction) {
    case 'down':
      return { x: 0, y: -OFFSET };
    case 'left':
      return { x: -OFFSET, y: 0 };
    case 'right':
      return { x: OFFSET, y: 0 };
    case 'none':
      return { x: 0, y: 0 };
    case 'up':
    default:
      return { x: 0, y: OFFSET };
  }
}

/**
 * Scroll-reveal wrapper built on IntersectionObserver + CSS transitions.
 *
 * The element starts at `opacity: 0` with a small offset and animates to its
 * resting position the first time it enters the viewport. Users with
 * `prefers-reduced-motion` (or without IntersectionObserver) always get the
 * content in its final state.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  once = true,
  scale,
  style,
}: RevealProps) {
  const hostRef = useRef<View>(null);
  const [revealed, setRevealed] = useState(() => !canObserve());

  useEffect(() => {
    if (!canObserve()) return;

    const host = hostRef.current as unknown as HTMLElement | null;
    if (!host) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const viewportHeight = window.innerHeight || 0;
          const ratioOk = entry.intersectionRatio >= THRESHOLD;
          // Very tall blocks can never reach `THRESHOLD`; treat a viewport that
          // is mostly filled by the element as "visible enough".
          const fillsViewport = entry.intersectionRect.height >= viewportHeight * 0.8;

          if (!ratioOk && !fillsViewport) continue;

          setRevealed(true);
          if (once) observer.disconnect();
          return;
        }
      },
      { threshold: [0, THRESHOLD], rootMargin: ROOT_MARGIN },
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, [once]);

  const hasMovement = direction !== 'none';
  const hasTransform = hasMovement || scale != null;
  const { x, y } = deltaFor(direction);

  const hiddenStyle: WebAnimatedStyle = hasTransform
    ? {
        opacity: 0,
        transform: [
          { translateX: x },
          { translateY: y },
          ...(scale != null ? [{ scale }] : []),
        ] as TransformList,
      }
    : { opacity: 0 };

  const revealedStyle: WebAnimatedStyle = {
    opacity: 1,
    // The transition lives on the *after-change* style so the initial hidden
    // state is applied instantly and only the reveal animates.
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
    transitionTimingFunction: EASE,
    ...(hasTransform
      ? {
          transform: [
            { translateX: 0 },
            { translateY: 0 },
            ...(scale != null ? [{ scale: 1 }] : []),
          ] as TransformList,
        }
      : null),
  };

  return (
    <View ref={hostRef} style={[style, revealed ? revealedStyle : hiddenStyle]}>
      {children}
    </View>
  );
}
