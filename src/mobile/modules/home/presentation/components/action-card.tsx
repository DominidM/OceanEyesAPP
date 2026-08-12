import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { shadow } from '@/shared/utils/shadows';

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
          <AppText style={styles.actionTitle}>{title}</AppText>
          <AppText style={styles.actionSubtitle}>{subtitle}</AppText>
        </View>

        <View style={styles.actionIconRow}>
          <AppSymbol name={helperIcon} color={BrandColors.tertiary} size={22} />
          <AppSymbol
            name={{ ios: 'arrow.right', android: 'arrow-forward', web: 'arrow-right-alt' }}
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
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    ...shadow('card'),
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
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  actionSubtitle: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    includeFontPadding: false,
  },
  actionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionIconBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});
