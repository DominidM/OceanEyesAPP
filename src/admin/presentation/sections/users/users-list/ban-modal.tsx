import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { useAdminTheme } from '@admin/theme/context';

type BanDuration =
  | { type: '24h' }
  | { type: '7d' }
  | { type: '30d' }
  | { type: 'permanent' }
  | { type: 'custom' };

const DURATION_PRESETS: { key: string; label: string; duration: BanDuration }[] = [
  { key: '24h', label: '24 horas', duration: { type: '24h' } },
  { key: '7d', label: '7 días', duration: { type: '7d' } },
  { key: '30d', label: '30 días', duration: { type: '30d' } },
  { key: 'permanent', label: 'Permanente', duration: { type: 'permanent' } },
];

function presetToEndsAt(preset: BanDuration): Date | null {
  const now = Date.now();
  const HOUR = 3600 * 1000;
  switch (preset.type) {
    case '24h': return new Date(now + 24 * HOUR);
    case '7d': return new Date(now + 7 * 24 * HOUR);
    case '30d': return new Date(now + 30 * 24 * HOUR);
    case 'permanent': return null;
    default: return null;
  }
}

export function BanModal({
  userName,
  onCancel,
  onConfirm,
}: {
  userName: string;
  onCancel: () => void;
  onConfirm: (endsAt: Date | null) => void;
}) {
  const { colors } = useAdminTheme();
  const [preset, setPreset] = useState<BanDuration>({ type: '7d' });
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const resolveEndsAt = (): Date | null => {
    if (preset.type !== 'custom') {
      return presetToEndsAt(preset);
    }
    const [y, m, d] = customDate.split('-').map(Number);
    const [hh, mm] = customTime.split(':').map(Number);
    if (!y || !m || !d || (customTime && (isNaN(hh) || isNaN(mm)))) return null;
    const date = new Date(y, m - 1, d, hh || 0, mm || 0);
    return isNaN(date.getTime()) ? null : date;
  };

  const handleConfirm = () => {
    if (preset.type === 'custom' && !customDate) return;
    onConfirm(resolveEndsAt());
  };

  const selected = preset.type;

  return (
    <View style={styles.overlay}>
      <View style={[styles.modal, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.contentText }]}>Banear usuario</Text>
          <Pressable onPress={onCancel} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={20} color={colors.contentTextMuted} />
          </Pressable>
        </View>

        <Text style={[styles.subtitle, { color: colors.contentTextMuted }]}>
          Selecciona la duración del baneo para {userName}.
        </Text>

        <View style={styles.presets}>
          {DURATION_PRESETS.map((p) => {
            const active = preset.type === p.duration.type;
            return (
              <Pressable
                key={p.key}
                onPress={() => setPreset(p.duration)}
                style={[
                  styles.presetBtn,
                  { borderColor: active ? colors.primary : colors.cardBorder },
                  active && { backgroundColor: colors.inputBg },
                ]}
              >
                <Text style={[styles.presetLabel, { color: active ? colors.primary : colors.contentTextMuted }]}>
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setPreset({ type: 'custom' })}
            style={[
              styles.presetBtn,
              { borderColor: selected === 'custom' ? colors.primary : colors.cardBorder },
              selected === 'custom' && { backgroundColor: colors.inputBg },
            ]}
          >
            <Text style={[styles.presetLabel, { color: selected === 'custom' ? colors.primary : colors.contentTextMuted }]}>
              Personalizado
            </Text>
          </Pressable>
        </View>

        {selected === 'custom' && (
          <View style={styles.customRow}>
            <View style={styles.customField}>
              <Text style={[styles.customLabel, { color: colors.contentTextMuted }]}>Fecha</Text>
              <TextInput
                value={customDate}
                onChangeText={setCustomDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.contentTextMuted}
                style={[styles.input, { color: colors.inputText, borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}
              />
            </View>
            <View style={styles.customField}>
              <Text style={[styles.customLabel, { color: colors.contentTextMuted }]}>Hora (opcional)</Text>
              <TextInput
                value={customTime}
                onChangeText={setCustomTime}
                placeholder="HH:MM"
                placeholderTextColor={colors.contentTextMuted}
                style={[styles.input, { color: colors.inputText, borderColor: colors.cardBorder, backgroundColor: colors.inputBg }]}
              />
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable onPress={onCancel} style={[styles.actionBtn, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.actionLabel, { color: colors.contentTextMuted }]}>Cancelar</Text>
          </Pressable>
          <Pressable onPress={handleConfirm} style={[styles.actionBtn, { backgroundColor: colors.danger }]}>
            <MaterialCommunityIcons name="cancel" size={16} color={colors.primaryText} />
            <Text style={[styles.actionLabel, { color: colors.primaryText }]}>Confirmar baneo</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 8, 16, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: Spacing.four,
  },
  modal: {
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontFamily: Fonts.headline, fontSize: 18, fontWeight: '700' },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  subtitle: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  presetBtn: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    cursor: 'pointer',
  },
  presetLabel: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '600' },
  customRow: { flexDirection: 'row', gap: Spacing.two },
  customField: { flex: 1, gap: Spacing.one },
  customLabel: { fontFamily: Fonts.body, fontSize: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: Spacing.two,
    cursor: 'pointer',
  },
  actionLabel: { fontFamily: Fonts.label, fontSize: 14, fontWeight: '700' },
});