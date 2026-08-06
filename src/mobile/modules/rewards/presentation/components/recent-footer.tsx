import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';

import { ActivityRow } from './activity-row';
import type { ActivityItem } from '../data/rewards';
import { RewardsColors } from '../theme';

const personIcon: SymbolName = { ios: 'person.fill', android: 'person', web: 'person' };

type RecentFooterProps = {
  items: ActivityItem[];
  guest?: boolean;
  onSeeAll?: () => void;
  onLogin?: () => void;
};

export function RecentFooter({ items, guest = false, onSeeAll, onLogin }: RecentFooterProps) {
  const showEmpty = items.length === 0;

  return (
    <View style={styles.footer}>
      <View style={styles.headingRow}>
        <AppText style={styles.heading}>Actividad reciente</AppText>
        {!showEmpty && onSeeAll ? (
          <Pressable accessibilityRole="button" onPress={onSeeAll} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
            <AppText style={styles.linkText}>Ver todo</AppText>
          </Pressable>
        ) : null}
      </View>

      {showEmpty ? (
        <View style={styles.emptyRow}>
          <View style={styles.avatar}>
            <AppSymbol name={personIcon} color="#6D625B" size={14} />
          </View>
          <AppText style={styles.emptyText}>
            {guest ? 'Inicia sesión para ver tu actividad de puntos.' : 'Aún no hay actividad de puntos.'}
          </AppText>
          {guest && onLogin ? (
            <Pressable
              accessibilityRole="button"
              onPress={onLogin}
              style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
              <AppText style={styles.loginButtonLabel}>Iniciar sesión</AppText>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View>
          {items.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 24,
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: RewardsColors.border,
    backgroundColor: RewardsColors.surface,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    color: RewardsColors.textBottom,
    fontFamily: Fonts.label,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  link: {
    paddingVertical: 4,
  },
  linkText: {
    color: RewardsColors.accent,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  avatar: {
    width: 39.2,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44, 44, 44, 0.08)',
  },
  emptyText: {
    flex: 1,
    color: RewardsColors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  loginButton: {
    height: 36,
    borderRadius: 9999,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
  },
  loginButtonLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.78,
  },
});
