import { useWindowDimensions } from 'react-native';
import { Breakpoints } from '@landing/config/theme';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export function useBreakpoints() {
  const { width } = useWindowDimensions();
  const isMobile = width < Breakpoints.mobile;
  const isTablet = width >= Breakpoints.mobile && width < Breakpoints.tablet;
  const isDesktop = width >= Breakpoints.tablet;
  const size: ScreenSize = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
  return { isMobile, isTablet, isDesktop, size, width };
}
