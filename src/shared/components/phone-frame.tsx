import React, { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors, MaxPhoneWidth } from '@/constants/theme';

type PhoneFrameProps = PropsWithChildren<{
  bottomBar?: ReactNode;
}>;

export function PhoneFrame({ children, bottomBar }: PhoneFrameProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MaxPhoneWidth);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={[styles.phoneFrame, { maxWidth: contentWidth }]}>
          {children}
          {bottomBar}
        </View>
      </SafeAreaView>
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
  safeArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
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
