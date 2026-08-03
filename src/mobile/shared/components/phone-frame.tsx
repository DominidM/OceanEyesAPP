import React, { PropsWithChildren } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { BottomTabBar } from '@/shared/components/bottom-tab-bar';
import { getMainTabs, MAIN_FAB, MainTabKey } from '@/shared/config/main-tabs';
import { BrandColors, MaxPhoneWidth } from '@/constants/theme';
import { shadow } from '@/shared/utils/shadows';

type PhoneFrameProps = PropsWithChildren<{
  section: MainTabKey;
  onSectionChange: (key: MainTabKey) => void;
  onFabPress?: () => void;
}>;

export function PhoneFrame({ children, section, onSectionChange, onFabPress }: PhoneFrameProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MaxPhoneWidth);

  return (
    <View style={styles.screen}>
      {/* Eliminamos SafeAreaView superior para permitir diseño Edge-to-Edge */}
      <View style={[styles.phoneFrame, { maxWidth: contentWidth }]}>
        {children}
        <BottomTabBar
          items={getMainTabs(section, onSectionChange)}
          fab={onFabPress ? { ...MAIN_FAB, onPress: onFabPress } : MAIN_FAB}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    overflow: 'visible',
    alignItems: 'center',
    backgroundColor: BrandColors.tertiary,
  },
  phoneFrame: {
    flex: 1,
    position: 'relative',
    minHeight: 0,
    width: '100%',
    backgroundColor: BrandColors.tertiary,
    ...shadow('lift'),
  },
});