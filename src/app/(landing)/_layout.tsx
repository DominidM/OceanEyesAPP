import { Slot } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CustomCursor } from '@landing/presentation/components/custom-cursor';

export default function LandingLayout() {
  return (
    <View style={styles.screen}>
      <CustomCursor />
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
