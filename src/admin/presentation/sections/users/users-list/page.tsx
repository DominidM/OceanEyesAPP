import { collection, getDocs, limit as fireLimit, orderBy, query, startAfter } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { firestore } from '@/shared/firebase/app';
import type { UserProfile } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';
import { Badge, Card, Button } from '@admin/presentation/components/ui';

type UserRow = UserProfile & { id: string };

const PAGE_SIZE = 10;

export function UsersList() {
  const { colors } = useAdminTheme();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      let q = query(collection(firestore, 'users'), orderBy('createdAt', 'desc'), fireLimit(PAGE_SIZE));
      if (!reset && lastDoc) q = query(q, startAfter(lastDoc));

      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserRow);
      setUsers(reset ? docs : [...users, ...docs]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [lastDoc, users]);

  useEffect(() => { loadUsers(true); }, []);

  const roleConfig = (role: string) => {
    switch (role) {
      case 'admin': return { label: 'Admin', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
      case 'fisher': return { label: 'Pescador', color: '#10B981', bg: 'rgba(16,185,129,0.12)' };
      default: return { label: 'Ciudadano', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' };
    }
  };

  const hoverBg = 'rgba(148,163,184,0.08)';

  return (
    <View style={styles.content}>
      {loading && users.length === 0 && (
        <Text style={[styles.empty, { color: colors.contentTextMuted }]}>Cargando usuarios...</Text>
      )}

      <Card style={styles.tableCard}>
        <View style={[styles.tableHead, { borderBottomColor: colors.cardBorder }]}>
          <Text style={[styles.th, styles.thMain, { color: colors.contentTextMuted }]}>Usuario</Text>
          <Text style={[styles.th, styles.thRole, { color: colors.contentTextMuted }]}>Rol</Text>
          <Text style={[styles.th, styles.thNum, { color: colors.contentTextMuted }]}>Puntos</Text>
          <Text style={[styles.th, styles.thNum, { color: colors.contentTextMuted }]}>Verificados</Text>
        </View>

        <View>
          {users.map((u) => {
            const rc = roleConfig(u.role);
            return (
              <Pressable
                key={u.id}
                style={({ hovered }) => [
                  styles.row,
                  { borderBottomColor: colors.cardBorder },
                  hovered && { backgroundColor: hoverBg },
                ]}
              >
                <View style={styles.cellMain}>
                  <Text style={[styles.name, { color: colors.cardText }]} numberOfLines={1}>
                    {u.displayName ?? 'Sin nombre'}
                  </Text>
                  <Text style={[styles.email, { color: colors.contentTextMuted }]} numberOfLines={1}>
                    {u.email ?? 'sin email'}
                  </Text>
                </View>
                <View style={styles.cellRole}>
                  <Badge label={rc.label} color={rc.color} bg={rc.bg} />
                </View>
                <Text style={[styles.cellNum, { color: colors.contentTextMuted }]}>{u.pointsBalance ?? 0}</Text>
                <Text style={[styles.cellNum, { color: colors.contentTextMuted }]}>{u.verifiedReportsCount ?? 0}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {hasMore && !loading && (
        <Button label="Cargar más" variant="secondary" onPress={() => loadUsers(false)} style={styles.more} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.four },
  empty: { fontFamily: Fonts.body, fontSize: 14 },
  tableCard: { gap: 0, padding: 0, overflow: 'hidden' },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  th: { fontFamily: Fonts.label, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  thMain: { flex: 1 },
  thRole: { width: 110, textAlign: 'right' },
  thNum: { width: 96, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    gap: Spacing.three,
    cursor: 'auto',
  },
  cellMain: { flex: 1, gap: 2, minWidth: 0 },
  name: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '600' },
  email: { fontFamily: Fonts.body, fontSize: 12 },
  cellRole: { width: 110, alignItems: 'flex-end' },
  cellNum: { width: 96, fontFamily: Fonts.label, fontSize: 14, fontWeight: '700', textAlign: 'right' },
  more: { alignSelf: 'flex-start' },
});