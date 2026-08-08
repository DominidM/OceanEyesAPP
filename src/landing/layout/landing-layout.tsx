import React, { type ReactNode } from 'react';
import type { ScrollView } from 'react-native';

import { LandingHeader } from './header/landing-header';

type LandingLayoutProps = {
  children: ReactNode;
  scrollRef: React.RefObject<ScrollView | null>;
  scrolled: boolean;
};

export function LandingLayout({
  children,
  scrollRef,
  scrolled,
}: LandingLayoutProps) {
  return (
    <>
      <LandingHeader scrolled={scrolled} />
      {children}
    </>
  );
}
