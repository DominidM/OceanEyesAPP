import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { listBannedUsers, unbanUser } from '@/shared/firebase/bans';
import { getUserProfile, setUserStatus } from '@/shared/firebase/auth';
import type { UserProfile } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';
import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card, SectionHeader, AdminLoading, EmptyState } from '@admin/presentation/components/ui';

type BannedUser = Omit<UserProfile, 'uid'> & {
  uid: string;
  endsAt?: { toDate?: () => Date } | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function formatDate(d?: { toDate?: () => Date } | null) {
  if (!d?.toDate) return null;
  try {
    return d.toDate().toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
}

export function BansScreen() {
  const { colors } = useAdminTheme();
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const bans = await listBannedUsers();
      const profiles = await Promise.all(
        bans.map(async (b) => {
          const profile = await getUserProfile(b.id);
          return profile ? ({ ...profile, uid: b.id, banReason: b.reason, endsAt: b.endsAt } as BannedUser) : null;
        }),
      );
      setBannedUsers(profiles.filter((p): p is BannedUser => p != null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUnbanUser = async (userId: string) => {
    await unbanUser(userId);
    await setUserStatus(userId, 'active');
    await load();
  };

  return (
    <AdminShell title="Baneos">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {!(loading && bannedUsers.length === 0) && (
          <SectionHeader
            title="Usuarios baneados"
            subtitle="Cuentas suspendidas de la plataforma."
          />
        )}
        {loading && bannedUsers.length === 0 && (
          <AdminLoading variant="list" />
        )}
        {!loading && bannedUsers.length === 0 && (
          <EmptyState
            icon="account-cancel-outline"
            title="Sin usuarios baneados"
            description="No hay cuentas baneadas. Puedes banear desde la lista de usuarios."
          />
        )}

        <View style={styles.list}>
          {bannedUsers.map((user) => {
            const name = user.displayName ?? user.email ?? 'Usuario';
            const endsAt = formatDate(user.endsAt);
            return (
              <Card key={user.uid} style={styles.row}>
                <View style={styles.rowHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(name)}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.name, { color: colors.cardText }]} numberOfLines={1}>
                        {name}
                      </Text>
                      <Badge label="Baneado" color={colors.danger} bg={colors.dangerBg} />
                    </View>
                    {user.email ? (
                      <Text style={[styles.email, { color: colors.contentTextMuted }]} numberOfLines={1}>
                        {user.email}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={[styles.banBlock, { borderColor: colors.dangerBg, backgroundColor: colors.dangerBg }]}>
                  <View style={styles.banBlockIcon}>
                    <MaterialCommunityIcons name="cancel" size={16} color={colors.danger} />
                  </View>
                  <View style={styles.banBlockText}>
                    <Text style={[styles.banReason, { color: colors.contentText }]}>
                      {user.banReason ?? 'Sin motivo especificado'}
                    </Text>
                    <Text style={[styles.banDate, { color: colors.contentTextMuted }]}>
                      {endsAt ? `Baneado hasta el ${endsAt}` : 'Baneo permanente'}
                    </Text>
                  </View>
                </View>

                <View style={styles.rowFooter}>
                  <View style={styles.roleMeta}>
                    <MaterialCommunityIcons name="account" size={14} color={colors.contentTextMuted} />
                    <Text style={[styles.roleText, { color: colors.contentTextMuted }]}>
                      {user.profileType === 'fisher' ? 'Pescador' : 'Ciudadano'}
                    </Text>
                  </View>
                  <Button label="Desbanear" variant="secondary" onPress={() => handleUnbanUser(user.uid)} />
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default BansScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: Spacing.four, paddingBottom: Spacing.six },
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  row: { flex: 1, minWidth: 300, maxWidth: '33.33%', gap: Spacing.three },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(185,28,28,0.10)',
  },
  avatarText: {
    fontFamily: Fonts.headline,
    fontSize: 16,
    fontWeight: '700',
    color: '#B91C1C',
  },
  userInfo: { flex: 1, gap: Spacing.one - 2 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: {
    fontFamily: Fonts.headline,
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  email: {
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  banBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 10,
    padding: Spacing.three,
  },
  banBlockIcon: {
    marginTop: 2,
  },
  banBlockText: { flex: 1, gap: 2 },
  banReason: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  banDate: {
    fontFamily: Fonts.body,
    fontSize: 12,
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  roleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleText: {
    fontFamily: Fonts.body,
    fontSize: 13,
  },
});
