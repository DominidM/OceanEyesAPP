import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';

type ActionCardProps = {
  title: string;
  subtitle: string;
  color: string;
  icon: SymbolName;
  helperIcon: SymbolName;
  height?: number;
  onPress?: () => void;
};

export function ActionCard({
  title,
  subtitle,
  color,
  icon,
  helperIcon,
  height = 145,
  onPress,
}: ActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        { backgroundColor: color, height },
        pressed && styles.pressed,
      ]}>
      <View style={styles.actionCopy}>
        <View>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.actionIconRow}>
          <AppSymbol name={helperIcon} color={BrandColors.tertiary} size={22} />
          <AppSymbol
            name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_right_alt' }}
            color={BrandColors.tertiary}
            size={18}
          />
        </View>
      </View>

      <View style={styles.actionIconBox}>
        <AppSymbol name={icon} color={BrandColors.tertiary} size={44} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    height: 145,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  actionCopy: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 25,
    letterSpacing: 0.5,
  },
  actionSubtitle: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  actionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionIconBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});
