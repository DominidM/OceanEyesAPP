import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { BrandColors } from '@landing/config/theme';
import { LandingHeader } from '@landing/layout/header/landing-header';
import { LandingFooter } from '@landing/layout/footer/landing-footer';
import { LandingSubfooter } from '@landing/layout/footer/landing-subfooter';
import { DescargasHero } from '@landing/presentation/sections/descargas/hero-section/page';
import { DescargasSection } from '@landing/presentation/sections/descargas/downloads-section/page';

export default function DescargasScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <LandingHeader
        scrolled={true}
        onFeaturesPress={() => {}}
        onHowItWorksPress={() => {}}
        onDownloadPress={() => {}}
      />

      <DescargasHero />
      <DescargasSection />
      <LandingSubfooter />
      <LandingFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: BrandColors.tertiary,
  },
  content: {
    flexGrow: 1,
  },
});
