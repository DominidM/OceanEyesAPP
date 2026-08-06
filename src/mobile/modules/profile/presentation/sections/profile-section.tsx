import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol, SymbolName } from '@/shared/components/app-symbol';
import { SectionHeader } from '@/shared/components/section-header';
import { useAuth } from '@/shared/firebase/auth-context';
import { logout } from '@/shared/firebase/auth';
import { useGuestStatus } from '@/shared/hooks/use-guest-status';
import type { ProfileType, ReportStatus, UserProfile } from '@/shared/firebase/types';
import { shadow } from '@/shared/utils/shadows';

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

/* ── Piezas de UI ── */

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
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
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
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
          <Text style={styles.heroName} numberOfLines={1}>
            {name}
          </Text>
          {typeLabel ? <Text style={styles.heroType}>{typeLabel}</Text> : null}
        </View>
      </View>

      <View style={styles.levelPill}>
        <View style={styles.levelDot} />
        <Text style={styles.levelText}>{level.label}</Text>
      </View>

      <View style={styles.heroDivider} />

      <Text style={styles.balanceLabel}>Saldo de puntos</Text>
      <Text style={styles.balanceValue}>{balance.toLocaleString('es-PE')}</Text>

      {level.next ? (
        <>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>Progreso al siguiente nivel</Text>
            <Text style={styles.statText}>{level.progressText}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${level.fill * 100}%` }]} />
          </View>
        </>
      ) : null}

      {memberSinceText ? <Text style={styles.memberSince}>{memberSinceText}</Text> : null}
    </View>
  );
}

function StatTile({ icon, value, label }: { icon: SymbolName; value: string; label: string }) {
  return (
    <View style={styles.statTile}>
      <AppSymbol name={icon} color={BrandColors.primary} size={16} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
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
        <Text style={styles.activityTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.activityDate}>{item.date}</Text>
      </View>
      {item.points > 0 ? <Text style={styles.activityPoints}>+{item.points}</Text> : null}
      <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>
    </View>
  );
}

type LoggedInCardProps = {
  profile: UserProfile | null;
  fallbackName?: string;
  activity?: ActivityItem[];
  extraStats?: { redeemed?: number; activeDays?: number };
  onLogout: () => void;
};

function LoggedInCard({ profile, fallbackName, activity = [], extraStats, onLogout }: LoggedInCardProps) {
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

      <Pressable
        accessibilityRole="button"
        onPress={onLogout}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
        <Text style={styles.logoutButtonLabel}>Cerrar sesión</Text>
      </Pressable>
    </View>
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

  return (
    <>
      <SectionHeader
        title="Perfil"
        right={
          <Pressable
            accessibilityRole="button"
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
            <LoggedInCard
              profile={DEV_PREVIEW_PROFILE}
              fallbackName={DEV_PREVIEW_PROFILE.displayName}
              activity={DEV_PREVIEW_ACTIVITY}
              extraStats={{ redeemed: 3, activeDays: 214 }}
              onLogout={() => setShowDevPreview(false)}
            />
          ) : (
            <>
              <View style={styles.placeholderCard}>
                <AppSymbol name={{ ios: 'person.crop.circle.badge.questionmark.fill', android: 'person', web: 'person' }} color={BrandColors.primary} size={34} />
                <Text style={styles.placeholderTitle}>Inicia sesión</Text>
                <Text style={styles.placeholderText}>
                  Para ver tu perfil, puntos y recompensas, inicia sesión con tu cuenta.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/mobile/login')}
                  style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
                  <Text style={styles.loginButtonLabel}>Iniciar sesión</Text>
                </Pressable>
              </View>
              {__DEV__ && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowDevPreview(true)}
                  style={({ pressed }) => [styles.previewButton, pressed && styles.pressed]}>
                  <Text style={styles.previewButtonLabel}>Vista previa de perfil (dev)</Text>
                </Pressable>
              )}
            </>
          )
        ) : (
          <LoggedInCard profile={profile} fallbackName={user?.displayName ?? undefined} onLogout={handleLogout} />
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
});
