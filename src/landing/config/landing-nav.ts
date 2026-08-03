export type LandingNavPressKey = 'onFeaturesPress' | 'onHowItWorksPress' | 'onDownloadPress';

export type LandingNavLink = { label: string; onPressKey: LandingNavPressKey };

export const LANDING_NAV_LINKS: LandingNavLink[] = [
  { label: 'Características', onPressKey: 'onFeaturesPress' },
  { label: 'Cómo funciona', onPressKey: 'onHowItWorksPress' },
  { label: 'Descargar', onPressKey: 'onDownloadPress' },
];
