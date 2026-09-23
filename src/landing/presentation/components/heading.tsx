import type { TextProps } from 'react-native';

/**
 * Builds heading semantics for `<Text>` titles: react-native-web maps
 * `accessibilityRole="header"` to `role="heading"` and forwards `aria-level`,
 * which is not part of React Native's public types (hence the cast).
 */
export function headingProps(level: 1 | 2 | 3): TextProps {
  return {
    accessibilityRole: 'header',
    'aria-level': level,
  } as unknown as TextProps;
}
