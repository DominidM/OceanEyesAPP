import type { Href } from 'expo-router';

export type LandingSectionKey = 'reportes' | 'how-it-works' | 'ayudar';

export type LandingNavLink = { label: string; href: Href };

export const LANDING_NAV_LINKS: LandingNavLink[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Municipalidades', href: '/municipio' },
  { label: 'Descubre tu Rol', href: '/descubre-tu-rol' },
  { label: 'Preguntas Frecuentes', href: '/faq' },
  { label: 'Arbitrum', href: '/arbitrum' },
  { label: 'Contacto', href: '/contacto' },
];
