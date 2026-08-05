import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const FALLBACK_KEY = '@oceaneyes/device-id/fallback/v1';
const HASH_KEY = '@oceaneyes/device-id/hash/v1';
const HASH_SALT = 'oceaneyes:v1:';

let cached: string | null = null;

async function rawDeviceId(): Promise<string> {
  try {
    if (Platform.OS === 'android') {
      const id = Application.getAndroidId();
      if (id) return `android:${id}`;
    } else if (Platform.OS === 'ios') {
      const id = await Application.getIosIdForVendorAsync();
      if (id) return `ios:${id}`;
    }
  } catch {
    // Las APIs nativas pueden no estar disponibles; se usa el fallback.
  }

  let fallback = await AsyncStorage.getItem(FALLBACK_KEY);
  if (!fallback) {
    fallback = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}-${Math.random().toString(36).slice(2, 12)}`;
    await AsyncStorage.setItem(FALLBACK_KEY, fallback);
  }
  return `fallback:${fallback}`;
}

/**
 * Hash SHA-256 estable por dispositivo. Solo el hash viaja a Firestore;
 * el identificador crudo del dispositivo nunca sale del teléfono.
 */
export async function getDeviceHash(): Promise<string | null> {
  if (cached) return cached;

  try {
    const raw = await rawDeviceId();
    const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${HASH_SALT}${raw}`);
    cached = digest;
    await AsyncStorage.setItem(HASH_KEY, digest).catch(() => undefined);
    return digest;
  } catch {
    return null;
  }
}
