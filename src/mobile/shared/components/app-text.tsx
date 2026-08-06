import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { AppFonts } from '@/constants/theme';
import { useScaledTypography } from '@/shared/accessibility/use-scaled-typography';

export function AppText({ style, ...props }: TextProps) {
  const { f, fonts } = useScaledTypography();
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;

  const scaled: TextStyle = {};
  if (typeof flat?.fontSize === 'number') {
    scaled.fontSize = f(flat.fontSize);
    if (typeof flat.lineHeight === 'number') scaled.lineHeight = f(flat.lineHeight);
  }
  if (typeof flat?.fontFamily === 'string') {
    if (flat.fontFamily === AppFonts.headline) {
      scaled.fontFamily = fonts.headline;
    } else if (flat.fontFamily === AppFonts.body) {
      scaled.fontFamily = fonts.body;
    } else if (flat.fontFamily === AppFonts.label) {
      scaled.fontFamily = fonts.label;
    }
  }

  return <Text {...props} style={[style, scaled]} />;
}
