import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BrandColors } from '@landing/config/theme';
import { LandingFooter } from '@landing/layout/footer/landing-footer';
import { LandingLayout } from '@landing/layout/landing-layout';
import { useLandingScroll } from '../hooks/useLandingScroll';
import {
  HeroSection,
  FeaturesSection,
  HelpSection,
  TechnologySection,
  InfrastructureSection,
  ContactSection,
} from '../sections/inicio';

export function LandingScreen() {
  const { scrollRef, toFeatures, toHowItWorks, toDownload } = useLandingScroll();
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    setScrolled(e.nativeEvent.contentOffset.y > 50);
  };

  return (
    <View style={styles.screen}>
      <LandingLayout
        scrolled={scrolled}
        scrollRef={scrollRef}
        onFeaturesPress={toFeatures}
        onHowItWorksPress={toHowItWorks}
        onDownloadPress={toDownload}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <HeroSection onFeaturesPress={toFeatures} onDownloadPress={toDownload} />
          <FeaturesSection />
          <HelpSection />
          <TechnologySection />
          <InfrastructureSection />
          <ContactSection />
          <LandingFooter />
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
