import { useCallback, useMemo } from 'react';

import { AppFonts, Fonts } from '@/constants/theme';
import { usePreferences } from '@/shared/settings/preferences';

export type FontFamilyOption = 'system' | 'serif' | 'mono';

export type ScaledTypography = {
  f: (size: number) => number;
  fonts: { headline: string; body: string; label: string };
};

export function useScaledTypography(): ScaledTypography {
  const { fontScale, fontFamily } = usePreferences();

  const f = useCallback((size: number) => Math.round(size * fontScale), [fontScale]);

  const fonts = useMemo<ScaledTypography['fonts']>(() => {
    const family = fontFamily === 'serif' ? Fonts.serif! : fontFamily === 'mono' ? Fonts.mono! : null;
    if (!family) return { headline: AppFonts.headline, body: AppFonts.body, label: AppFonts.label };
    return { headline: family, body: family, label: family };
  }, [fontFamily]);

  return { f, fonts };
}
