import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors, AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';

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

export function BottomTabBar({ items, fab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const fabIndex = fab?.afterIndex ?? Math.floor(items.length / 2);

  return (
    <View style={[styles.bottomNav, { bottom: insets.bottom - 32.8 }]}>
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
                  <AppSymbol name={fab.icon} color="#FFFFFF" size={24} />
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
      <AppSymbol name={icon} color={color} size={25} />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.9}
        style={[styles.navLabel, { color }, active && styles.navLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 84,
    paddingHorizontal: 16,
    paddingVertical: 28,
    borderTopWidth: 1,
    borderTopColor: '#D9CFC5',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  bottomNavShadow: {
    ...StyleSheet.absoluteFillObject,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
  },
  navItem: {
    flex: 1,
    maxWidth: 80,
    alignItems: 'center',
    gap: 1,
  },
  navLabel: {
    fontFamily: Fonts.label,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  navLabelActive: {
    color: BrandColors.primary,
    fontWeight: '700',
  },
  fabSlot: {
    width: 56,
    height: 24,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    top: -38,
    width: 64,
    height: 64,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: BrandColors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
