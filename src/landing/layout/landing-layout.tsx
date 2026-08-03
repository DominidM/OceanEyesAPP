import React, { type ReactNode } from 'react';
import type { ScrollView } from 'react-native';

import { LandingNavBar } from '../presentation/components/landing-nav-bar';
import { FooterSection } from '../presentation/sections/footer-section';

type LandingLayoutProps = {
  children: ReactNode;
  scrollRef: React.RefObject<ScrollView | null>;
  onFeaturesPress: () => void;
  onHowItWorksPress: () => void;
  onDownloadPress: () => void;
};

export function LandingLayout({
  children,
  scrollRef,
  onFeaturesPress,
  onHowItWorksPress,
  onDownloadPress,
}: LandingLayoutProps) {
  return (
    <>
      <LandingNavBar
        onFeaturesPress={onFeaturesPress}
        onHowItWorksPress={onHowItWorksPress}
        onDownloadPress={onDownloadPress}
      />
      {children}
      <FooterSection />
    </>
  );
}
