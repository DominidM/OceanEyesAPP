import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeOut, Keyframe } from 'react-native-reanimated';

import { MainTabKey } from '@/shared/config/main-tabs';

type TabTransitionProps = {
  section: MainTabKey;
  children: React.ReactNode;
};

const TAB_ORDER: MainTabKey[] = ['inicio', 'reportes', 'recompensas', 'perfil'];

const ENTER_FORWARD = new Keyframe({
  0: { opacity: 0.4, transform: [{ translateX: 26 }] },
  100: { opacity: 1, transform: [{ translateX: 0 }] },
}).duration(120);

const ENTER_BACKWARD = new Keyframe({
  0: { opacity: 0.4, transform: [{ translateX: -26 }] },
  100: { opacity: 1, transform: [{ translateX: 0 }] },
}).duration(120);

const EXIT = FadeOut.duration(100);

export function TabTransition({ section, children }: TabTransitionProps) {
  const prevRef = useRef<MainTabKey | null>(null);

  const prev = prevRef.current;
  prevRef.current = section;

  let entering = ENTER_FORWARD;
  if (prev != null && prev !== section) {
    const nextIndex = TAB_ORDER.indexOf(section);
    const prevIndex = TAB_ORDER.indexOf(prev);
    if (nextIndex < prevIndex) entering = ENTER_BACKWARD;
  }

  return (
    <Animated.View key={section} entering={entering} exiting={EXIT} style={styles.fill}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});
