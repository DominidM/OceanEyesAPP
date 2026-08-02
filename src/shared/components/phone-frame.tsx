import React, { PropsWithChildren } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { BottomTabBar } from '@/shared/components/bottom-tab-bar';
import { getMainTabs, MAIN_FAB, MainTabKey } from '@/shared/config/main-tabs';
import { BrandColors, MaxPhoneWidth } from '@/constants/theme';

type PhoneFrameProps = PropsWithChildren<{
  section: MainTabKey;
  onSectionChange: (key: MainTabKey) => void;
}>;

export function PhoneFrame({ children, section, onSectionChange }: PhoneFrameProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MaxPhoneWidth);

  return (
    <View style={styles.screen}>
      {/* Eliminamos SafeAreaView superior para permitir diseño Edge-to-Edge */}
      <View style={[styles.phoneFrame, { maxWidth: contentWidth }]}>
        {children}
        <BottomTabBar items={getMainTabs(section, onSectionChange)} fab={MAIN_FAB} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: BrandColors.tertiary,
  },
  phoneFrame: {
    flex: 1,
    position: 'relative',
    minHeight: 0,
    width: '100%',
    backgroundColor: BrandColors.tertiary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 10,
  },
});