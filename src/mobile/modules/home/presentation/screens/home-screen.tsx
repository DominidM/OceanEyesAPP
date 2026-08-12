import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { PhoneFrame } from '@/shared/components/phone-frame';
import { MainTabKey } from '@/shared/config/main-tabs';

import { HomeSection } from '../sections/home-section';
import { ReportsSection } from '@/modules/reports/presentation/sections/reports-section';
import { RewardsSection } from '@/modules/rewards/presentation/sections/rewards-section';
import { ProfileSection } from '@/modules/profile/presentation/sections/profile-section';
import { TabTransition } from '../components/tab-transition';

export function HomeScreen() {
  const router = useRouter();
  const { section: requestedSection } = useLocalSearchParams<{ section?: string }>();
  const [section, setSection] = useState<MainTabKey>('inicio');

  useEffect(() => {
    if (requestedSection && ['inicio', 'reportes', 'recompensas', 'perfil'].includes(requestedSection)) {
      setSection(requestedSection as MainTabKey);
    }
  }, [requestedSection]);

  const openReportFlow = () => router.push('/mobile/report');

  const openRealTimeMap = () => router.push('/mobile/map');

  const openAlerts = () => router.push('/mobile/alerts');

  const openAlertReport = () => router.push('/mobile/alert-report');

  return (
    <PhoneFrame section={section} onSectionChange={setSection} onFabPress={openReportFlow}>
      <TabTransition section={section}>
        {section === 'inicio' && (
          <HomeSection
            onReportPress={openReportFlow}
            onExpandMap={openRealTimeMap}
            onAlertsPress={openAlerts}
            onAlertReportPress={openAlertReport}
            onPendingPress={() => setSection('reportes')}
          />
        )}
        {section === 'reportes' && <ReportsSection />}
        {section === 'recompensas' && <RewardsSection />}
        {section === 'perfil' && <ProfileSection />}
      </TabTransition>
    </PhoneFrame>
  );
}

export default HomeScreen;
