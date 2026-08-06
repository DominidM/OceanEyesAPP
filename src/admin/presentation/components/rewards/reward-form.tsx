import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card } from '@admin/presentation/components/ui';
import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { useAdminTheme } from '@admin/theme/context';

export type RewardFormValues = {
  title: string;
  description: string;
  pointsCost: number;
  stock: number | null;
  active: boolean;
  sponsor?: string;
  imageURL?: string;
};

type RewardFormProps = {
  initial?: Partial<RewardFormValues>;
  submitLabel: string;
  busyLabel: string;
  onCancel: () => void;
  onSubmit: (values: RewardFormValues) => Promise<void>;
};

export function RewardForm({ initial, submitLabel, busyLabel, onCancel, onSubmit }: RewardFormProps) {
  const { colors } = useAdminTheme();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [pointsCost, setPointsCost] = useState(initial?.pointsCost != null ? String(initial.pointsCost) : '');
  const [stock, setStock] = useState(initial?.stock != null ? String(initial.stock) : '∞');
  const [sponsor, setSponsor] = useState(initial?.sponsor ?? '');
  const [imageURL, setImageURL] = useState(initial?.imageURL ?? '');
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError('');
    const cost = Number(pointsCost);
    if (!title.trim() || Number.isNaN(cost) || cost <= 0) {
      setError('Completa el título y un costo en puntos válido (mayor a 0).');
      return;
    }
    const stockParsed = stock.trim() === '∞' || stock.trim() === '' ? null : Number(stock);
    if (stockParsed !== null && (Number.isNaN(stockParsed) || stockParsed < 0)) {
      setError('El stock debe ser un número mayor o igual a 0, o ∞ para ilimitado.');
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        pointsCost: cost,
        stock: stockParsed,
        active,
        sponsor: sponsor.trim() || undefined,
        imageURL: imageURL.trim() || undefined,
      });
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = [
    styles.input,
    { borderColor: colors.inputBorder, color: colors.inputText, backgroundColor: colors.inputBg },
  ];

  const stateOption = (value: boolean, label: string) => {
    const selected = active === value;
    return (
      <Pressable
        key={String(value)}
        onPress={() => setActive(value)}
        style={[
          styles.stateBtn,
          { borderColor: selected ? colors.primary : colors.inputBorder },
          selected && { backgroundColor: colors.inputBg },
        ]}
      >
        <Text style={[styles.stateLabel, { color: selected ? colors.primary : colors.contentTextMuted }]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <Card style={styles.card}>
      <View style={[styles.subBlock, { borderColor: colors.cardBorder }]}>
        <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Datos de la recompensa</Text>

        <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.contentTextMuted }]}>Título</Text>
          <TextInput
            autoCapitalize="sentences"
            onChangeText={setTitle}
            placeholder="Ej. Bono de combustible"
            placeholderTextColor={colors.contentTextMuted}
            style={inputStyle}
            value={title}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.contentTextMuted }]}>Descripción</Text>
          <TextInput
            autoCapitalize="sentences"
            multiline
            numberOfLines={4}
            onChangeText={setDescription}
            placeholder="Describe la recompensa y las condiciones de canje."
            placeholderTextColor={colors.contentTextMuted}
            style={[inputStyle, styles.textarea]}
            value={description}
          />
        </View>

        <View style={styles.rowFields}>
          <View style={[styles.field, styles.flex1]}>
            <Text style={[styles.label, { color: colors.contentTextMuted }]}>Costo (puntos)</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setPointsCost}
              placeholder="100"
              placeholderTextColor={colors.contentTextMuted}
              style={inputStyle}
              value={pointsCost}
            />
          </View>
          <View style={[styles.field, styles.flex1]}>
            <Text style={[styles.label, { color: colors.contentTextMuted }]}>Stock (∞ = ilimitado)</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setStock}
              placeholder="∞"
              placeholderTextColor={colors.contentTextMuted}
              style={inputStyle}
              value={stock}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.contentTextMuted }]}>Patrocinador (opcional)</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setSponsor}
            placeholder="Ej. OceanEyes"
            placeholderTextColor={colors.contentTextMuted}
            style={inputStyle}
            value={sponsor}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.contentTextMuted }]}>Imagen (URL, opcional)</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="url"
            onChangeText={setImageURL}
            placeholder="https://..."
            placeholderTextColor={colors.contentTextMuted}
            style={inputStyle}
            value={imageURL}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.contentTextMuted }]}>Estado</Text>
          <View style={styles.stateRow}>
            {stateOption(true, 'Activo')}
            {stateOption(false, 'Inactivo')}
          </View>
        </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button label={busy ? busyLabel : submitLabel} onPress={handleSubmit} disabled={busy} />
        <Button label="Cancelar" variant="secondary" onPress={onCancel} disabled={busy} />
      </View>

      {!!error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  subBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  subBlockTitle: { fontFamily: Fonts.label, fontSize: 14, fontWeight: '700' },
  form: { gap: Spacing.three },
  field: { gap: Spacing.one },
  label: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    fontFamily: Fonts.body,
    fontSize: 15,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    userSelect: 'auto',
    cursor: 'text',
  },
  textarea: { minHeight: 96, textAlignVertical: 'top' },
  rowFields: { flexDirection: 'row', gap: Spacing.three },
  flex1: { flex: 1 },
  stateRow: { flexDirection: 'row', gap: Spacing.two },
  stateBtn: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: Spacing.three,
    cursor: 'pointer',
  },
  stateLabel: { fontFamily: Fonts.label, fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two, marginTop: Spacing.one },
  error: { fontFamily: Fonts.body, fontSize: 13, textAlign: 'center' },
});
