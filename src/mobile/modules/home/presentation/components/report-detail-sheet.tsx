import React from 'react';
import {Animated, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { useBottomSheetModal } from '@/shared/hooks/use-bottom-sheet-modal';
import { shadow } from '@/shared/utils/shadows';
import { REPORT_CATEGORIES, type ReportStatus } from '@/shared/firebase/types';

import { CATEGORY_COLORS, type MapReport } from './map-report';

type ReportDetailSheetProps = {
  report: MapReport | null;
  onClose: () => void;
};

const STATUS_META: Record<ReportStatus, { label: string; bg: string; text: string }> = {
  pendiente: { label: 'Pendiente', bg: '#FEF3C7', text: '#B45309' },
  en_revision: { label: 'En revisión', bg: '#DBEAFE', text: '#1D4ED8' },
  verificado: { label: 'Verificado', bg: '#D1FAE5', text: '#047857' },
  descartado: { label: 'Descartado', bg: '#FEE2E2', text: '#991B1B' },
};

export function ReportDetailSheet({ report, onClose }: ReportDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const visible = report != null;
  const { backdropOpacity, translateY, rendered, close } = useBottomSheetModal(visible, onClose);

  if (!visible) return null;

  const status = STATUS_META[report.status] ?? STATUS_META.pendiente;
  const categoryLabel = REPORT_CATEGORIES[report.category]?.label ?? report.category;
  const date = new Date(report.createdAt).toLocaleDateString();

  const sheetTranslate = translateY.interpolate({ inputRange: [0, 1], outputRange: [0, height] });

  return (
    <Modal visible={rendered} transparent animationType="none" onRequestClose={close}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar detalle"
            onPress={close}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 20, transform: [{ translateY: sheetTranslate }] }]}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <View style={styles.categoryRow}>
              <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[report.category] }]} />
              <AppText style={styles.categoryLabel}>{categoryLabel}</AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar detalle"
              onPress={close}
              hitSlop={8}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <AppSymbol name={{ ios: 'xmark', android: 'close', web: 'close' }} color={BrandColors.neutral} size={18} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <AppText style={styles.title}>{report.title}</AppText>

            <View style={styles.metaRow}>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <AppText style={[styles.statusText, { color: status.text }]}>{status.label}</AppText>
              </View>
              <View style={styles.dateRow}>
                <AppSymbol
                  name={{ ios: 'calendar', android: 'calendar-today', web: 'calendar-today' }}
                  color="rgba(44, 44, 44, 0.6)"
                  size={15}
                />
                <AppText style={styles.dateText}>{date}</AppText>
              </View>
            </View>

            <View style={styles.addressRow}>
              <AppSymbol
                name={{ ios: 'mappin.and.ellipse', android: 'location-on', web: 'location-on' }}
                color={BrandColors.primary}
                size={16}
              />
              <AppText style={styles.addressText}>{report.address ?? 'Ubicación confirmada'}</AppText>
            </View>

            {report.description ? (
              <View style={styles.descriptionBlock}>
                <AppText style={styles.descriptionLabel}>Detalle</AppText>
                <AppText style={styles.descriptionText}>{report.description}</AppText>
              </View>
            ) : null}
          </ScrollView>
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
    maxHeight: '72%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    ...shadow('lift'),
  },
  grabber: {
    width: 40,
    height: 4,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryLabel: {
    color: 'rgba(44, 44, 44, 0.7)',
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    includeFontPadding: false,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: 'rgba(19, 78, 94, 0.1)',
  },
  title: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.27,
    paddingHorizontal: 20,
    paddingTop: 8,
    includeFontPadding: false,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: {
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    includeFontPadding: false,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: 'rgba(44, 44, 44, 0.6)',
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    includeFontPadding: false,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  addressText: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
  },
  descriptionBlock: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: BrandColors.tertiary,
  },
  descriptionLabel: {
    color: 'rgba(44, 44, 44, 0.55)',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 6,
    includeFontPadding: false,
  },
  descriptionText: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
