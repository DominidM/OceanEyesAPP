import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { BrandColors } from '@/constants/theme';

export default function AdminLayout() {
  if (Platform.OS !== 'web') return <Redirect href="/mobile" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: BrandColors.tertiary },
      }}
    />
  );
}
