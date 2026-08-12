import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { BrandColors } from '@landing/config/theme';
import { LandingHeader } from '@landing/layout/header/landing-header';
import { LandingFooter } from '@landing/layout/footer/landing-footer';
import { LandingSubfooter } from '@landing/layout/footer/landing-subfooter';
import { PageTransition } from '@landing/presentation/components/page-transition';
import { ArbitrumHero } from '@landing/presentation/sections/arbitrum/hero-section/page';
import { ProcedenciaSection } from '@landing/presentation/sections/arbitrum/procedencia-section/page';
import { InfraestructuraSection } from '@landing/presentation/sections/arbitrum/infraestructura-section/page';
import { LedgerSection } from '@landing/presentation/sections/arbitrum/ledger-section/page';

export default function ArbitrumScreen() {
  return (
    <PageTransition>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <LandingHeader scrolled={true} />
        <ArbitrumHero />
        <ProcedenciaSection />
        <InfraestructuraSection />
        <LedgerSection />
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