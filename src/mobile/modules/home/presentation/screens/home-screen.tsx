import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { PhoneFrame } from '@/shared/components/phone-frame';
import { MainTabKey } from '@/shared/config/main-tabs';

import { HomeSection } from '../sections/home-section';
import { ReportsSection } from '@/modules/reports/presentation/sections/reports-section';
import { RewardsSection } from '@/modules/rewards/presentation/sections/rewards-section';
import { ProfileSection } from '@/modules/profile/presentation/sections/profile-section';
import { TabTransition } from '../components/tab-transition';

export function HomeScreen() {
  const router = useRouter();
  const [section, setSection] = useState<MainTabKey>('inicio');

  const openReportFlow = () => router.push('/mobile/report');

  const openRealTimeMap = () => router.push('/mobile/map');

  const openAlerts = () => router.push('/mobile/alerts');

  return (
    <PhoneFrame section={section} onSectionChange={setSection} onFabPress={openReportFlow}>
      <TabTransition section={section}>
        {section === 'inicio' && (
          <HomeSection
            onReportPress={openReportFlow}
            onExpandMap={openRealTimeMap}
            onAlertsPress={openAlerts}
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
