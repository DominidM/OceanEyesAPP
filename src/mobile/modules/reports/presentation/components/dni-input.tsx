import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppFonts as Fonts } from '@/constants/theme';
import { shadow } from '@/shared/utils/shadows';

import { ReportFlowColors as C } from '../theme';

type DniInputProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function DniInput({ value, onChangeText }: DniInputProps) {
  return (
    <View style={styles.input}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Número de DNI"
        placeholderTextColor={C.placeholder}
        keyboardType="number-pad"
        maxLength={8}
        style={styles.field}
        textAlign="center"
        accessibilityLabel="Número de DNI"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 64,
    backgroundColor: C.surface,
    borderRadius: 24,
    justifyContent: 'center',
    ...shadow('subtle'),
  },
  field: {
    fontFamily: Fonts.body,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2.4,
    lineHeight: 28,
    color: C.textStrong,
    includeFontPadding: false,
    paddingVertical: 0,
  },
});
