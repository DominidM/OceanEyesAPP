import type { TextStyle, ViewStyle } from 'react-native';

/**
 * React Native styles extended with the CSS properties react-native-web
 * supports but React Native's TypeScript types do not declare.
 */
export type WebViewStyle = ViewStyle & {
  transitionProperty?: string;
  transitionDuration?: string;
  transitionDelay?: string;
  transitionTimingFunction?: string;
  backdropFilter?: string;
  boxShadow?: string;
};

/**
 * Allows responsive `fontSize`/`lineHeight` values (`clamp()`, `vw`, ...)
 * which are only ever rendered by react-native-web.
 */
export type WebTextStyle = Omit<TextStyle, 'fontSize' | 'lineHeight'> & {
  fontSize?: number | string;
  lineHeight?: number | string;
  whiteSpace?: 'normal' | 'nowrap';
};

/**
 * Casts a web-extended text style into a plain `TextStyle` so it can be used
 * inside react-native-web style arrays (`<Text style={[a, b]} />`).
 */
export function webTextStyle(style: WebTextStyle): TextStyle {
  return style as unknown as TextStyle;
}
