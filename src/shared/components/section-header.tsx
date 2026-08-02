import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

type SectionHeaderProps = PropsWithChildren<{
  title: string;
}>;

export function SectionHeader({ title, children }: SectionHeaderProps) {
  const insets = useSafeAreaInsets();
  const hasChildren = children != null;

  return (
    <View
      style={[styles.header, { paddingTop: insets.top, height: (hasChildren ? 133 : 72) + insets.top }]}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>{title}</Text>
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
    height: 72,
    paddingTop: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  title: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 25,
    letterSpacing: -0.5,
  },
});
