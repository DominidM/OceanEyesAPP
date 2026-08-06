import AsyncStorage from '@react-native-async-storage/async-storage';

const cacheKeys = new Set<string>();

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    cacheKeys.add(key);
  } catch {
    /* ignore */
  }
}

export async function clearCachedData(): Promise<void> {
  const keys = [...cacheKeys];
  cacheKeys.clear();
  for (const key of keys) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
