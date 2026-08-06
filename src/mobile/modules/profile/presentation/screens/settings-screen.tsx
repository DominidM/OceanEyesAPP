import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { shadow } from '@/shared/utils/shadows';

const backIcon: SymbolName = { ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' };
const chevronIcon: SymbolName = { ios: 'chevron.right', android: 'chevron-right', web: 'chevron-right' };
const editIcon: SymbolName = { ios: 'square.and.pencil', android: 'edit', web: 'edit' };
const lockIcon: SymbolName = { ios: 'lock.fill', android: 'lock', web: 'lock' };
const bellIcon: SymbolName = { ios: 'bell.fill', android: 'notifications', web: 'notifications' };
const eyeIcon: SymbolName = { ios: 'eye.fill', android: 'visibility', web: 'visibility' };
const syncIcon: SymbolName = { ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' };
const trashIcon: SymbolName = { ios: 'trash.fill', android: 'delete', web: 'delete' };
const docIcon: SymbolName = { ios: 'doc.text.fill', android: 'article', web: 'article' };
const shieldIcon: SymbolName = { ios: 'shield.fill', android: 'security', web: 'security' };
const infoIcon: SymbolName = { ios: 'info.circle.fill', android: 'info', web: 'info' };

type SettingRowProps = {
  icon: SymbolName;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
};

function SettingRow({ icon, label, value, onPress, right }: SettingRowProps) {
  const content = (
    <>
      <View style={styles.iconCircle}>
        <AppSymbol name={icon} color={BrandColors.primary} size={16} />
      </View>
      <Text style={styles.settingLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.settingRight}>
        {right}
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        {onPress && !right ? <AppSymbol name={chevronIcon} color={BrandColors.primary} size={16} /> : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }
  return <View style={styles.settingRow}>{content}</View>;
}

function GroupLabel({ title }: { title: string }) {
  return (
    <View style={styles.groupLabel}>
      <Text style={styles.groupLabelText}>{title}</Text>
    </View>
  );
}

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifNear, setNotifNear] = useState(true);
  const [notifStatus, setNotifStatus] = useState(true);
  const [anonDefault, setAnonDefault] = useState(false);

  const switchTone = { trackColor: { false: '#D9CFC5', true: BrandColors.primary }, thumbColor: '#FFFFFF' };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <AppSymbol name={backIcon} color={BrandColors.primary} size={22} />
        </Pressable>
        <Text style={styles.topBarTitle}>Configuración</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        <View style={styles.card}>
          <GroupLabel title="Cuenta" />
          <SettingRow icon={editIcon} label="Editar perfil" onPress={() => {}} />
          <SettingRow icon={lockIcon} label="Cambiar contraseña" onPress={() => {}} />

          <GroupLabel title="Notificaciones" />
          <SettingRow
            icon={bellIcon}
            label="Alertas de reportes cercanos"
            right={<Switch value={notifNear} onValueChange={setNotifNear} {...switchTone} />}
          />
          <SettingRow
            icon={bellIcon}
            label="Estado de mis reportes"
            right={<Switch value={notifStatus} onValueChange={setNotifStatus} {...switchTone} />}
          />

          <GroupLabel title="Reportes" />
          <SettingRow
            icon={eyeIcon}
            label="Anonimato por defecto"
            right={<Switch value={anonDefault} onValueChange={setAnonDefault} {...switchTone} />}
          />

          <GroupLabel title="Datos y privacidad" />
          <SettingRow icon={syncIcon} label="Sincronizar pendientes" value="2 en cola" onPress={() => {}} />
          <SettingRow icon={trashIcon} label="Borrar datos locales" onPress={() => {}} />

          <GroupLabel title="Legal" />
          <SettingRow icon={docIcon} label="Términos y condiciones" onPress={() => {}} />
          <SettingRow icon={shieldIcon} label="Política de privacidad" onPress={() => {}} />
          <SettingRow icon={infoIcon} label="Versión" value="1.0.0" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.tertiary,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D9CFC5',
    backgroundColor: 'rgba(239, 235, 227, 0.95)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  topBarSpacer: {
    width: 40,
  },
  card: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 4,
    ...shadow('subtle'),
  },
  groupLabel: {
    paddingTop: 12,
    paddingBottom: 2,
  },
  groupLabelText: {
    color: 'rgba(44, 44, 44, 0.45)',
    fontFamily: Fonts.label,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 78, 94, 0.1)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  settingLabel: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
    includeFontPadding: false,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    color: 'rgba(44, 44, 44, 0.55)',
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: '500',
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
