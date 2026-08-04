import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { BrandColors } from "@landing/config/theme";
import { LandingFooter } from "@landing/layout/footer/landing-footer";
import { LandingSubfooter } from "@landing/layout/footer/landing-subfooter";
import { LandingLayout } from "@landing/layout/landing-layout";
import { CustomCursor } from "../components/custom-cursor";
import { useLandingScroll } from "../hooks/useLandingScroll";
import {
  HeroSection,
  ReportesSection,
  FeaturesSection,
  HelpSection,
  TechnologySection,
} from "../sections/inicio";

export function LandingScreen() {
  const { scrollRef, toFeatures, toHowItWorks, toDownload } =
    useLandingScroll();
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e: {
    nativeEvent: { contentOffset: { y: number } };
  }) => {
    setScrolled(e.nativeEvent.contentOffset.y > 50);
  };

  return (
    <View style={styles.screen}>
      <CustomCursor />
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
          <HeroSection
            onFeaturesPress={toFeatures}
            onDownloadPress={toDownload}
          />
          <FeaturesSection />
          <HelpSection />
          <TechnologySection />
          <ReportesSection />

          <LandingSubfooter />
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
