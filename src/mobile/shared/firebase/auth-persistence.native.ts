import AsyncStorage from '@react-native-async-storage/async-storage';
import { type FirebaseApp } from 'firebase/app';
// Firebase exposes this helper through its React Native export condition.
// @ts-expect-error The package's default declaration omits the React Native-only export.
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from '@firebase/auth';

export function createFirebaseAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
}
