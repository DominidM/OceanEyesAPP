import React, { ComponentProps, useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { useAdminTheme } from '@admin/theme/context';

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: Record<string, any>;
}) {
  const { colors } = useAdminTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useAdminTheme();
  return <Text style={[styles.title, { color: colors.contentText }]}>{children}</Text>;
}

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode[];
};

export function SectionHeader({ title, subtitle, actions }: SectionHeaderProps) {
  const { colors, mode } = useAdminTheme();
  const isDark = mode === 'dark';
  const barBg = isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const actionsBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(19,78,94,0.05)';
  return (
    <View
      style={[
        styles.sectionHeader,
        { backgroundColor: barBg, borderColor: colors.cardBorder },
      ]}
    >
      <View style={styles.sectionHeaderText}>
        <Text style={[styles.sectionHeaderTitle, { color: colors.contentText }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.sectionHeaderSubtitle, { color: colors.contentTextMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {actions && actions.length > 0 ? (
        <View style={[styles.sectionHeaderActions, { backgroundColor: actionsBg, borderColor: colors.cardBorder }]}>
          {actions.map((a, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={[styles.actionDivider, { backgroundColor: colors.cardBorder }]} />}
              {a}
            </React.Fragment>
          ))}
        </View>
      ) : null}
    </View>
  );
}

type BadgeProps = {
  label: string;
  color: string;
  bg: string;
};

export function Badge({ label, color, bg }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: Record<string, any>;
};

export function Button({ label, onPress, variant = 'primary', style }: ButtonProps) {
  const { colors } = useAdminTheme();
  const { View: RNView, Pressable } = require('react-native');

  const variants: Record<ButtonVariant, { bg: string; border: string; text: string }> = {
    primary: { bg: colors.primary, border: colors.primary, text: colors.primaryText },
    secondary: { bg: 'transparent', border: colors.primary, text: colors.primary },
    danger: { bg: colors.dangerBg, border: colors.dangerBg, text: colors.danger },
  };
  const v = variants[variant];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.btn, { backgroundColor: v.bg, borderColor: v.border, borderWidth: variant === 'secondary' ? 1 : 0 }, style]}
    >
      <Text style={[styles.btnLabel, { color: v.text }]}>{label}</Text>
    </Pressable>
  );
}

type IconButtonProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress?: () => void;
  color?: string;
  label?: string;
  style?: Record<string, any>;
};

export function IconButton({ icon, onPress, color, label, style }: IconButtonProps) {
  const { colors } = useAdminTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.iconBtn, style]}
      accessibilityLabel={label}
    >
      <MaterialCommunityIcons name={icon} size={18} color={color ?? colors.contentTextMuted} />
    </Pressable>
  );
}

export function KpiStat({ value, label, color }: { value: string | number; label: string; color?: string }) {
  const { colors } = useAdminTheme();
  return (
    <View style={[styles.kpi, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Text style={[styles.kpiValue, { color: color ?? colors.primary }]}>{value}</Text>
      <Text style={[styles.kpiLabel, { color: colors.contentTextMuted }]}>{label}</Text>
    </View>
  );
}

export function PaginationFooter({
  start,
  end,
  total,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  loading,
}: {
  start: number;
  end: number;
  total: number;
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  loading?: boolean;
}) {
  const { colors } = useAdminTheme();
  return (
    <View style={[styles.paginationFooter, { borderTopColor: colors.cardBorder }]}>
      <Text style={[styles.paginationResults, { color: colors.contentTextMuted }]}>
        Resultados {start}–{end} de {total}
      </Text>
      <View style={styles.paginationActions}>
        <IconButton
          icon="chevron-left"
          label="Anterior"
          color={currentPage <= 1 ? colors.contentTextMuted : colors.contentText}
          onPress={currentPage > 1 ? onPrev : undefined}
        />
        <Text style={[styles.paginationCounter, { color: colors.contentTextMuted }]}>
          {currentPage} / {totalPages}
        </Text>
        <IconButton
          icon="chevron-right"
          label="Siguiente"
          color={currentPage >= totalPages ? colors.contentTextMuted : colors.contentText}
          onPress={currentPage < totalPages ? onNext : undefined}
        />
      </View>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
}) {
  const { colors } = useAdminTheme();
  return (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name={icon} size={40} color={colors.contentTextMuted} />
      <Text style={[styles.emptyStateTitle, { color: colors.contentTextMuted }]}>{title}</Text>
      <Text style={[styles.emptyStateDesc, { color: colors.contentTextMuted }]}>{description}</Text>
    </View>
  );
}

export function LoadingState({ label }: { label?: string }) {
  const { colors } = useAdminTheme();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0.35, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fade]);

  return (
    <View style={styles.loadingState}>
      <Animated.View style={{ opacity: fade }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Animated.View>
      {label ? (
        <Text style={[styles.loadingLabel, { color: colors.contentTextMuted }]}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.four,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  sectionHeaderText: {
    flex: 1,
    gap: Spacing.one,
  },
  sectionHeaderTitle: {
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionHeaderSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: 999,
    padding: Spacing.one,
  },
  actionDivider: {
    width: 1,
    height: 20,
    marginHorizontal: Spacing.one,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  badgeLabel: {
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
  },
  btn: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    cursor: 'pointer',
  },
  btnLabel: {
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  kpi: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  kpiValue: {
    fontFamily: Fonts.headline,
    fontSize: 32,
    fontWeight: '700',
  },
  kpiLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
  },
  paginationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
  },
  paginationResults: {
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  paginationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  paginationCounter: {
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
  emptyStateTitle: {
    fontFamily: Fonts.headline,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateDesc: {
    fontFamily: Fonts.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingState: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  loadingLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
  },
});
