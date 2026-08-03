import React, { useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BrandColors } from '@/constants/theme';

import { LandingNavBar } from '../components/landing-nav-bar';
import { DownloadSection } from '../sections/download-section';
import { FeaturesSection } from '../sections/features-section';
import { FooterSection } from '../sections/footer-section';
import { HeroSection } from '../sections/hero-section';

export function LandingScreen() {
  const scrollRef = useRef<ScrollView>(null);

  const scrollToFeatures = () => {
    scrollRef.current?.scrollTo({ y: 420, animated: true });
  };

  const scrollToHowItWorks = () => {
    scrollRef.current?.scrollTo({ y: 760, animated: true });
  };

  const scrollToDownload = () => {
    scrollRef.current?.scrollTo({ y: Number.MAX_SAFE_INTEGER, animated: true });
  };

  return (
    <View style={styles.screen}>
      <LandingNavBar
        onFeaturesPress={scrollToFeatures}
        onHowItWorksPress={scrollToHowItWorks}
        onDownloadPress={scrollToDownload}
      />
      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}>
        <HeroSection onDownloadPress={scrollToDownload} />
        <FeaturesSection />
        <DownloadSection />
      </ScrollView>
      <FooterSection />
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
