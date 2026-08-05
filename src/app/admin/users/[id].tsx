import { useLocalSearchParams } from 'expo-router';
import React from 'react';

import { UserProfileScreen } from '@admin/presentation/screens/user-profile-screen';

export default function UserProfileRoute() {
  useLocalSearchParams();
  return <UserProfileScreen />;
}