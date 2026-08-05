import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card, SectionHeader } from '@admin/presentation/components/ui';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { getUserProfile } from '@/shared/firebase/auth';
import type { UserProfile } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';

export function UserProfileScreen() {
  const { colors } = useAdminTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getUserProfile(id)
      .then((p) => setProfile(p))
      .finally(() => setLoading(false));
  }, [id]);

  const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
    admin: { label: 'Admin', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    fisher: { label: 'Pescador', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    citizen: { label: 'Ciudadano', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  };

  const rc = profile ? roleConfig[profile.role] ?? roleConfig.citizen : null;
  const suspended = profile?.status === 'suspended';

  const rows: { label: string; value: string }[] = profile
    ? [
        { label: 'ID de usuario', value: id },
        { label: 'Email', value: profile.email ?? '—' },
        { label: 'DNI', value: profile.dni ?? '—' },
        { label: 'Teléfono', value: profile.phone ?? '—' },
        { label: 'Wallet', value: profile.walletAddress ?? '—' },
        { label: 'Perfil', value: profile.profileType === 'fisher' ? 'Pescador' : 'Ciudadano' },
        { label: 'Puntos', value: String(profile.pointsBalance ?? 0) },
        { label: 'Puntos ganados', value: String(profile.totalPointsEarned ?? 0) },
        { label: 'Reportes verificados', value: String(profile.verifiedReportsCount ?? 0) },
        { label: 'Estado', value: suspended ? 'Suspendido' : 'Activo' },
        {
          label: 'Registro',
          value: profile.createdAt?.toDate?.()
            ? profile.createdAt.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
        },
      ]
    : [];

  return (
    <AdminShell title="Perfil de usuario" breadcrumb={[{ label: 'Usuarios', href: '/admin/users' }, { label: 'Perfil' }]}>
      <SectionHeader
        title={profile?.displayName ?? 'Usuario'}
        subtitle="Detalle del perfil de la cuenta."
        actions={[
          <Button key="back" label="Volver" variant="secondary" onPress={() => router.push('/admin/users')} />,
        ]}
      />

      <Card style={styles.card}>
        {loading && <Text style={{ color: colors.contentTextMuted }}>Cargando perfil...</Text>}

        {!loading && !profile && (
          <View style={styles.notFound}>
            <FontAwesome5 name="user-slash" size={28} color={colors.contentTextMuted} />
            <Text style={[styles.notFoundText, { color: colors.contentTextMuted }]}>
              No se encontró el usuario.
            </Text>
          </View>
        )}

        {!loading && profile && (
          <>
            <View style={styles.headingRow}>
              <Text style={[styles.name, { color: colors.cardText }]}>{profile.displayName ?? 'Sin nombre'}</Text>
              {rc && <Badge label={rc.label} color={rc.color} bg={rc.bg} />}
              {suspended && <Badge label="Suspendido" color={colors.danger} bg={colors.dangerBg} />}
            </View>

            <View style={styles.infoList}>
              {rows.map((r) => (
                <View key={r.label} style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
                  <Text style={[styles.infoLabel, { color: colors.contentTextMuted }]}>{r.label}</Text>
                  <Text style={[styles.infoValue, { color: colors.cardText }]}>{r.value}</Text>
                </View>
              ))}
            </View>

            {profile.banReason ? (
              <View style={[styles.banBox, { backgroundColor: colors.dangerBg }]}>
                <Text style={[styles.banTitle, { color: colors.danger }]}>Motivo de suspensión</Text>
                <Text style={[styles.banText, { color: colors.contentText }]}>{profile.banReason}</Text>
              </View>
            ) : null}
          </>
        )}
      </Card>

      {!loading && profile && (
        <View style={styles.footerActions}>
          <Pressable onPress={() => router.push('/admin/users')} style={styles.link}>
            <FontAwesome5 name="arrow-left" size={13} color={colors.primary} />
            <Text style={[styles.linkLabel, { color: colors.primary }]}>Volver a la lista de usuarios</Text>
          </Pressable>
        </View>
      )}
    </AdminShell>
  );
}

export default UserProfileScreen;

const styles = StyleSheet.create({
  card: { maxWidth: 560 },
  notFound: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.four },
  notFoundText: { fontFamily: Fonts.body, fontSize: 14 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.three, flexWrap: 'wrap' },
  name: { fontFamily: Fonts.headline, fontSize: 22, fontWeight: '700' },
  infoList: { gap: 0 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  infoLabel: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '600' },
  infoValue: { fontFamily: Fonts.body, fontSize: 14, textAlign: 'right', flexShrink: 1 },
  banBox: { borderRadius: 12, padding: Spacing.three, marginTop: Spacing.four, gap: Spacing.one },
  banTitle: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '700' },
  banText: { fontFamily: Fonts.body, fontSize: 14 },
  footerActions: { alignItems: 'flex-start' },
  link: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two - 2, cursor: 'pointer' },
  linkLabel: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '600' },
});