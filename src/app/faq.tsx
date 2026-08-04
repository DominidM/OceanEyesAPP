import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BrandColors } from '@landing/config/theme';
import { LandingHeader } from '@landing/layout/header/landing-header';
import { LandingFooter } from '@landing/layout/footer/landing-footer';
import { LandingSubfooter } from '@landing/layout/footer/landing-subfooter';
import { FAQHero } from '@landing/presentation/sections/faq/hero-section/page';
import { FAQSection } from '@landing/presentation/sections/faq/faq-section/page';
import { CustomCursor } from '@landing/presentation/components/custom-cursor';

export default function FAQScreen() {
  return (
    <View style={styles.screen}>
      <CustomCursor />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <LandingHeader
        scrolled={true}
        onFeaturesPress={() => {}}
        onHowItWorksPress={() => {}}
        onDownloadPress={() => {}}
      />

      <FAQHero />
      <FAQSection />
      <LandingSubfooter />
      <LandingFooter />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: BrandColors.tertiary,
  },
  content: {
    flexGrow: 1,
  },
});
