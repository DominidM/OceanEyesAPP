import { isAddress } from 'ethers';
import { useRouter } from 'expo-router';
import { Timestamp, deleteField, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { firestore } from '@/shared/firebase/app';

import { AppText } from '@/shared/components/app-text';
import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { SectionHeader } from '@/shared/components/section-header';
import { useAuth } from '@/shared/firebase/auth-context';
import { logout, updateUserProfile } from '@/shared/firebase/auth';
import { useGuestStatus } from '@/shared/hooks/use-guest-status';
import type { ProfileType, ReportStatus, UserProfile } from '@/shared/firebase/types';
import { shadow } from '@/shared/utils/shadows';
import { buildArbiscanAddressUrl, getOnChainBalance } from '@shared/blockchain/ledger';
import { isPointLedgerConfigured } from '@shared/blockchain/config';
import { connectWallet, getBrowserSigner, isWalletInstalled } from '@shared/blockchain/wallet';
import { useMobileWallet } from '@/shared/blockchain/appkit';

import { levelLabelFor } from '@/modules/rewards/presentation/data/rewards';

const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  fisher: 'Pescador',
  citizen: 'Ciudadano',
};

/* ── Iconos ── */

const mailIcon: SymbolName = { ios: 'envelope.fill', android: 'mail', web: 'mail' };
const phoneIcon: SymbolName = { ios: 'phone.fill', android: 'call', web: 'call' };
const dniIcon: SymbolName = { ios: 'creditcard.fill', android: 'badge', web: 'badge' };
const walletIcon: SymbolName = { ios: 'wallet.pass.fill', android: 'account-balance-wallet', web: 'account-balance-wallet' };
const personIcon: SymbolName = { ios: 'person.fill', android: 'person', web: 'person' };
const gearIcon: SymbolName = { ios: 'gearshape.fill', android: 'settings', web: 'settings' };
const starIcon: SymbolName = { ios: 'star.fill', android: 'star', web: 'star' };
const trophyIcon: SymbolName = { ios: 'trophy.fill', android: 'emoji-events', web: 'emoji-events' };
const verifiedIcon: SymbolName = { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' };
const docIcon: SymbolName = { ios: 'doc.text.fill', android: 'article', web: 'article' };
const giftIcon: SymbolName = { ios: 'gift.fill', android: 'redeem', web: 'redeem' };
const clockIcon: SymbolName = { ios: 'clock.fill', android: 'schedule', web: 'schedule' };

/* ── Datos mock para la vista previa (TEMPORAL) ── */

const DEV_PREVIEW_PROFILE: UserProfile = {
  role: 'citizen',
  profileType: 'citizen',
  displayName: 'María Pérez',
  email: 'maria.perez@example.com',
  dni: '12345678',
  phone: '+51 987 654 321',
  walletAddress: '0x8f3Cb0fA4dE2a1C7eB9d5F2a8C3eD6f0A1b7aE1',
  pointsBalance: 380,
  totalPointsEarned: 380,
  verifiedReportsCount: 14,
  status: 'active',
  createdAt: new Timestamp(1_720_000_000, 0),
  updatedAt: new Timestamp(1_750_000_000, 0),
};

type ActivityItem = {
  id: string;
  title: string;
  status: ReportStatus;
  points: number;
  date: string;
  icon: SymbolName;
};

const DEV_PREVIEW_ACTIVITY: ActivityItem[] = [
  {
    id: 'dev-r1',
    title: 'Red de pesca abandonada en Playa Huanchaco',
    status: 'verificado',
    points: 100,
    date: '12 jul 2026',
    icon: { ios: 'trash.fill', android: 'cleaning-services', web: 'cleaning-services' },
  },
  {
    id: 'dev-r2',
    title: 'Mancha de basura cerca del muelle',
    status: 'en_revision',
    points: 0,
    date: '2 ago 2026',
    icon: { ios: 'waveform.path.ecg', android: 'waves', web: 'waves' },
  },
  {
    id: 'dev-r3',
    title: 'Aumento de temperatura del agua',
    status: 'pendiente',
    points: 0,
    date: '4 ago 2026',
    icon: { ios: 'thermometer.medium', android: 'thermostat', web: 'thermostat' },
  },
];

const ACTIVITY_STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: '#B45309', bg: '#FEF3C7' },
  en_revision: { label: 'En revisión', color: '#1D4ED8', bg: '#DBEAFE' },
  verificado: { label: 'Verificado', color: '#047857', bg: '#D1FAE5' },
  descartado: { label: 'Descartado', color: '#B91C1C', bg: '#FEE2E2' },
};

const LEVEL_THRESHOLDS = [100, 300, 500, 1000];

function levelInfo(totalPoints: number) {
  const label = levelLabelFor(totalPoints);
  const next = LEVEL_THRESHOLDS.find((threshold) => totalPoints < threshold) ?? null;
  if (!next) return { label, next: null, progressText: String(totalPoints), fill: 1 };
  const prev = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.indexOf(next) - 1] ?? 0;
  const fill = Math.min(Math.max((totalPoints - prev) / (next - prev), 0), 1);
  return { label, next, progressText: `${totalPoints}/${next}`, fill };
}

function truncateMiddle(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/* ── Piezas de UI ── */

function SectionLabel({ title }: { title: string }) {
  return <AppText style={styles.sectionLabel}>{title}</AppText>;
}

function InitialsAvatar({ name, size }: { name: string; size: number }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <AppText style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</AppText>
    </View>
  );
}

type LevelInfo = ReturnType<typeof levelInfo>;

function HeroCard({
  name,
  typeLabel,
  level,
  balance,
  memberSinceText,
}: {
  name: string;
  typeLabel?: string;
  level: LevelInfo;
  balance: number;
  memberSinceText?: string;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroTopRow}>
        <InitialsAvatar name={name} size={64} />
        <View style={styles.heroNameWrap}>
          <AppText style={styles.heroName} numberOfLines={1}>
            {name}
          </AppText>
          {typeLabel ? <AppText style={styles.heroType}>{typeLabel}</AppText> : null}
        </View>
      </View>

      <View style={styles.levelPill}>
        <View style={styles.levelDot} />
        <AppText style={styles.levelText}>{level.label}</AppText>
      </View>

      <View style={styles.heroDivider} />

      <AppText style={styles.balanceLabel}>Saldo de puntos</AppText>
      <AppText style={styles.balanceValue}>{balance.toLocaleString('es-PE')}</AppText>

      {level.next ? (
        <>
          <View style={styles.statsRow}>
            <AppText style={styles.statText}>Progreso al siguiente nivel</AppText>
            <AppText style={styles.statText}>{level.progressText}</AppText>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${level.fill * 100}%` }]} />
          </View>
        </>
      ) : null}

      {memberSinceText ? <AppText style={styles.memberSince}>{memberSinceText}</AppText> : null}
    </View>
  );
}

function StatTile({ icon, value, label }: { icon: SymbolName; value: string; label: string }) {
  return (
    <View style={styles.statTile}>
      <AppSymbol name={icon} color={BrandColors.primary} size={16} />
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: SymbolName; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.iconCircle}>
        <AppSymbol name={icon} color={BrandColors.primary} size={16} />
      </View>
      <View style={styles.infoTextWrap}>
        <AppText style={styles.infoLabel}>{label}</AppText>
        <AppText style={styles.infoValue}>{value}</AppText>
      </View>
    </View>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const status = ACTIVITY_STATUS_CONFIG[item.status];
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityIcon}>
        <AppSymbol name={item.icon} color={BrandColors.primary} size={16} />
      </View>
      <View style={styles.activityTextWrap}>
        <AppText style={styles.activityTitle} numberOfLines={1}>
          {item.title}
        </AppText>
        <AppText style={styles.activityDate}>{item.date}</AppText>
      </View>
      {item.points > 0 ? <AppText style={styles.activityPoints}>+{item.points}</AppText> : null}
      <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
        <AppText style={[styles.statusText, { color: status.color }]}>{status.label}</AppText>
      </View>
    </View>
  );
}

type LoggedInCardProps = {
  profile: UserProfile | null;
  fallbackName?: string;
  activity?: ActivityItem[];
  extraStats?: { redeemed?: number; activeDays?: number };
};

function LoggedInCard({ profile, fallbackName, activity = [], extraStats }: LoggedInCardProps) {
  const name = profile?.displayName || fallbackName || 'Usuario';
  const typeLabel = profile ? PROFILE_TYPE_LABELS[profile.profileType] : undefined;
  const balance = profile?.pointsBalance ?? 0;
  const totalPoints = profile?.totalPointsEarned ?? 0;
  const level = levelInfo(totalPoints);
  const memberSinceDate = profile?.createdAt?.toDate ? profile.createdAt.toDate() : null;
  const memberSinceText = memberSinceDate
    ? `Miembro desde ${memberSinceDate
        .toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
        .replace(/^./, (char) => char.toUpperCase())}`
    : '';

  const infoRows = [
    { key: 'email', icon: mailIcon, label: 'Email', value: profile?.email },
    { key: 'phone', icon: phoneIcon, label: 'Teléfono', value: profile?.phone },
    { key: 'dni', icon: dniIcon, label: 'DNI', value: profile?.dni ? `DNI ${profile.dni}` : undefined },
    {
      key: 'wallet',
      icon: walletIcon,
      label: 'Billetera',
      value: profile?.walletAddress ? truncateMiddle(profile.walletAddress) : undefined,
    },
    { key: 'type', icon: personIcon, label: 'Tipo de perfil', value: typeLabel },
  ].filter((row) => row.value !== undefined) as { key: string; icon: SymbolName; label: string; value: string }[];

  return (
    <View style={styles.stack}>
      <HeroCard name={name} typeLabel={typeLabel} level={level} balance={balance} memberSinceText={memberSinceText} />

      <SectionLabel title="Estadísticas" />
      <View style={styles.statsGrid}>
        <StatTile icon={starIcon} value={String(balance)} label="Puntos" />
        <StatTile icon={trophyIcon} value={String(totalPoints)} label="Ganados" />
        <StatTile icon={verifiedIcon} value={String(profile?.verifiedReportsCount ?? 0)} label="Verificados" />
        {activity.length > 0 ? <StatTile icon={docIcon} value={String(activity.length)} label="Enviados" /> : null}
        {extraStats?.redeemed != null ? <StatTile icon={giftIcon} value={String(extraStats.redeemed)} label="Canjes" /> : null}
        {extraStats?.activeDays != null ? <StatTile icon={clockIcon} value={String(extraStats.activeDays)} label="Días activo" /> : null}
      </View>

      <SectionLabel title="Información personal" />
      <View style={styles.card}>
        {infoRows.map((row) => (
          <InfoRow key={row.key} icon={row.icon} label={row.label} value={row.value} />
        ))}
      </View>

      {activity.length > 0 ? (
        <>
          <SectionLabel title="Actividad reciente" />
          <View style={styles.card}>
            {activity.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </View>
        </>
      ) : null}

    </View>
  );
}

function LogoutButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
      <AppText style={styles.logoutButtonLabel}>Cerrar sesión</AppText>
    </Pressable>
  );
}

export function ProfileSection() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile } = useAuth();

  const guest = useGuestStatus();
  // TEMPORAL: vista previa de perfil logueado sin sesión real.
  const [showDevPreview, setShowDevPreview] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/mobile/login');
  };

  const [walletAddress, setWalletAddress] = useState(profile?.walletAddress ?? '');
  const [walletInput, setWalletInput] = useState('');
  const [metaMaskReady, setMetaMaskReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [onChainBalance, setOnChainBalance] = useState<bigint | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState('');

  const isWeb = Platform.OS === 'web';
  const mobileWallet = useMobileWallet();
  const walletModalWasOpen = useRef(false);

  useEffect(() => {
    if (isWeb) setMetaMaskReady(isWalletInstalled());
  }, [isWeb]);

  useEffect(() => {
    setWalletAddress(profile?.walletAddress ?? '');
  }, [profile?.walletAddress]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!walletAddress || !isPointLedgerConfigured()) return;
      setBalanceLoading(true);
      setBalanceError('');
      try {
        const value = await getOnChainBalance(walletAddress);
        if (!cancelled) setOnChainBalance(value);
      } catch (e: any) {
        if (!cancelled) setBalanceError(e?.message || 'No se pudo consultar el balance on-chain.');
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  const saveWallet = useCallback(async (address: string) => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateUserProfile(user.uid, { walletAddress: address });
      setWalletAddress(address);
      setWalletInput('');
      setSaved(true);
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar la wallet.');
    } finally {
      setSaving(false);
    }
  }, [user]);

  useEffect(() => {
    if (isWeb || !connecting) return;

    if (mobileWallet.address && isAddress(mobileWallet.address)) {
      setConnecting(false);
      void saveWallet(mobileWallet.address);
      return;
    }

    if (mobileWallet.isOpen) {
      walletModalWasOpen.current = true;
    } else if (walletModalWasOpen.current && !mobileWallet.isLoading) {
      walletModalWasOpen.current = false;
      setConnecting(false);
    }
  }, [connecting, isWeb, mobileWallet.address, mobileWallet.isLoading, mobileWallet.isOpen, saveWallet]);

  const handleConnect = async () => {
    setConnecting(true);
    setError('');
    setSaved(false);
    try {
      const account = await connectWallet();
      await getBrowserSigner();
      await saveWallet(account);
    } catch (e: any) {
      setError(e?.message || 'No se pudo conectar la wallet.');
    } finally {
      setConnecting(false);
    }
  };

  const handleSaveInput = async () => {
    const value = walletInput.trim();
    if (!isAddress(value)) {
      setError('La dirección no es válida. Debe ser una dirección Ethereum (0x...).');
      return;
    }
    await saveWallet(value);
  };

  const handleOpenMetaMask = () => {
    setError('');
    setSaved(false);
    setConnecting(true);
    walletModalWasOpen.current = false;
    try {
      mobileWallet.open();
    } catch {
      setConnecting(false);
      setError('No se pudo iniciar la conexión con MetaMask. Inténtalo nuevamente.');
    }
  };

  const handleRemove = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateDoc(doc(firestore, 'users', user.uid), {
        walletAddress: deleteField(),
        updatedAt: serverTimestamp(),
      });
      setWalletAddress('');
    } catch (e: any) {
      setError(e?.message || 'No se pudo quitar la wallet.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionHeader
        title="Perfil"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Configuración"
            onPress={() => router.push('/mobile/settings')}
            style={({ pressed }) => [styles.gearButton, pressed && styles.pressed]}>
            <AppSymbol name={gearIcon} color={BrandColors.primary} size={20} />
          </Pressable>
        }
      />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        {guest ? (
          showDevPreview && __DEV__ ? (
            <>
              <LoggedInCard
                profile={DEV_PREVIEW_PROFILE}
                fallbackName={DEV_PREVIEW_PROFILE.displayName}
                activity={DEV_PREVIEW_ACTIVITY}
                extraStats={{ redeemed: 3, activeDays: 214 }}
              />
              <LogoutButton onPress={() => setShowDevPreview(false)} />
            </>
          ) : (
            <>
              <View style={styles.placeholderCard}>
                <AppSymbol name={{ ios: 'person.crop.circle.badge.questionmark.fill', android: 'person', web: 'person' }} color={BrandColors.primary} size={34} />
                <AppText style={styles.placeholderTitle}>Inicia sesión</AppText>
                <AppText style={styles.placeholderText}>
                  Para ver tu perfil, puntos y recompensas, inicia sesión con tu cuenta.
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/mobile/login')}
                  style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
                  <AppText style={styles.loginButtonLabel}>Iniciar sesión</AppText>
                </Pressable>
              </View>
              {__DEV__ && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowDevPreview(true)}
                  style={({ pressed }) => [styles.previewButton, pressed && styles.pressed]}>
                  <AppText style={styles.previewButtonLabel}>Vista previa de perfil (dev)</AppText>
                </Pressable>
              )}
            </>
          )
        ) : (
          <>
            {user?.isAnonymous ? (
              <View style={styles.linkAccountCard}>
                <AppSymbol name={{ ios: 'link.circle.fill', android: 'link', web: 'link' }} color={BrandColors.primary} size={26} />
                <View style={styles.linkAccountTextWrap}>
                  <AppText style={styles.linkAccountTitle}>Conserva tus puntos</AppText>
                  <AppText style={styles.linkAccountText}>
                    Vincula una cuenta con email o Google para no perder tus reportes y puntos.
                  </AppText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/mobile/login')}
                  style={({ pressed }) => [styles.linkAccountButton, pressed && styles.pressed]}>
                  <AppText style={styles.linkAccountButtonLabel}>Vincular</AppText>
                </Pressable>
              </View>
            ) : null}
            <LoggedInCard profile={profile} fallbackName={user?.displayName ?? undefined} />

            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <AppSymbol name={{ ios: 'wallet.pass.fill', android: 'account-balance-wallet', web: 'account-balance-wallet' }} color={BrandColors.primary} size={22} />
                <Text style={styles.sectionTitle}>Wallet blockchain</Text>
              </View>
              <Text style={styles.hint}>
                Tus puntos por reportes verificados se acreditan en la wallet que registres aquí.
              </Text>

              {walletAddress ? (
                <>
                  <View style={styles.linkedRow}>
                    <AppSymbol name={{ ios: 'checkmark.circle.fill', android: 'check-circle', web: 'check-circle' }} color="#1B7F3B" size={18} />
                    <Text style={styles.linkedAddress}>{shortAddress(walletAddress)}</Text>
                  </View>

                  <View style={styles.balanceBlock}>
                    <Text style={styles.walletBalanceLabel}>Balance on-chain</Text>
                    {balanceLoading ? (
                      <Text style={styles.walletBalanceValue}>Consultando...</Text>
                    ) : balanceError ? (
                      <Text style={styles.balanceError}>{balanceError}</Text>
                    ) : (
                      <Text style={styles.walletBalanceValue}>{onChainBalance?.toString() ?? '0'} pts</Text>
                    )}
                    <Pressable
                      accessibilityRole="link"
                      onPress={() => Linking.openURL(buildArbiscanAddressUrl(walletAddress))}
                      style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
                      <AppSymbol name={{ ios: 'arrow.up.right.square.fill', android: 'open-in-new', web: 'open-in-new' }} color={BrandColors.primary} size={14} />
                      <Text style={styles.linkText}>Ver en Arbiscan</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    disabled={saving}
                    onPress={handleRemove}
                    style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}>
                    <Text style={styles.textButtonDanger}>{saving ? 'Quitando...' : 'Quitar wallet'}</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  {isWeb && metaMaskReady && (
                    <Pressable
                      accessibilityRole="button"
                      disabled={connecting || saving}
                      onPress={handleConnect}
                      style={({ pressed }) => [styles.primaryButton, (connecting || saving) && styles.disabled, pressed && styles.pressed]}>
                      <Text style={styles.primaryButtonLabel}>{connecting ? 'Conectando...' : 'Conectar con MetaMask'}</Text>
                    </Pressable>
                  )}
                  {!isWeb && (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        disabled={saving || connecting}
                        onPress={handleOpenMetaMask}
                        style={({ pressed }) => [styles.primaryButton, (saving || connecting) && styles.disabled, pressed && styles.pressed]}>
                        <Text style={styles.primaryButtonLabel}>{connecting ? 'Esperando autorización...' : 'Conectar con MetaMask'}</Text>
                      </Pressable>
                      <Text style={styles.nativeHint}>
                        MetaMask te pedirá autorizar la conexión y luego volverá a OceanEyes. Nunca compartas tu frase secreta.
                      </Text>
                    </>
                  )}
                  <Text style={styles.walletInputLabel}>O ingresa tu dirección pública</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={(value) => {
                        setWalletInput(value);
                        setError('');
                      }}
                      placeholder="0x..."
                      placeholderTextColor="rgba(44, 44, 44, 0.42)"
                      style={styles.input}
                      value={walletInput}
                    />
                    <Pressable
                      accessibilityRole="button"
                      disabled={saving}
                      onPress={handleSaveInput}
                      style={({ pressed }) => [styles.saveButton, saving && styles.disabled, pressed && styles.pressed]}>
                      <Text style={styles.saveButtonLabel}>{saving ? 'Guardando' : 'Guardar'}</Text>
                    </Pressable>
                  </View>
                </>
              )}

              {!!saved && <Text style={styles.success}>Wallet guardada correctamente.</Text>}
              {!!error && <Text style={styles.error}>{error}</Text>}
            </View>

            <LogoutButton onPress={handleLogout} />
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  stack: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    gap: 12,
  },
  placeholderCard: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    padding: Spacing.four,
    gap: Spacing.two,
    ...shadow('subtle'),
  },
  placeholderTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    includeFontPadding: false,
  },
  placeholderText: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    includeFontPadding: false,
  },
  loginButton: {
    alignItems: 'center',
    marginTop: Spacing.one,
    borderRadius: 999,
    paddingVertical: Spacing.two,
    backgroundColor: BrandColors.primary,
  },
  loginButtonLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontWeight: '700',
  },
  previewButton: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    marginTop: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BrandColors.primary,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(19, 78, 94, 0.05)',
    paddingVertical: Spacing.two,
  },
  previewButtonLabel: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.78,
  },
  gearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 78, 94, 0.1)',
  },

  /* Wallet blockchain */
  walletCard: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    padding: Spacing.four,
    gap: Spacing.two,
    ...shadow('subtle'),
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 16,
    fontWeight: '700',
    includeFontPadding: false,
  },
  hint: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    includeFontPadding: false,
  },
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(27, 127, 59, 0.08)',
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignSelf: 'flex-start',
  },
  linkedAddress: {
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
  },
  balanceBlock: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(19, 78, 94, 0.12)',
    paddingTop: Spacing.three,
    gap: Spacing.one,
  },
  walletBalanceLabel: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  walletBalanceValue: {
    color: BrandColors.primary,
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '700',
    includeFontPadding: false,
  },
  balanceError: {
    color: '#B42318',
    fontFamily: Fonts.body,
    fontSize: 13,
    includeFontPadding: false,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  linkText: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
    includeFontPadding: false,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: Spacing.two,
    backgroundColor: BrandColors.primary,
  },
  primaryButtonLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    borderColor: 'rgba(19, 78, 94, 0.2)',
    borderRadius: 10,
    borderWidth: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    includeFontPadding: false,
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    backgroundColor: BrandColors.primary,
  },
  saveButtonLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontWeight: '700',
    fontSize: 14,
  },
  textButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  textButtonDanger: {
    color: '#B42318',
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
  },
  nativeHint: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    includeFontPadding: false,
  },
  walletInputLabel: {
    color: 'rgba(44, 44, 44, 0.55)',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '600',
  },
  success: {
    color: '#1B7F3B',
    fontFamily: Fonts.body,
    fontSize: 13,
    includeFontPadding: false,
  },
  error: {
    color: '#B42318',
    fontFamily: Fonts.body,
    fontSize: 13,
    includeFontPadding: false,
  },

  /* Hero */
  hero: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: BrandColors.primary,
    ...shadow('lift'),
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarText: {
    color: BrandColors.primary,
    fontFamily: Fonts.headline,
    fontWeight: '700',
  },
  heroNameWrap: {
    flex: 1,
    gap: 2,
  },
  heroName: {
    color: '#FFFFFF',
    fontFamily: Fonts.headline,
    fontSize: 22,
    fontWeight: '800',
    includeFontPadding: false,
  },
  heroType: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
  },
  levelPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  levelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  levelText: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  heroDivider: {
    marginTop: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceLabel: {
    marginTop: 16,
    color: 'rgba(255, 255, 255, 0.65)',
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: '500',
    includeFontPadding: false,
  },
  balanceValue: {
    marginTop: 2,
    color: '#FFFFFF',
    fontFamily: Fonts.headline,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1.8,
    lineHeight: 42,
    includeFontPadding: false,
  },
  statsRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  track: {
    marginTop: 8,
    height: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
  },
  memberSince: {
    marginTop: 14,
    color: 'rgba(255, 255, 255, 0.65)',
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: '500',
    includeFontPadding: false,
  },

  /* Secciones */
  sectionLabel: {
    marginTop: 4,
    paddingHorizontal: 4,
    color: 'rgba(44, 44, 44, 0.6)',
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 4,
    ...shadow('subtle'),
  },

  /* Estadísticas */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statTile: {
    flexBasis: '30%',
    flexGrow: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E1D9',
    backgroundColor: '#FAF6F1',
    padding: 14,
  },
  statValue: {
    marginTop: 4,
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 20,
    fontWeight: '800',
    includeFontPadding: false,
  },
  statLabel: {
    color: 'rgba(44, 44, 44, 0.6)',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    includeFontPadding: false,
  },

  /* Filas compartidas */
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 78, 94, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    color: 'rgba(44, 44, 44, 0.55)',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    includeFontPadding: false,
  },
  infoValue: {
    marginTop: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
  },

  /* Actividad */
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 78, 94, 0.1)',
  },
  activityTextWrap: {
    flex: 1,
  },
  activityTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
  },
  activityDate: {
    marginTop: 1,
    color: 'rgba(44, 44, 44, 0.55)',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    includeFontPadding: false,
  },
  activityPoints: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
    includeFontPadding: false,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  statusText: {
    fontFamily: Fonts.label,
    fontSize: 11,
    fontWeight: '700',
    includeFontPadding: false,
  },

  /* Salir */
  logoutButton: {
    alignItems: 'center',
    marginTop: 4,
    borderRadius: 999,
    paddingVertical: Spacing.three,
    backgroundColor: '#FEE2E2',
  },
  logoutButtonLabel: {
    color: '#B91C1C',
    fontFamily: Fonts.label,
    fontWeight: '700',
  },

  /* Vincular cuenta */
  linkAccountCard: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.primary,
    backgroundColor: '#FFFFFF',
    padding: 14,
    ...shadow('subtle'),
  },
  linkAccountTextWrap: {
    flex: 1,
    gap: 2,
  },
  linkAccountTitle: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 15,
    fontWeight: '700',
    includeFontPadding: false,
  },
  linkAccountText: {
    color: 'rgba(44, 44, 44, 0.7)',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
    includeFontPadding: false,
  },
  linkAccountButton: {
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: BrandColors.primary,
  },
  linkAccountButtonLabel: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    includeFontPadding: false,
  },
});
