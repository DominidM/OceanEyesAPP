import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { BrandColors } from '@landing/config/theme';
import { LandingHeader } from '@landing/layout/header/landing-header';
import { LandingFooter } from '@landing/layout/footer/landing-footer';
import { LandingSubfooter } from '@landing/layout/footer/landing-subfooter';
import { useLandingNav } from '@landing/presentation/hooks/useLandingNav';
import { PageTransition } from '@landing/presentation/components/page-transition';
import { FAQHero } from '@landing/presentation/sections/faq/hero-section/page';
import { FAQSection } from '@landing/presentation/sections/faq/faq-section/page';

export default function FAQScreen() {
  const nav = useLandingNav();

  return (
    <PageTransition>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <LandingHeader scrolled={true} {...nav} />
        <FAQHero />
        <FAQSection />
        <LandingSubfooter />
        <LandingFooter />
      </ScrollView>
    </PageTransition>
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
