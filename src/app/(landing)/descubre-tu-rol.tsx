import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { BrandColors } from '@landing/config/theme';
import { LandingHeader } from '@landing/layout/header/landing-header';
import { LandingFooter } from '@landing/layout/footer/landing-footer';
import { LandingSubfooter } from '@landing/layout/footer/landing-subfooter';
import { PageTransition } from '@landing/presentation/components/page-transition';
import { PerfilHero } from '@landing/presentation/sections/perfil';

export default function DescubreTuRolScreen() {
  return (
    <PageTransition>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <LandingHeader scrolled={true} />
        <PerfilHero />
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
