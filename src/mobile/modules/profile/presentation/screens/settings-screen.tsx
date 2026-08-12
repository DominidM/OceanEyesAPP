import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { AppText } from '@/shared/components/app-text';
import { useAuth } from '@/shared/firebase/auth-context';
import { clearLocalData } from '@/shared/offline/clear-data';
import { useSync } from '@/shared/offline/sync-context';
import { requestNotificationPermission } from '@/shared/notifications/notification-bridge';
import { usePreferences, type FontScaleOption } from '@/shared/settings/preferences';
import { shadow } from '@/shared/utils/shadows';

const backIcon: SymbolName = { ios: 'chevron.left', android: 'arrow-back', web: 'arrow-back' };
const chevronIcon: SymbolName = { ios: 'chevron.right', android: 'chevron-right', web: 'chevron-right' };
const editIcon: SymbolName = { ios: 'square.and.pencil', android: 'edit', web: 'edit' };
const linkIcon: SymbolName = { ios: 'link.circle.fill', android: 'link', web: 'link' };
const lockIcon: SymbolName = { ios: 'lock.fill', android: 'lock', web: 'lock' };
const bellIcon: SymbolName = { ios: 'bell.fill', android: 'notifications', web: 'notifications' };
const locationIcon: SymbolName = { ios: 'location.fill', android: 'location-on', web: 'location-on' };
const cameraIcon: SymbolName = { ios: 'camera.fill', android: 'camera-alt', web: 'camera-alt' };
const microphoneIcon: SymbolName = { ios: 'mic.fill', android: 'mic', web: 'mic' };
const galleryIcon: SymbolName = { ios: 'photo.fill', android: 'photo-library', web: 'photo-library' };
const textSizeIcon: SymbolName = { ios: 'textformat.size', android: 'format-size', web: 'format-size' };
const fontIcon: SymbolName = { ios: 'textformat', android: 'font-download', web: 'font-download' };
const motionIcon: SymbolName = { ios: 'slowmo', android: 'slow-motion-video', web: 'slow-motion-video' };
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
      <AppText style={styles.settingLabel} numberOfLines={1}>
        {label}
      </AppText>
      <View style={styles.settingRight}>
        {right}
        {value ? <AppText style={styles.settingValue}>{value}</AppText> : null}
        {onPress && !right ? <AppSymbol name={chevronIcon} color={BrandColors.primary} size={16} /> : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
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
      <AppText style={styles.groupLabelText}>{title}</AppText>
    </View>
  );
}

type Option<T> = { value: T; label: string };

function OptionGroup<T extends string | number>({
  options,
  selected,
  onSelect,
  accessibilityLabel,
}: {
  options: readonly Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
  accessibilityLabel: string;
}) {
  return (
    <View
      style={styles.optionRow}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onSelect(option.value)}
            style={({ pressed }) => [
              styles.optionButton,
              active && styles.optionButtonActive,
              pressed && styles.pressed,
            ]}>
            <AppText style={[styles.optionLabel, active && styles.optionLabelActive]}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function gateToLogin(onDone: () => void) {
  Alert.alert('Inicia sesión', 'Esta opción requiere iniciar sesión con tu cuenta.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Ir a iniciar sesión', onPress: onDone },
  ]);
}

const FONT_SCALE_OPTIONS: readonly Option<FontScaleOption>[] = [
  { value: 1, label: 'Normal' },
  { value: 1.15, label: 'Grande' },
  { value: 1.3, label: 'Muy grande' },
];

const FONT_FAMILY_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
];

type AppPermission = 'notifications' | 'location' | 'camera' | 'microphone' | 'gallery';
type PermissionState = { granted: boolean; canAskAgain: boolean };

const PERMISSION_LABELS: Record<AppPermission, string> = {
  notifications: 'Notificaciones y alarmas',
  location: 'Ubicación',
  camera: 'Cámara',
  microphone: 'Micrófono y audio',
  gallery: 'Fotos y galería',
};

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifyNear,
    notifyStatus,
    reduceMotion,
    fontScale,
    fontFamily,
    setPreference,
  } = usePreferences();
  const { syncing, pendingCount, lastError, requestSync } = useSync();
  const [clearing, setClearing] = useState(false);
  const [permissions, setPermissions] = useState<Partial<Record<AppPermission, PermissionState>>>({});
  const [permissionBusy, setPermissionBusy] = useState<AppPermission | null>(null);

  const refreshPermissions = useCallback(async () => {
    const [notifications, location, camera, microphone, gallery] = await Promise.all([
      Notifications.getPermissionsAsync(),
      Location.getForegroundPermissionsAsync(),
      ImagePicker.getCameraPermissionsAsync(),
      getRecordingPermissionsAsync(),
      ImagePicker.getMediaLibraryPermissionsAsync(),
    ]);
    setPermissions({ notifications, location, camera, microphone, gallery });
  }, []);

  useEffect(() => {
    void refreshPermissions();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshPermissions();
    });
    return () => subscription.remove();
  }, [refreshPermissions]);

  const switchTone = { trackColor: { false: '#D9CFC5', true: BrandColors.primary }, thumbColor: '#FFFFFF' };

  const syncValue = syncing ? 'Sincronizando' : pendingCount > 0 ? `${pendingCount} en cola` : 'Al día';

  const handleEditProfile = () => {
    if (!user) {
      gateToLogin(() => router.replace('/mobile/login'));
      return;
    }
    router.push('/mobile/edit-profile');
  };

  const handleChangePassword = () => {
    if (!user) {
      gateToLogin(() => router.replace('/mobile/login'));
      return;
    }
    router.push('/mobile/change-password');
  };

  const handleClearData = () => {
    Alert.alert('Borrar datos locales', 'Se eliminarán los reportes pendientes y datos guardados en este dispositivo. Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          setClearing(true);
          await clearLocalData();
          setClearing(false);
          Alert.alert('Listo', 'Los datos locales se eliminaron correctamente.');
        },
      },
    ]);
  };

  const handleNotificationToggle = async (key: 'notifyNear' | 'notifyStatus', value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Notificaciones desactivadas',
          'Activa las notificaciones en los ajustes del sistema para recibir avisos de OceanEyes.',
        );
        return;
      }
    }
    await setPreference(key, value);
  };

  const requestPermission = async (permission: AppPermission) => {
    const current = permissions[permission];
    if (current?.granted || current?.canAskAgain === false) {
      await Linking.openSettings();
      return;
    }
    setPermissionBusy(permission);
    try {
      if (permission === 'notifications') await Notifications.requestPermissionsAsync();
      if (permission === 'location') await Location.requestForegroundPermissionsAsync();
      if (permission === 'camera') await ImagePicker.requestCameraPermissionsAsync();
      if (permission === 'microphone') await requestRecordingPermissionsAsync();
      if (permission === 'gallery') await ImagePicker.requestMediaLibraryPermissionsAsync();
      await refreshPermissions();
    } finally {
      setPermissionBusy(null);
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <AppSymbol name={backIcon} color={BrandColors.primary} size={22} />
        </Pressable>
        <AppText style={styles.topBarTitle}>Configuración</AppText>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.card}>
          <GroupLabel title="Cuenta" />
          <SettingRow icon={editIcon} label="Editar perfil" onPress={handleEditProfile} />
          {user?.isAnonymous ? (
            <SettingRow
              icon={linkIcon}
              label="Vincular cuenta"
              value="Conservar mis puntos"
              onPress={() => router.replace('/mobile/login')}
            />
          ) : null}
          <SettingRow icon={lockIcon} label="Cambiar contraseña" onPress={handleChangePassword} />

          <GroupLabel title="Permisos del dispositivo" />
          {([
            ['notifications', bellIcon],
            ['location', locationIcon],
            ['camera', cameraIcon],
            ['microphone', microphoneIcon],
            ['gallery', galleryIcon],
          ] as const).map(([permission, icon]) => {
            const state = permissions[permission];
            const value = permissionBusy === permission
              ? 'Comprobando...'
              : state?.granted
                ? 'Permitido'
                : state?.canAskAgain === false
                  ? 'Abrir ajustes'
                  : 'Activar';
            return (
              <SettingRow
                key={permission}
                icon={icon}
                label={PERMISSION_LABELS[permission]}
                value={value}
                onPress={() => void requestPermission(permission)}
              />
            );
          })}

          <GroupLabel title="Notificaciones" />
          <SettingRow
            icon={bellIcon}
            label="Alertas de reportes cercanos"
            right={
              <Switch
                accessibilityLabel="Alertas de reportes cercanos"
                value={notifyNear}
                onValueChange={(value) => void handleNotificationToggle('notifyNear', value)}
                {...switchTone}
              />
            }
          />
          <SettingRow
            icon={bellIcon}
            label="Estado de mis reportes"
            right={
              <Switch
                accessibilityLabel="Estado de mis reportes"
                value={notifyStatus}
                onValueChange={(value) => void handleNotificationToggle('notifyStatus', value)}
                {...switchTone}
              />
            }
          />

          <GroupLabel title="Accesibilidad" />
          <SettingRow
            icon={textSizeIcon}
            label="Tamaño de letra"
            right={
              <OptionGroup
                accessibilityLabel="Tamaño de letra"
                options={FONT_SCALE_OPTIONS}
                selected={fontScale}
                onSelect={(value) => void setPreference('fontScale', value)}
              />
            }
          />
          <SettingRow
            icon={fontIcon}
            label="Fuente de letra"
            right={
              <OptionGroup
                accessibilityLabel="Fuente de letra"
                options={FONT_FAMILY_OPTIONS}
                selected={fontFamily}
                onSelect={(value) => void setPreference('fontFamily', value as 'system' | 'serif' | 'mono')}
              />
            }
          />
          <SettingRow
            icon={motionIcon}
            label="Reducir animaciones"
            right={
              <Switch
                accessibilityLabel="Reducir animaciones"
                value={reduceMotion}
                onValueChange={(value) => void setPreference('reduceMotion', value)}
                {...switchTone}
              />
            }
          />

          <GroupLabel title="Datos y privacidad" />
          <SettingRow
            icon={syncIcon}
            label="Sincronizar pendientes"
            value={syncValue}
            right={syncing ? <ActivityIndicator size="small" color={BrandColors.primary} /> : null}
            onPress={requestSync}
          />
          {lastError ? <AppText style={styles.syncError}>{lastError}</AppText> : null}
          <SettingRow
            icon={trashIcon}
            label="Borrar datos locales"
            value={clearing ? 'Borrando...' : undefined}
            onPress={handleClearData}
          />

          <GroupLabel title="Legal" />
          <SettingRow icon={docIcon} label="Términos y condiciones" onPress={() => router.push('/mobile/legal?page=terms')} />
          <SettingRow icon={shieldIcon} label="Política de privacidad" onPress={() => router.push('/mobile/legal?page=privacy')} />
          <SettingRow icon={infoIcon} label="Versión" value="1.0.0" />
        </View>

        <AppText style={styles.disclaimer}>
          OceanEyes es una plataforma comunitaria. Los reportes los realizan usuarios voluntarios y no sustituyen el aviso a las autoridades competentes.
        </AppText>
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
  optionRow: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'rgba(19, 78, 94, 0.08)',
    borderRadius: 999,
    padding: 3,
  },
  optionButton: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  optionButtonActive: {
    backgroundColor: '#FFFFFF',
    ...shadow('subtle'),
  },
  optionLabel: {
    color: 'rgba(44, 44, 44, 0.7)',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '600',
    includeFontPadding: false,
  },
  optionLabelActive: {
    color: BrandColors.primary,
  },
  syncError: {
    color: '#B42318',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    paddingBottom: 8,
    includeFontPadding: false,
  },
  disclaimer: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    marginTop: 16,
    color: 'rgba(44, 44, 44, 0.5)',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});
