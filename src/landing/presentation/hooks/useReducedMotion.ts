import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Returns `true` when the user has asked the OS/browser to reduce motion.
 * Safe to call during render (returns `false` outside of the browser).
 */
export function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(QUERY).matches;
}

/**
 * Reactive version of {@link prefersReducedMotion}. Listens for runtime changes
 * so animations can be switched off without a reload.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia(QUERY);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);

    setReduced(media.matches);
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }
    return undefined;
  }, []);

  return reduced;
}
