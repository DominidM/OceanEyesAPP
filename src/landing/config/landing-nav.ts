import type { Href } from 'expo-router';

export type LandingSectionKey = 'reportes' | 'how-it-works' | 'ayudar';

/**
 * DOM ids of the in-page section anchors rendered by `LandingScreen`.
 * They are what smooth scrolling and `?section=` deep links target.
 */
export const LANDING_SECTION_DOM_ID: Record<LandingSectionKey, string> = {
  'how-it-works': 'landing-section-how-it-works',
  ayudar: 'landing-section-ayudar',
  reportes: 'landing-section-reportes',
};

export type LandingNavLink = { label: string; href: Href };

export const LANDING_NAV_LINKS: LandingNavLink[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Municipalidades', href: '/municipio' },
  { label: 'Descubre tu Rol', href: '/descubre-tu-rol' },
  { label: 'Preguntas Frecuentes', href: '/faq' },
  { label: 'Arbitrum', href: '/arbitrum' },
  { label: 'Contacto', href: '/contacto' },
];
