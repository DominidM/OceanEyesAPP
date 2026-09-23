import '@landing/styles/landing.css';

import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Platform, ScrollView, StyleSheet, View } from "react-native";

import { BrandColors } from "@landing/config/theme";
import {
  LANDING_SECTION_DOM_ID,
  type LandingSectionKey,
} from "@landing/config/landing-nav";
import { LandingFooter } from "@landing/layout/footer/landing-footer";
import { LandingSubfooter } from "@landing/layout/footer/landing-subfooter";
import { LandingLayout } from "@landing/layout/landing-layout";
import { PageTransition } from "../components/page-transition";
import { useLandingScroll } from "../hooks/useLandingScroll";
import {
  HeroSection,
  ReportesSection,
  FeaturesSection,
  HelpSection,
  TechnologySection,
  ArbitrumSection,
} from "../sections/inicio";

export function LandingScreen() {
  const [positions, setPositions] = useState<
    Partial<Record<LandingSectionKey, number>>
  >({});
  const { scrollRef, toHowItWorks } = useLandingScroll(positions);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (e: {
    nativeEvent: { contentOffset: { y: number } };
  }) => {
    setScrolled(e.nativeEvent.contentOffset.y > 50);
  };

  const recordPosition = (key: LandingSectionKey) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    setPositions((prev) => (prev[key] === y ? prev : { ...prev, [key]: y }));
  };

  /**
   * One-time web pass: `expo-image` has no `loading` prop, so hint lazy
   * decoding/fetching straight on the rendered `<img>` elements. The hero
   * (LCP) image stays eager with a high fetch priority.
   */
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;

    const applyHints = () => {
      document.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        if (img.closest("#oe-hero")) {
          img.setAttribute("loading", "eager");
          img.setAttribute("fetchpriority", "high");
          return;
        }
        if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
        if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
      });
    };

    applyHints();
    // Images mounted right after hydration (splash, menu) get the same pass.
    const timer = window.setTimeout(applyHints, 700);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <PageTransition>
        <LandingLayout scrolled={scrolled} scrollRef={scrollRef}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.content}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <HeroSection onFeaturesPress={toHowItWorks} />
            <View
              id={LANDING_SECTION_DOM_ID["how-it-works"]}
              onLayout={recordPosition("how-it-works")}
            >
              <FeaturesSection />
            </View>
            <View id={LANDING_SECTION_DOM_ID.ayudar} onLayout={recordPosition("ayudar")}>
              <HelpSection />
            </View>
            <TechnologySection />
            <View id={LANDING_SECTION_DOM_ID.reportes} onLayout={recordPosition("reportes")}>
              <ReportesSection />
            </View>
            <ArbitrumSection />

            <LandingSubfooter />
            <LandingFooter />
          </ScrollView>
        </LandingLayout>
      </PageTransition>
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
