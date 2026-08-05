import React, { useEffect, useRef, useState } from 'react';
import { Animated, DimensionValue, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { useBottomSheetModal } from '@/shared/hooks/use-bottom-sheet-modal';
import { shadow } from '@/shared/utils/shadows';

import { TUTORIAL_STEPS } from '../data/tutorial';
import { RewardsColors } from '../theme';

type RewardsTutorialProps = {
  visible: boolean;
  onClose: () => void;
};

export function RewardsTutorial({ visible, onClose }: RewardsTutorialProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const total = TUTORIAL_STEPS.length;
  const current = TUTORIAL_STEPS[step];

  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(18)).current;
  const { backdropOpacity, translateY, rendered, close } = useBottomSheetModal(visible, onClose);

  useEffect(() => {
    if (!visible) return;
    setStep(0);
    fade.setValue(0);
    translate.setValue(18);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start();
  }, [visible, fade, translate]);

  const animateStep = () => {
    fade.setValue(0);
    translate.setValue(18);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start();
  };

  const goNext = () => {
    if (step >= total - 1) {
      close();
      return;
    }
    setStep((s) => s + 1);
    animateStep();
  };

  const goPrev = () => {
    if (step <= 0) return;
    setStep((s) => s - 1);
    animateStep();
  };

  const progress: DimensionValue = `${((step + 1) / total) * 100}%`;

  return (
    <Modal visible={rendered} transparent animationType="none" onRequestClose={close}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar tutorial"
          onPress={close}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 24 },
            {
              transform: [
                { translateY: translateY.interpolate({ inputRange: [0, 1], outputRange: [0, height] }) },
              ],
            },
          ]}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <AppSymbol name={{ ios: 'sparkles', android: 'auto-awesome', web: 'auto-awesome' }} color="#FFFFFF" size={18} />
              <Text style={styles.headerTitle}>Cómo funciona</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar tutorial"
              onPress={close}
              hitSlop={8}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <AppSymbol name={{ ios: 'xmark', android: 'close', web: 'close' }} color="#FFFFFF" size={18} />
            </Pressable>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.stepLabel}>
              Paso {step + 1} de {total}
            </Text>
            <View style={styles.dots}>
              {TUTORIAL_STEPS.map((item, index) => (
                <View key={item.id} style={[styles.dot, index === step && styles.dotActive]} />
              ))}
            </View>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: progress }]} />
          </View>

          <Animated.View style={[styles.step, { opacity: fade, transform: [{ translateY: translate }] }]}>
            <View style={styles.iconCircle}>
              <AppSymbol name={current.icon} color={RewardsColors.accent} size={40} />
            </View>
            <Text style={styles.stepTitle}>{current.title}</Text>
            <Text style={styles.stepBody}>{current.body}</Text>
          </Animated.View>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              disabled={step === 0}
              onPress={goPrev}
              style={({ pressed }) => [styles.prevButton, step === 0 && styles.prevDisabled, pressed && styles.pressed]}>
              <Text style={[styles.prevLabel, step === 0 && styles.prevLabelDisabled]}>Anterior</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={goNext}
              style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}>
              <Text style={styles.nextLabel}>{step === total - 1 ? 'Entendido' : 'Siguiente'}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    ...shadow('lift'),
  },
  grabber: {
    width: 40,
    height: 0,
    alignSelf: 'center',
    marginTop: 0,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: RewardsColors.cardSolid,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 34,
    includeFontPadding: false,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  stepLabel: {
    color: RewardsColors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    includeFontPadding: false,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(19, 78, 94, 0.2)',
  },
  dotActive: {
    width: 18,
    backgroundColor: RewardsColors.accent,
  },
  track: {
    height: 4,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(19, 78, 94, 0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 9999,
    backgroundColor: RewardsColors.accent,
  },
  step: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 12,
  },
  iconCircle: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: 'rgba(19, 78, 94, 0.1)',
  },
  stepTitle: {
    marginTop: 24,
    color: '#2C2C2C',
    fontFamily: Fonts.headline,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    textAlign: 'center',
    includeFontPadding: false,
  },
  stepBody: {
    marginTop: 12,
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  prevButton: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(19, 78, 94, 0.3)',
    borderRadius: 9999,
  },
  prevDisabled: {
    opacity: 0.4,
  },
  prevLabel: {
    color: RewardsColors.accent,
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    includeFontPadding: false,
  },
  prevLabelDisabled: {
    color: 'rgba(44, 44, 44, 0.35)',
  },
  nextButton: {
    flex: 1.6,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: RewardsColors.accent,
    ...shadow('card'),
  },
  nextLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
