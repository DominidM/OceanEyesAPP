import React, { type ReactNode } from 'react';
import type { ScrollView } from 'react-native';

import { LandingHeader, type LandingHeaderProps } from './header/landing-header';

type LandingLayoutProps = {
  children: ReactNode;
  scrollRef: React.RefObject<ScrollView | null>;
  scrolled: boolean;
} & LandingHeaderProps;

export function LandingLayout({
  children,
  scrollRef,
  scrolled,
  ...headerProps
}: LandingLayoutProps) {
  return (
    <>
      <LandingHeader scrolled={scrolled} {...headerProps} />
      {children}
    </>
  );
}
