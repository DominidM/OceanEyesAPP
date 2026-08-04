import { router } from 'expo-router';

import {
  LANDING_SECTION_PARAM,
  type LandingNavPressKey,
} from '@landing/config/landing-nav';

export function useLandingNav() {
  const goTo = (key: LandingNavPressKey) => {
    router.push({
      pathname: '/',
      params: { section: LANDING_SECTION_PARAM[key] },
    });
  };

  return {
    onHowItWorksPress: () => goTo('onHowItWorksPress'),
    onHelpPress: () => goTo('onHelpPress'),
    onReportesPress: () => goTo('onReportesPress'),
  };
}