import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BrandColors } from '@landing/config/theme';
import { LandingLayout } from '@landing/layout/landing-layout';
import { useLandingScroll } from '../hooks/useLandingScroll';
import {
  HeroSection,
  FeaturesSection,
  HelpSection,
  TechnologySection,
  ImpactSection,
  InfrastructureSection,
  ContactSection,
} from '../sections/inicio';

export function LandingScreen() {
  const { scrollRef, toFeatures, toHowItWorks, toDownload } = useLandingScroll();

  return (
    <View style={styles.screen}>
      <LandingLayout
        scrollRef={scrollRef}
        onFeaturesPress={toFeatures}
        onHowItWorksPress={toHowItWorks}
        onDownloadPress={toDownload}
      >
        <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}>
          <HeroSection onFeaturesPress={toFeatures} onDownloadPress={toDownload} />
          <FeaturesSection />
          <HelpSection />
          <TechnologySection />
          <ImpactSection />
          <InfrastructureSection />
          <ContactSection />
        </ScrollView>
      </LandingLayout>
    </View>
  );
}

export default LandingScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.tertiary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
