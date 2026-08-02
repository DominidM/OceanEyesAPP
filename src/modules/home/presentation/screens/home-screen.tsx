import React, { useState } from 'react';

import { PhoneFrame } from '@/shared/components/phone-frame';
import { MainTabKey } from '@/shared/config/main-tabs';

import { HomeSection } from '../sections/home-section';
import { ReportsSection } from '@/modules/reports/presentation/sections/reports-section';
import { ZonesSection } from '@/modules/zones/presentation/sections/zones-section';
import { ProfileSection } from '@/modules/profile/presentation/sections/profile-section';

export function HomeScreen() {
  const [section, setSection] = useState<MainTabKey>('inicio');

  return (
    <PhoneFrame section={section} onSectionChange={setSection}>
      {section === 'inicio' && <HomeSection onReportPress={() => setSection('reportes')} />}
      {section === 'reportes' && <ReportsSection />}
      {section === 'zonas' && <ZonesSection />}
      {section === 'perfil' && <ProfileSection />}
    </PhoneFrame>
  );
}

export default HomeScreen;
