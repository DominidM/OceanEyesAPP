import { Platform, ViewStyle } from 'react-native';

type ShadowPreset = 'subtle' | 'medium' | 'card' | 'lift' | 'fab';

const SHADOWS: Record<ShadowPreset, ViewStyle> = {
  subtle: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
    },
    android: {
      elevation: 5,
    },
    default: {},
  }),
  lift: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.25,
      shadowRadius: 50,
    },
    android: {
      elevation: 10,
    },
    default: {},
  }),
  fab: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
};

export function shadow(preset: ShadowPreset): ViewStyle {
  return SHADOWS[preset];
}
