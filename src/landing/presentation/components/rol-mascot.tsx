import React, { useEffect, useRef } from 'react';
import { Image } from 'expo-image';
import { Animated, Easing, StyleSheet } from 'react-native';

// ============================================================
// RolMascot · Zorro guía del quiz "Descubre tu Rol".
// Muestra una imagen según el momento de la conversación y, al
// hablar, pulsa (agranda/achica) para simular que está hablando.
// ============================================================

export type RolMascotProps = {
  source: string;
  speaking?: boolean;
  size?: number;
};

export function RolMascot({ source, speaking = false, size = 150 }: RolMascotProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!speaking) {
      scale.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.07,
          duration: 240,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 240,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => {
      pulse.stop();
      scale.setValue(1);
    };
  }, [speaking, scale]);

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <Image
        source={source}
        style={{ width: size, height: size }}
        contentFit="contain"
        transition={220}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
