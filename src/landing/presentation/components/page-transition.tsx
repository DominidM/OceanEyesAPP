import { usePathname } from 'expo-router';
import React, { useLayoutEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, ViewStyle } from 'react-native';

export type PageTransitionProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

type SlideDirection = 'forward' | 'backward' | 'none';

const ROUTE_ORDER = ['/', '/descargas', '/faq', '/contacto'];

const ENTER_DURATION = 480;

let previousPathname: string | null = null;

function resolveSlideDirection(currentPathname: string): SlideDirection {
  const prev = previousPathname;
  previousPathname = currentPathname;
  if (prev == null || prev === currentPathname) return 'none';
  const prevIndex = ROUTE_ORDER.indexOf(prev);
  const currentIndex = ROUTE_ORDER.indexOf(currentPathname);
  if (prevIndex === -1 || currentIndex === -1) return 'none';
  return currentIndex > prevIndex ? 'forward' : 'backward';
}

export function PageTransition({ children, style }: PageTransitionProps) {
  const pathname = usePathname();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const appliedPathRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (appliedPathRef.current === pathname) return;
    appliedPathRef.current = pathname;

    const direction = resolveSlideDirection(pathname);
    const fromX = direction === 'forward' ? 56 : direction === 'backward' ? -56 : 0;
    const fromY = direction === 'none' ? 26 : 0;

    opacity.setValue(0);
    translateX.setValue(fromX);
    translateY.setValue(fromY);

    const timing = { duration: ENTER_DURATION, easing: Easing.out(Easing.cubic), useNativeDriver: false };
    Animated.parallel([
      Animated.timing(opacity, { ...timing, toValue: 1 }),
      Animated.timing(translateX, { ...timing, toValue: 0 }),
      Animated.timing(translateY, { ...timing, toValue: 0 }),
    ]).start();
  }, [pathname, opacity, translateX, translateY]);

  return (
    <Animated.View
      style={[styles.root, style, { opacity, transform: [{ translateX }, { translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});