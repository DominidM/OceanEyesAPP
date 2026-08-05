import { collection, getCountFromServer, getDocs, limit as fireLimit, orderBy, query, startAfter } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { firebaseAuth, firestore } from '@/shared/firebase/app';
import { setUserStatus } from '@/shared/firebase/auth';
import type { UserProfile } from '@/shared/firebase/types';
import { useAdminTheme } from '@admin/theme/context';
import { Badge, Card, Button, PaginationFooter, EmptyState, SectionHeader, LoadingState } from '@admin/presentation/components/ui';

type UserRow = UserProfile & { id: string };

const PAGE_SIZE = 10;

export function UsersList() {
  const { colors } = useAdminTheme();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<any[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [loading, setLoading] = useState(true);
  const currentPageRef = useRef(currentPage);

  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalDocs / PAGE_SIZE));
  const start = users.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, totalDocs);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      let q = query(collection(firestore, 'users'), orderBy('createdAt', 'desc'), fireLimit(PAGE_SIZE));
      if (page > 1 && pageCursors.length >= page - 1) {
        q = query(q, startAfter(pageCursors[page - 2]));
      }

      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserRow);
      setUsers(docs);
      setCurrentPage(page);

      if (snap.docs.length > 0) {
        setPageCursors((prev) => {
          const next = [...prev];
          next[page - 1] = snap.docs[snap.docs.length - 1];
          return next;
        });
      } else {
        setPageCursors((prev) => prev.slice(0, page - 1));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [pageCursors]);

  const fetchTotal = useCallback(async () => {
    try {
      const snap = await getCountFromServer(collection(firestore, 'users'));
      setTotalDocs(snap.data().count);
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchTotal();
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleStatus = async (u: UserRow) => {
    const next = u.status === 'suspended' ? 'active' : 'suspended';
    await setUserStatus(u.id, next, {
      reason: next === 'suspended' ? 'Suspendido por el administrador.' : undefined,
      adminUid: firebaseAuth?.currentUser?.uid,
    });
    setUsers((prev) => prev.map((row) => (row.id === u.id ? { ...row, status: next } : row)));
    await loadPage(currentPageRef.current);
  };

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
      <SectionHeader
        title="Administración de usuarios"
        subtitle="Gestiona roles, puntos y suspende cuentas de la plataforma."
        actions={[
          <Button key="add" label="Agregar" onPress={() => router.push('/admin/users/new')} />,
        ]}
      />

      {loading && users.length === 0 && (
        <LoadingState label="Cargando usuarios..." />
      )}
      {!loading && totalDocs === 0 && (
        <EmptyState
          icon="account-group-outline"
          title="Sin usuarios"
          description="No hay usuarios registrados en la plataforma todavía."
        />
      )}

      {totalDocs > 0 && (
        <Card style={styles.tableCard}>
          <View style={[styles.tableHead, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.th, styles.thMain, { color: colors.contentTextMuted }]}>Usuario</Text>
            <Text style={[styles.th, styles.thRole, { color: colors.contentTextMuted }]}>Rol</Text>
            <Text style={[styles.th, styles.thNum, { color: colors.contentTextMuted }]}>Puntos</Text>
            <Text style={[styles.th, styles.thNum, { color: colors.contentTextMuted }]}>Verificados</Text>
            <Text style={[styles.th, styles.thActions, { color: colors.contentTextMuted }]}>Acción</Text>
          </View>

          <View>
            {users.map((u) => {
              const rc = roleConfig(u.role);
              const suspended = u.status === 'suspended';
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
                    {suspended && <Badge label="Suspendido" color={colors.danger} bg={colors.dangerBg} />}
                  </View>
                  <Text style={[styles.cellNum, { color: colors.contentTextMuted }]}>{u.pointsBalance ?? 0}</Text>
                  <Text style={[styles.cellNum, { color: colors.contentTextMuted }]}>{u.verifiedReportsCount ?? 0}</Text>
                  <View style={styles.cellActions}>
                    {u.role !== 'admin' ? (
                      <Button
                        label={suspended ? 'Activar' : 'Suspender'}
                        variant={suspended ? 'primary' : 'danger'}
                        onPress={() => toggleStatus(u)}
                      />
                    ) : (
                      <Button
                        label="Ver perfil"
                        variant="secondary"
                        onPress={() => router.push(`/admin/users/${u.id}`)}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <PaginationFooter
            start={start}
            end={end}
            total={totalDocs}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => loadPage(currentPage - 1)}
            onNext={() => loadPage(currentPage + 1)}
            loading={loading}
          />
        </Card>
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
    gap: Spacing.three,
  },
  th: { fontFamily: Fonts.label, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  thMain: { flex: 1 },
  thRole: { width: 110, textAlign: 'right' },
  thNum: { width: 96, textAlign: 'right' },
  thActions: { width: 120, textAlign: 'right' },
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
  cellRole: { width: 110, alignItems: 'flex-end', gap: 4 },
  cellNum: { width: 96, fontFamily: Fonts.label, fontSize: 14, fontWeight: '700', textAlign: 'right' },
  cellActions: { width: 120, alignItems: 'flex-end' },
});