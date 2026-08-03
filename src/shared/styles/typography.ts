import { Platform } from 'react-native';

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter',
    serif: 'Playfair Display',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Inter',
    serif: 'Playfair Display',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-body)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const AppFonts = {
  headline: Platform.select({ ios: Fonts.serif, default: Fonts.sans })!,
  body: Fonts.sans,
  label: Fonts.sans,
} as const;
