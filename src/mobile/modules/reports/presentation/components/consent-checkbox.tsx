import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';

import { ReportFlowColors as C } from '../theme';

type ConsentCheckboxProps = {
  checked: boolean;
  onToggle: () => void;
  label: string;
};

export function ConsentCheckbox({ checked, onToggle, label }: ConsentCheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? (
          <AppSymbol name={{ ios: 'checkmark', android: 'check', web: 'check' }} color="#FFFFFF" size={14} />
        ) : null}
      </View>
      <AppText style={styles.label}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 16,
    paddingHorizontal: 15,
    backgroundColor: C.surface,
    borderRadius: 24,
  },
  pressed: {
    opacity: 0.78,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  label: {
    flex: 1,
    color: C.textStrong,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    includeFontPadding: false,
  },
});
