import { Slot } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandColors } from '@landing/config/theme';

export default function LandingLayout() {
  return (
    <View style={styles.screen}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.tertiary,
  },
});
