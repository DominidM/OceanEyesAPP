import { isAddress } from 'ethers';
import { useRouter } from 'expo-router';
import { deleteField, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { firestore } from '@/shared/firebase/app';

import { AppFonts as Fonts, BottomBarHeight, BrandColors, Spacing } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { SectionHeader } from '@/shared/components/section-header';
import { useAuth } from '@/shared/firebase/auth-context';
import { updateUserProfile } from '@/shared/firebase/auth';
import { buildArbiscanAddressUrl, getOnChainBalance } from '@shared/blockchain/ledger';
import { isPointLedgerConfigured } from '@shared/blockchain/config';
import { connectWallet, getBrowserSigner, isWalletInstalled } from '@shared/blockchain/wallet';
import { shadow } from '@/shared/utils/shadows';

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ProfileSection() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile } = useAuth();

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

  const guest = !user || user.isAnonymous;
  const isWeb = Platform.OS === 'web';

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

  const saveWallet = async (address: string) => {
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
  };

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
      <SectionHeader title="Perfil" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + BottomBarHeight + 24 }]}>
        {guest ? (
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
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.avatar}>
                <AppSymbol name={{ ios: 'person.fill', android: 'person', web: 'person' }} color={BrandColors.tertiary} size={22} />
              </View>
              <View style={styles.identity}>
                <Text style={styles.identityName}>{profile?.displayName ?? 'Usuario'}</Text>
                <Text style={styles.identityMeta}>
                  {profile?.email ?? ''}
                  {profile?.profileType ? ` · ${profile.profileType === 'fisher' ? 'Pescador' : 'Ciudadano'}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.stat, { flex: 1 }]}>
                <Text style={styles.statValue}>{profile?.pointsBalance ?? 0}</Text>
                <Text style={styles.statLabel}>Puntos</Text>
              </View>
              <View style={[styles.stat, { flex: 1 }]}>
                <Text style={styles.statValue}>{profile?.verifiedReportsCount ?? 0}</Text>
                <Text style={styles.statLabel}>Reportes verificados</Text>
              </View>
            </View>

            <View style={styles.card}>
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
                    <Text style={styles.balanceLabel}>Balance on-chain</Text>
                    {balanceLoading ? (
                      <Text style={styles.balanceValue}>Consultando...</Text>
                    ) : balanceError ? (
                      <Text style={styles.balanceError}>{balanceError}</Text>
                    ) : (
                      <Text style={styles.balanceValue}>{onChainBalance?.toString() ?? '0'} pts</Text>
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
                    <Text style={styles.nativeHint}>
                      En tu celular, pega la dirección de tu wallet (por ejemplo, la de MetaMask).
                    </Text>
                  )}
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
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    padding: Spacing.four,
    gap: Spacing.two,
    ...shadow('subtle'),
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  identityName: {
    color: BrandColors.neutral,
    fontFamily: Fonts.headline,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    includeFontPadding: false,
  },
  identityMeta: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.body,
    fontSize: 13,
    fontWeight: '400',
    includeFontPadding: false,
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.three,
  },
  stat: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9CFC5',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    gap: 2,
    ...shadow('subtle'),
  },
  statValue: {
    color: BrandColors.primary,
    fontFamily: Fonts.headline,
    fontSize: 22,
    fontWeight: '700',
    includeFontPadding: false,
  },
  statLabel: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
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
  balanceLabel: {
    color: 'rgba(44, 44, 44, 0.72)',
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  balanceValue: {
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
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.78,
  },
});
