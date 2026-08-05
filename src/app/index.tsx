import { Redirect } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function RootIndex() {
  if (Platform.OS === 'web') return <Redirect href="/admin" />;
  return <Redirect href="/mobile" />;
}
