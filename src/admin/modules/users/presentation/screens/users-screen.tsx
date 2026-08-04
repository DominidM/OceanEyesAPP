import { collection, getDocs, limit as fireLimit, orderBy, query, startAfter } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@/constants/theme';
import { firestore } from '@/shared/firebase/app';
import type { UserProfile } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/shared/theme/context';
import { AdminShell } from '@admin/shared/components/admin-shell';
import { Badge, Card, Button } from '@admin/shared/ui';

type UserRow = UserProfile & { id: string };

const PAGE_SIZE = 10;

export function UsersScreen() {
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

  return (
    <AdminShell title="Usuarios">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {loading && users.length === 0 && (
          <Text style={[styles.empty, { color: colors.contentTextMuted }]}>Cargando usuarios...</Text>
        )}

        {users.map((u) => {
          const rc = roleConfig(u.role);
          return (
            <Card key={u.id} style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={[styles.name, { color: colors.cardText }]}>{u.displayName ?? 'Sin nombre'}</Text>
                <Text style={[styles.email, { color: colors.contentTextMuted }]}>{u.email ?? 'sin email'}</Text>
                <View style={styles.tags}>
                  <Badge label={rc.label} color={rc.color} bg={rc.bg} />
                  <Text style={[styles.stat, { color: colors.contentTextMuted }]}>
                    {u.pointsBalance ?? 0} pts · {u.verifiedReportsCount ?? 0} verificados
                  </Text>
                </View>
              </View>
            </Card>
          );
        })}

        {hasMore && !loading && (
          <Button label="Cargar más" variant="secondary" onPress={() => loadUsers(false)} style={styles.more} />
        )}
      </ScrollView>
    </AdminShell>
  );
}

export default UsersScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: Spacing.two },
  row: { gap: Spacing.two },
  rowMain: { gap: Spacing.one },
  name: { fontFamily: Fonts.label, fontSize: 16, fontWeight: '700' },
  email: { fontFamily: Fonts.body, fontSize: 13 },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  stat: { fontFamily: Fonts.body, fontSize: 12 },
  empty: { fontFamily: Fonts.body, fontSize: 14 },
  more: { marginTop: Spacing.two },
});
