import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card, EmptyState, LoadingState, SectionHeader } from '@admin/presentation/components/ui';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { useAdminTheme } from '@admin/theme/context';
import { createOrganization, deleteOrganization, subscribeOrganizations, updateOrganization } from '@/shared/firebase/organizations';
import type { Organization } from '@/shared/firebase/types';

export function OrganizationsScreen() {
  const { colors, mode } = useAdminTheme();
  const isDark = mode === 'dark';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#1E293B' : '#E2E8F0';
  const inputBg = isDark ? '#0F172A' : '#F8FAFC';

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const unsub = subscribeOrganizations((list) => {
      setOrganizations(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  const submit = async () => {
    setFormError('');
    if (!name.trim() || !category.trim()) {
      setFormError('Completa nombre y categoría.');
      return;
    }
    setBusy(true);
    try {
      await createOrganization({
        name: name.trim(),
        category: category.trim(),
        description: description.trim() || undefined,
        website: website.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      });
      setName('');
      setCategory('');
      setDescription('');
      setWebsite('');
      setContactEmail('');
      setCreating(false);
    } catch (e: any) {
      setFormError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const toggleVerified = async (org: Organization) => {
    await updateOrganization(org.id, { verified: !org.verified });
  };

  const remove = async (id: string) => {
    await deleteOrganization(id);
  };

  return (
    <AdminShell title="ONGs" breadcrumb={[{ label: 'ONGs' }]}>
      <SectionHeader
        title="Catálogo de organizaciones"
        subtitle="ONGs y entidades que colaboran con la vigilancia marina. Las verificadas son visibles para municipalidades."
        actions={[
          <Button
            key="new"
            label={creating ? 'Cancelar' : 'Nueva ONG'}
            onPress={() => setCreating((v) => !v)}
            variant={creating ? 'secondary' : 'primary'}
          />,
        ]}
      />

      {creating && (
        <Card>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Nueva organización</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: muted }]}>Nombre</Text>
            <TextInput
              style={[styles.input, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
              value={name}
              onChangeText={setName}
              placeholder="Ej: MarLimpio Perú"
              placeholderTextColor={muted}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: muted }]}>Categoría</Text>
            <TextInput
              style={[styles.input, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
              value={category}
              onChangeText={setCategory}
              placeholder="Ej: Conservación marina"
              placeholderTextColor={muted}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: muted }]}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.inputMulti, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
              value={description}
              onChangeText={setDescription}
              placeholder="¿Qué hace esta organización?"
              placeholderTextColor={muted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: muted }]}>Web</Text>
              <TextInput
                style={[styles.input, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
                value={website}
                onChangeText={setWebsite}
                placeholder="https://..."
                placeholderTextColor={muted}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: muted }]}>Email de contacto</Text>
              <TextInput
                style={[styles.input, { color: colors.primary, borderColor, backgroundColor: inputBg }]}
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="contacto@ong.org"
                placeholderTextColor={muted}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {!!formError && <Text style={[styles.error, { color: colors.danger }]}>{formError}</Text>}
          <View style={styles.actions}>
            <Button label={busy ? 'Creando...' : 'Crear ONG'} onPress={submit} disabled={busy} />
          </View>
        </Card>
      )}

      {loading && <LoadingState label="Cargando organizaciones..." />}

      {!loading && organizations.length === 0 && !creating && (
        <EmptyState
          icon="hand-heart"
          title="No hay organizaciones aún."
          description="Agrega ONGs aliadas para que aparezcan en el catálogo de las municipalidades."
        />
      )}

      {organizations.map((org) => (
        <Card key={org.id}>
          <View style={styles.row}>
            <View style={styles.body}>
              <View style={styles.top}>
                <Text style={[styles.name, { color: colors.primary }]}>{org.name}</Text>
                <Badge label={org.category} color={muted} bg={inputBg} />
                {org.verified && <Badge label="Verificada" color="#10B981" bg="rgba(16,185,129,0.15)" />}
              </View>
              {org.description ? <Text style={[styles.desc, { color: muted }]}>{org.description}</Text> : null}
              {org.website ? <Text style={[styles.meta, { color: colors.accent }]}>{org.website}</Text> : null}
              {org.contactEmail ? <Text style={[styles.meta, { color: muted }]}>{org.contactEmail}</Text> : null}
            </View>
            <View style={styles.actionsRow}>
              <Button
                label={org.verified ? 'Quitar verificación' : 'Verificar'}
                variant={org.verified ? 'secondary' : 'primary'}
                onPress={() => toggleVerified(org)}
              />
              <Pressable style={styles.deleteBtn} onPress={() => remove(org.id)}>
                <FontAwesome5 name="trash-alt" size={16} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        </Card>
      ))}
    </AdminShell>
  );
}

export default OrganizationsScreen;

const styles = StyleSheet.create({
  cardTitle: { fontFamily: Fonts.headline, fontSize: 18, fontWeight: '700', marginBottom: Spacing.three },
  field: { gap: Spacing.one, marginBottom: Spacing.three, flex: 1, minWidth: 0 },
  fieldRow: { flexDirection: 'row', gap: Spacing.three },
  label: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.body,
    fontSize: 14,
  },
  inputMulti: { minHeight: 80 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: Spacing.two },
  error: { fontFamily: Fonts.body, fontSize: 13, marginBottom: Spacing.two },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.three },
  body: { flex: 1, gap: Spacing.one, minWidth: 0 },
  top: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  name: { fontFamily: Fonts.headline, fontSize: 16, fontWeight: '700' },
  desc: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 19 },
  meta: { fontFamily: Fonts.body, fontSize: 12 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    cursor: 'pointer',
  },
});