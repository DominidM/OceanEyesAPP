import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabBar } from '@/shared/components/bottom-tab-bar';
import { PhoneFrame } from '@/shared/components/phone-frame';
import { getMainTabs } from '@/shared/config/main-tabs';
import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <PhoneFrame bottomBar={<BottomTabBar items={getMainTabs('perfil')} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Tu cuenta y configuracion</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Proximamente</Text>
          <Text style={styles.placeholderText}>
            El perfil del pescador estara disponible en una proxima version.
          </Text>
        </View>
      </ScrollView>
    </PhoneFrame>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  header: {
    height: 110,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: BrandColors.tertiary,
    justifyContent: 'center',
    gap: Spacing.one,
  },
  title: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 35,
  },
  subtitle: {
    color: 'rgba(44, 44, 44, 0.62)',
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  body: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  placeholderCard: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    padding: Spacing.four,
    gap: Spacing.two,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  placeholderTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  placeholderText: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  },
});
