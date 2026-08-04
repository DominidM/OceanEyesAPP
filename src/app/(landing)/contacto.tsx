import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { BrandColors } from '@landing/config/theme';
import { LandingHeader } from '@landing/layout/header/landing-header';
import { LandingFooter } from '@landing/layout/footer/landing-footer';
import { LandingSubfooter } from '@landing/layout/footer/landing-subfooter';
import { useLandingNav } from '@landing/presentation/hooks/useLandingNav';
import { PageTransition } from '@landing/presentation/components/page-transition';
import { ContactoHero } from '@landing/presentation/sections/contacto/hero-section/page';
import { ContactoForm } from '@landing/presentation/sections/contacto/form-section/page';

export default function ContactoScreen() {
  const nav = useLandingNav();

  return (
    <PageTransition>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <LandingHeader scrolled={true} {...nav} />
        <ContactoHero />
        <ContactoForm />
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
