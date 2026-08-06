import React, { PropsWithChildren } from 'react';
import {StyleSheet, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

type SectionHeaderProps = PropsWithChildren<{
  title: string;
  right?: React.ReactNode;
}>;

export function SectionHeader({ title, children, right }: SectionHeaderProps) {
  const insets = useSafeAreaInsets();
  const hasChildren = children != null;

  return (
    <View
      style={[styles.header, { paddingTop: insets.top, height: (hasChildren ? 113 : 72) + insets.top }]}>
      <View style={styles.headerTop}>
        <AppText style={styles.title}>{title}</AppText>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#D9CFC5',
    backgroundColor: 'rgba(239, 235, 227, 0.95)',
    zIndex: 2,
  },
  headerTop: {
    height: 62,
    paddingTop: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 25,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
});
