import React, { useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
};

export function SelectField({ label, value, onChange, options, placeholder, disabled }: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  const select = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  const isDisabled = disabled || options.length === 0;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.trigger, isDisabled && styles.triggerDisabled]}
        onPress={() => {
          if (!isDisabled) setOpen(true);
        }}
        disabled={isDisabled}
      >
        <Text style={[styles.value, !value && styles.placeholder, isDisabled && styles.valueDisabled]}>
          {value || placeholder || 'Seleccionar…'}
        </Text>
        {isDisabled ? (
          <FontAwesome5 name="lock" size={12} color={BrandColors.secondary} />
        ) : (
          <FontAwesome5 name="chevron-down" size={12} color={BrandColors.neutral} />
        )}
      </Pressable>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <FontAwesome5 name="times" size={14} color={BrandColors.neutral} />
              </Pressable>
            </View>
            <ScrollView style={styles.sheetList} contentContainerStyle={styles.sheetListContent}>
              {options.map((option) => {
                const selected = option === value;
                return (
                  <Pressable
                    key={option}
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => select(option)}
                  >
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                      {option}
                    </Text>
                    {selected && (
                      <FontAwesome5 name="check" size={12} color={BrandColors.primary} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    fontFamily: Fonts.headline,
    fontSize: 15,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.tertiary,
    borderRadius: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
    cursor: 'pointer',
  },
  value: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: BrandColors.neutral,
  },
  placeholder: {
    color: 'rgba(0,0,0,0.35)',
  },
  triggerDisabled: {
    opacity: 0.55,
  },
  valueDisabled: {
    color: BrandColors.secondary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(152,185,177,0.25)',
    backgroundColor: '#FFFFFF',
  },
  sheetTitle: {
    fontFamily: Fonts.headline,
    fontSize: 16,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  sheetList: {
    flexGrow: 0,
  },
  sheetListContent: {
    paddingVertical: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three - 2,
  },
  optionSelected: {
    backgroundColor: 'rgba(152,185,177,0.18)',
  },
  optionLabel: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: BrandColors.neutral,
  },
  optionLabelSelected: {
    color: BrandColors.primary,
    fontWeight: '700',
  },
});
