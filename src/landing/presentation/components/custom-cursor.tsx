import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { BrandColors } from '@landing/config/theme';

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, select, textarea, label';

const RING_DEFAULT = 28;
const RING_HOVERED = 46;
const RING_LERP = 0.18;

export function CustomCursor() {
  const dotRef = useRef<View>(null);
  const ringRef = useRef<View>(null);
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current as unknown as HTMLElement;
    const ring = ringRef.current as unknown as HTMLElement;
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId = 0;
    let visible = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        ringX = mouseX;
        ringY = mouseY;
      }
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    };

    const onMouseDown = () => {
      ring.style.borderColor = BrandColors.primary;
    };

    const onMouseUp = () => {
      ring.style.borderColor = hoveredRef.current ? BrandColors.primary : BrandColors.secondary;
    };

    const isInteractive = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;
      return !!target.closest(INTERACTIVE_SELECTOR);
    };

    const onMouseOver = (e: MouseEvent) => {
      const next = isInteractive(e.target);
      hoveredRef.current = next;
      setHovered(next);
    };

    const onMouseLeave = () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      hoveredRef.current = false;
      setHovered(false);
    };

    const loop = () => {
      ringX += (mouseX - ringX) * RING_LERP;
      ringY += (mouseY - ringY) * RING_LERP;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.body.style.cursor = 'none';
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseover', onMouseOver);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.body.style.cursor = '';
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (Platform.OS !== 'web') return null;
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none" accessibilityElementsHidden>
      <View
        ref={dotRef}
        style={[
          styles.dot,
          hovered && styles.dotHovered,
        ]}
      />
      <View
        ref={ringRef}
        style={[
          styles.ring,
          hovered && styles.ringHovered,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    zIndex: 9999,
  },
  dot: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.primary,
    opacity: 0,
    transform: [{ translateX: -100 }, { translateY: -100 }],
  },
  dotHovered: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  ring: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: RING_DEFAULT,
    height: RING_DEFAULT,
    borderRadius: RING_DEFAULT / 2,
    borderWidth: 2,
    borderColor: BrandColors.secondary,
    backgroundColor: 'transparent',
    opacity: 0,
    transform: [{ translateX: -100 }, { translateY: -100 }],
  },
  ringHovered: {
    width: RING_HOVERED,
    height: RING_HOVERED,
    borderRadius: RING_HOVERED / 2,
    borderColor: BrandColors.primary,
    borderWidth: 1.5,
    backgroundColor: 'rgba(19, 78, 94, 0.06)',
  },
});