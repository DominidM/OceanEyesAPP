import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { RewardsColors } from '../theme';

const backIcon: SymbolName = { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' };
const bellIcon: SymbolName = { ios: 'bell.fill', android: 'notifications', web: 'notifications' };

export function RewardsHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Pressable accessibilityRole="button" style={styles.sideBox}>
          <AppSymbol name={backIcon} color={BrandColors.neutral} size={22} />
        </Pressable>

        <Text style={styles.title}>Recompensas</Text>

        <View style={styles.sideBox}>
          <Pressable accessibilityRole="button" style={styles.bellButton}>
            <AppSymbol name={bellIcon} color={BrandColors.primary} size={20} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 72,
    borderBottomWidth: 1,
    borderBottomColor: RewardsColors.border,
    backgroundColor: 'rgba(239, 235, 227, 0.95)',
    zIndex: 2,
  },
  headerTop: {
    height: 72,
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RewardsColors.surfaceMuted,
  },
});
