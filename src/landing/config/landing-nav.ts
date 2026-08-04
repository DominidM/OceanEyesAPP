export type LandingNavPressKey = 'onHowItWorksPress' | 'onHelpPress' | 'onReportesPress';

export type LandingNavLink = { label: string; onPressKey?: LandingNavPressKey; href?: string };

export type LandingSectionKey = 'reportes' | 'how-it-works' | 'ayudar';

export const LANDING_SECTION_PARAM: Record<LandingNavPressKey, LandingSectionKey> = {
  onReportesPress: 'reportes',
  onHowItWorksPress: 'how-it-works',
  onHelpPress: 'ayudar',
};

export const LANDING_NAV_LINKS: LandingNavLink[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Cómo Reportar', onPressKey: 'onReportesPress' },
  { label: 'Cómo funciona', onPressKey: 'onHowItWorksPress' },
  { label: 'Cómo Ayudar', onPressKey: 'onHelpPress' },
  { label: 'FAQ', href: '/faq' },
];
