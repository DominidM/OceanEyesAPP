import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { banDevice, listBannedDevices, unbanDevice, type BannedDevice } from '@/shared/firebase/bans';
import { useAdminTheme } from '@admin/theme/context';
import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card } from '@admin/presentation/components/ui';

export function BansScreen() {
  const { colors } = useAdminTheme();
  const [devices, setDevices] = useState<BannedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [hash, setHash] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDevices(await listBannedDevices());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleBan = async () => {
    const trimmed = hash.trim();
    if (!trimmed) return;
    await banDevice(trimmed, { reason: 'Ban manual desde el panel' });
    setHash('');
    setMessage('Dispositivo baneado.');
    await load();
  };

  const handleUnban = async (deviceHash: string) => {
    await unbanDevice(deviceHash);
    await load();
  };

  return (
    <AdminShell title="Dispositivos baneados">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card style={styles.formCard}>
          <Text style={[styles.formLabel, { color: colors.contentText }]}>Banear dispositivo manualmente</Text>
          <Text style={[styles.formHint, { color: colors.contentTextMuted }]}>
            Ingresa el hash de dispositivo (o banea desde un reporte descartado).
          </Text>
          <View style={styles.formRow}>
            <TextInput
              value={hash}
              onChangeText={setHash}
              placeholder="deviceHash..."
              placeholderTextColor={colors.contentTextMuted}
              style={[styles.input, { color: colors.contentText, borderColor: colors.cardBorder }]}
            />
            <Button label="Banear" variant="danger" onPress={handleBan} />
          </View>
          {message ? <Text style={[styles.message, { color: colors.success }]}>{message}</Text> : null}
        </Card>

        {loading && devices.length === 0 && (
          <Text style={[styles.empty, { color: colors.contentTextMuted }]}>Cargando dispositivos...</Text>
        )}
        {!loading && devices.length === 0 && (
          <Text style={[styles.empty, { color: colors.contentTextMuted }]}>No hay dispositivos baneados.</Text>
        )}

        <View style={styles.list}>
          {devices.map((device) => (
            <Card key={device.id} style={styles.row}>
              <View style={styles.rowBody}>
                <Text style={[styles.hash, { color: colors.cardText }]} numberOfLines={1}>
                  {device.id}
                </Text>
                <View style={styles.rowMeta}>
                  <Badge label="Baneado" color={colors.danger} bg={colors.dangerBg} />
                  <Text style={[styles.reason, { color: colors.contentTextMuted }]}>
                    {device.reason ?? 'Sin motivo'}
                  </Text>
                </View>
              </View>
              <Button label="Desbanear" variant="secondary" onPress={() => handleUnban(device.id)} />
            </Card>
          ))}
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default BansScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: Spacing.four },
  formCard: { gap: Spacing.two },
  formLabel: { fontFamily: Fonts.label, fontSize: 16, fontWeight: '700' },
  formHint: { fontFamily: Fonts.body, fontSize: 13 },
  formRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  message: { fontFamily: Fonts.body, fontSize: 13 },
  empty: { fontFamily: Fonts.body, fontSize: 14 },
  list: { gap: Spacing.two },
  row: { gap: Spacing.three },
  rowBody: { gap: Spacing.one },
  hash: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '600' },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reason: { fontFamily: Fonts.body, fontSize: 13, flexShrink: 1 },
});
