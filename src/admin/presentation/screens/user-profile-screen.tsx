import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AdminShell } from '@admin/layout/admin-shell';
import { AdminLoading, Badge, Button, Card, SectionHeader } from '@admin/presentation/components/ui';
import { ReportDataList } from '@admin/presentation/components/reports/report-data-list';
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
        { label: 'Estado', value: suspended ? 'Baneado' : 'Activo' },
        {
          label: 'Fin del baneo',
          value: suspended
            ? profile.bannedUntil?.toDate
              ? profile.bannedUntil.toDate().toLocaleString('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Permanente'
            : '—',
        },
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
      {loading && <AdminLoading variant="list" />}

      {!loading && (
        <>
          <SectionHeader
            title={profile?.displayName ?? 'Usuario'}
            subtitle="Detalle del perfil de la cuenta."
            actions={[
              <Button key="back" label="Volver" variant="secondary" onPress={() => router.push('/admin/users')} />,
            ]}
          />

          <Card style={styles.card}>
            {!profile && (
              <View style={styles.notFound}>
                <FontAwesome5 name="user-slash" size={28} color={colors.contentTextMuted} />
                <Text style={[styles.notFoundText, { color: colors.contentTextMuted }]}>
                  No se encontró el usuario.
                </Text>
              </View>
            )}

            {profile && (
              <>
                <View style={[styles.subBlock, { borderColor: colors.cardBorder }]}>
                  <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Datos de usuario</Text>

                  <View style={styles.headingRow}>
                    {rc && <Badge label={rc.label} color={rc.color} bg={rc.bg} />}
                    {suspended && <Badge label="Baneado" color={colors.danger} bg={colors.dangerBg} />}
                  </View>

                  <ReportDataList rows={rows} />
                </View>

                {profile.banReason ? (
                  <View style={[styles.subBlock, { borderColor: colors.cardBorder }]}>
                    <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Baneo</Text>
                    <View style={[styles.innerSubBlock, { borderColor: colors.cardBorder }]}>
                      <Text style={[styles.subBlockHint, { color: colors.contentTextMuted }]}>Motivo de baneo</Text>
                      <Text style={[styles.banText, { color: colors.contentText }]}>{profile.banReason}</Text>
                    </View>
                  </View>
                ) : null}
              </>
            )}
          </Card>

          {profile && (
            <View style={styles.footerActions}>
              <Pressable onPress={() => router.push('/admin/users')} style={styles.link}>
                <FontAwesome5 name="arrow-left" size={13} color={colors.primary} />
                <Text style={[styles.linkLabel, { color: colors.primary }]}>Volver a la lista de usuarios</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </AdminShell>
  );
}

export default UserProfileScreen;

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  notFound: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.four },
  notFoundText: { fontFamily: Fonts.body, fontSize: 14 },
  subBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  innerSubBlock: {
    borderWidth: 1,
    borderRadius: 10,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  subBlockTitle: { fontFamily: Fonts.label, fontSize: 14, fontWeight: '700' },
  subBlockHint: { fontFamily: Fonts.body, fontSize: 13 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  banText: { fontFamily: Fonts.body, fontSize: 14 },
  footerActions: { alignItems: 'flex-start' },
  link: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two - 2, cursor: 'pointer' },
  linkLabel: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '600' },
});