import React from 'react';
import {Platform, Pressable, StyleSheet, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors, AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { shadow } from '@/shared/utils/shadows';

export type BottomTabItem = {
  label: string;
  icon: SymbolName;
  active?: boolean;
  onPress?: () => void;
};

export type BottomTabBarProps = {
  items: BottomTabItem[];
  fab?: {
    icon: SymbolName;
    onPress?: () => void;
    afterIndex?: number;
  };
};

const INACTIVE_COLOR = '#9CA3AF';
const BASE_HEIGHT = Platform.select({ ios: 50, android: 58, default: 60 });

export function BottomTabBar({ items, fab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const fabIndex = fab?.afterIndex ?? Math.floor(items.length / 2);

  return (
    <View
      style={[
        styles.bottomNav,
        { bottom: 0, height: (BASE_HEIGHT ?? 76) + insets.bottom, paddingBottom: insets.bottom },
      ]}>
      <View style={styles.bottomNavShadow} />
      {items.map((item, index) => {
        const isFabSlot = index === fabIndex;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <BottomTabButton {...item} />
            {isFabSlot && fab ? (
              <View style={styles.fabSlot}>
                <Pressable
                  accessibilityRole="button"
                  onPress={fab.onPress}
                  style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
                  <AppSymbol name={fab.icon} color="#FFFFFF" size={22} />
                </Pressable>
              </View>
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function BottomTabButton({ label, icon, active, onPress }: BottomTabItem) {
  const color = active ? BrandColors.primary : INACTIVE_COLOR;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.navItem}>
      <AppSymbol name={icon} color={color} size={22} />
      <AppText
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.9}
        style={[styles.navLabel, { color }, active && styles.navLabelActive]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#D9CFC5',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
  },
  bottomNavShadow: {
    ...StyleSheet.absoluteFillObject,
    ...shadow('lift'),
  },
  navItem: {
    flex: 1,
    maxWidth: 80,
    alignItems: 'center',
    gap: 1,
  },
  navLabel: {
    fontFamily: Fonts.label,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 13,
    includeFontPadding: false,
  },
  navLabelActive: {
    color: BrandColors.primary,
    fontWeight: '700',
  },
  fabSlot: {
    width: 50,
    height: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    top: -32,
    width: 56,
    height: 56,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: BrandColors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
    ...shadow('fab'),
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
