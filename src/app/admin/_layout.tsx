import { Redirect, Slot } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function AdminLayout() {
  if (Platform.OS !== 'web') return <Redirect href="/mobile" />;

  return <Slot />;
}
