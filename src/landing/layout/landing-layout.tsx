import React, { type ReactNode } from 'react';
import type { ScrollView } from 'react-native';

import { LandingHeader, type LandingHeaderProps } from './header/landing-header';
import { LandingFooter } from './footer/landing-footer';

type LandingLayoutProps = {
  children: ReactNode;
  scrollRef: React.RefObject<ScrollView | null>;
} & LandingHeaderProps;

export function LandingLayout({
  children,
  scrollRef,
  ...headerProps
}: LandingLayoutProps) {
  return (
    <>
      <LandingHeader {...headerProps} />
      {children}
      <LandingFooter />
    </>
  );
}
