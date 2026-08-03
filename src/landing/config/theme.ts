export { BrandColors, Fonts, AppFonts } from '@shared/styles';

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

export const MaxWidth = {
  content: 1080,
  narrow: 760,
} as const;
