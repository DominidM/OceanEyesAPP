import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { BrandColors } from '@landing/config/theme';
import { LandingHeader } from '@landing/layout/header/landing-header';
import { LandingFooter } from '@landing/layout/footer/landing-footer';
import { LandingSubfooter } from '@landing/layout/footer/landing-subfooter';
import { PageTransition } from '@landing/presentation/components/page-transition';
import { MunicipalityHero } from '@landing/presentation/sections/municipio/hero-section/page';
import { MunicipalityApplicationForm } from '@landing/presentation/sections/municipio/application-section/page';

export default function MunicipioScreen() {
  return (
    <PageTransition>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <LandingHeader scrolled={true} />
        <MunicipalityHero />
        <MunicipalityApplicationForm />
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
