import { Redirect } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { LandingScreen } from '@landing/presentation/screens/landing-screen';

export default function RootIndex() {
  if (Platform.OS === 'web') return <LandingScreen />;
  return <Redirect href="/mobile" />;
}