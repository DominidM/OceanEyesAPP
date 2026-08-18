import React, { forwardRef } from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, type ScrollViewProps} from 'react-native';

type KeyboardScrollViewProps = ScrollViewProps;

export const KeyboardScrollView = forwardRef<ScrollView, KeyboardScrollViewProps>(function KeyboardScrollView(
  {
    style,
    contentContainerStyle,
    keyboardShouldPersistTaps = 'handled',
    showsVerticalScrollIndicator = false,
    children,
    ...rest
  },
  ref,
) {
  if (Platform.OS === 'ios') {
    return (
      <ScrollView
        ref={ref}
        style={style}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        automaticallyAdjustKeyboardInsets
        {...rest}>
        {children}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={style} behavior="height">
      <ScrollView
        ref={ref}
        style={styles.scroll}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        {...rest}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
});
