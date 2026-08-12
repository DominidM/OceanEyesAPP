import React, { useRef, useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [pointsCost, setPointsCost] = useState(initial?.pointsCost != null ? String(initial.pointsCost) : '');
  const [stock, setStock] = useState(initial?.stock != null ? String(initial.stock) : '∞');
  const [sponsor, setSponsor] = useState(initial?.sponsor ?? '');
  const [imageURL, setImageURL] = useState(initial?.imageURL ?? '');
  const [imagePreview, setImagePreview] = useState(initial?.imageURL ?? '');
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState('');
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(200);
  const [cropH, setCropH] = useState(200);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [editTab, setEditTab] = useState<'crop' | 'adjust'>('crop');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCropImage(dataUrl);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropSave = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      const scaleX = imgNatural.w / (img.clientWidth || imgNatural.w);
      const scaleY = imgNatural.h / (img.clientHeight || imgNatural.h);
      const srcX = cropX * scaleX;
      const srcY = cropY * scaleY;
      const srcW = cropW * scaleX;
      const srcH = cropH * scaleY;
      const size = Math.max(srcW, srcH);
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, 400, 400);
      const result = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(result);
      setImageURL(result);
      setCropOpen(false);
    };
    img.src = cropImage;
  };

  const imgFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  const resetAdjust = () => { setBrightness(100); setContrast(100); setSaturation(100); };

  const initCrop = (el: HTMLImageElement) => {
    if (el && !el.dataset.loaded) {
      el.dataset.loaded = '1';
      const w = Math.min(el.clientWidth * 0.8, 360);
      const h = Math.min(el.clientHeight * 0.8, 300);
      setCropW(w);
      setCropH(h);
      setCropX((el.clientWidth - w) / 2);
      setCropY((el.clientHeight - h) / 2);
      setImgNatural({ w: el.naturalWidth, h: el.naturalHeight });
    }
  };

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
    <>
      <View style={styles.layout}>
        <View style={styles.imageCol}>
          <Card style={styles.imageCard}>
            <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Imagen de la recompensa</Text>
            {imagePreview ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: imagePreview }} style={styles.previewImg} contentFit="cover" />
                <Pressable
                  style={[styles.removeBtn, { backgroundColor: colors.danger }]}
                  onPress={() => { setImagePreview(''); setImageURL(''); }}
                >
                  <MaterialCommunityIcons name="close" size={16} color="#FFF" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[styles.uploadArea, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                onPress={() => fileInputRef.current?.click()}
              >
                <MaterialCommunityIcons name="image-plus" size={40} color={colors.contentTextMuted} />
                <Text style={[styles.uploadText, { color: colors.contentTextMuted }]}>
                  Subir imagen
                </Text>
                <Text style={[styles.uploadHint, { color: colors.contentTextMuted }]}>
                  JPG, PNG o WebP
                </Text>
              </Pressable>
            )}
            <input
              ref={fileInputRef as any}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            {imagePreview && (
              <Pressable
                style={[styles.changeBtn, { borderColor: colors.inputBorder }]}
                onPress={() => fileInputRef.current?.click()}
              >
                <Text style={[styles.changeBtnText, { color: colors.contentText }]}>Cambiar imagen</Text>
              </Pressable>
            )}
          </Card>
        </View>

        <View style={styles.contentCol}>
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
                  <Text style={[styles.label, { color: colors.contentTextMuted }]}>Estado</Text>
                  <View style={styles.stateRow}>
                    {stateOption(true, 'Activo')}
                    {stateOption(false, 'Inactivo')}
                  </View>
                </View>
              </View>
            </View>
          </Card>

          {!!error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}

          <View style={styles.actions}>
            <Button label={busy ? busyLabel : submitLabel} onPress={handleSubmit} disabled={busy} />
            <Button label="Cancelar" variant="secondary" onPress={onCancel} disabled={busy} />
          </View>
        </View>
      </View>

      {cropOpen && (
        <View style={styles.overlay}>
          <View style={styles.cropModal}>
            <View style={styles.cropHeader}>
              <Pressable onPress={() => setCropOpen(false)} hitSlop={8}>
                <MaterialCommunityIcons name="close" size={20} color="#FFF" />
              </Pressable>
              <View style={styles.tabRow}>
                <Pressable onPress={() => setEditTab('crop')} style={[styles.tab, editTab === 'crop' && styles.tabActive]}>
                  <MaterialCommunityIcons name="crop" size={16} color={editTab === 'crop' ? '#FFF' : 'rgba(255,255,255,0.5)'} />
                  <Text style={[styles.tabText, editTab === 'crop' && styles.tabTextActive]}>Recortar</Text>
                </Pressable>
                <Pressable onPress={() => setEditTab('adjust')} style={[styles.tab, editTab === 'adjust' && styles.tabActive]}>
                  <MaterialCommunityIcons name="brightness-6" size={16} color={editTab === 'adjust' ? '#FFF' : 'rgba(255,255,255,0.5)'} />
                  <Text style={[styles.tabText, editTab === 'adjust' && styles.tabTextActive]}>Ajustar</Text>
                </Pressable>
              </View>
              <Pressable onPress={handleCropSave} hitSlop={8}>
                <MaterialCommunityIcons name="check" size={22} color="#FFF" />
              </Pressable>
            </View>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 16px 8px', overflow: 'hidden' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  ref={(el) => { if (el) initCrop(el); }}
                  src={cropImage}
                  style={{ display: 'block', maxWidth: '100%', maxHeight: 360, userSelect: 'none', borderRadius: 6, filter: editTab === 'adjust' ? imgFilter : undefined }}
                  onLoad={(e: any) => {
                    const el = e.target;
                    setImgNatural({ w: el.naturalWidth, h: el.naturalHeight });
                    const w = Math.min(el.clientWidth * 0.8, 360);
                    const h = Math.min(el.clientHeight * 0.8, 300);
                    setCropW(w);
                    setCropH(h);
                    setCropX((el.clientWidth - w) / 2);
                    setCropY((el.clientHeight - h) / 2);
                  }}
                  draggable={false}
                />
                {editTab === 'crop' && (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        left: cropX,
                        top: cropY,
                        width: cropW,
                        height: cropH,
                        border: '2px solid rgba(255,255,255,0.9)',
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                        cursor: 'move',
                        borderRadius: 4,
                      }}
                      onMouseDown={(startE: React.MouseEvent) => {
                        startE.preventDefault();
                        const imgEl = (startE.target as HTMLElement).parentElement?.querySelector('img');
                        const maxW = imgEl?.clientWidth ?? 400;
                        const maxH = imgEl?.clientHeight ?? 400;
                        const startX = startE.clientX;
                        const startY = startE.clientY;
                        const origX = cropX;
                        const origY = cropY;
                        const onMove = (me: MouseEvent) => {
                          setCropX(Math.max(0, Math.min(origX + me.clientX - startX, maxW - cropW)));
                          setCropY(Math.max(0, Math.min(origY + me.clientY - startY, maxH - cropH)));
                        };
                        const onUp = () => {
                          document.removeEventListener('mousemove', onMove);
                          document.removeEventListener('mouseup', onUp);
                        };
                        document.addEventListener('mousemove', onMove);
                        document.addEventListener('mouseup', onUp);
                      }}
                    />
                    {/* Corners */}
                    <div style={{ position: 'absolute', left: cropX - 5, top: cropY - 5, width: 10, height: 10, background: '#FFF', borderRadius: 2, cursor: 'nw-resize', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                      onMouseDown={(e: React.MouseEvent) => {
                        e.preventDefault(); e.stopPropagation();
                        const imgEl = (e.target as HTMLElement).parentElement?.querySelector('img');
                        const maxW = imgEl?.clientWidth ?? 400; const maxH = imgEl?.clientHeight ?? 400;
                        const sx = e.clientX; const sy = e.clientY;
                        const ox = cropX; const oy = cropY; const ow = cropW; const oh = cropH;
                        const onMove = (me: MouseEvent) => {
                          const dx = me.clientX - sx; const dy = me.clientY - sy;
                          const nw = Math.max(60, ow - dx); const nh = Math.max(60, oh - dy);
                          setCropW(nw); setCropH(nh);
                          setCropX(ox + ow - nw); setCropY(oy + oh - nh);
                        };
                        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                      }}
                    />
                    <div style={{ position: 'absolute', left: cropX + cropW - 5, top: cropY - 5, width: 10, height: 10, background: '#FFF', borderRadius: 2, cursor: 'ne-resize', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                      onMouseDown={(e: React.MouseEvent) => {
                        e.preventDefault(); e.stopPropagation();
                        const imgEl = (e.target as HTMLElement).parentElement?.querySelector('img');
                        const maxW = imgEl?.clientWidth ?? 400;
                        const sx = e.clientX; const sy = e.clientY;
                        const ow = cropW; const oh = cropH; const oy = cropY;
                        const onMove = (me: MouseEvent) => {
                          setCropW(Math.max(60, ow + me.clientX - sx));
                          setCropH(Math.max(60, oh - (me.clientY - sy)));
                          setCropY(oy + oh - Math.max(60, oh - (me.clientY - sy)));
                        };
                        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                      }}
                    />
                    <div style={{ position: 'absolute', left: cropX - 5, top: cropY + cropH - 5, width: 10, height: 10, background: '#FFF', borderRadius: 2, cursor: 'sw-resize', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                      onMouseDown={(e: React.MouseEvent) => {
                        e.preventDefault(); e.stopPropagation();
                        const imgEl = (e.target as HTMLElement).parentElement?.querySelector('img');
                        const maxH = imgEl?.clientHeight ?? 400;
                        const sx = e.clientX; const sy = e.clientY;
                        const ox = cropX; const ow = cropW; const oh = cropH;
                        const onMove = (me: MouseEvent) => {
                          setCropW(Math.max(60, ow - (me.clientX - sx)));
                          setCropH(Math.max(60, oh + me.clientY - sy));
                          setCropX(ox + ow - Math.max(60, ow - (me.clientX - sx)));
                        };
                        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                      }}
                    />
                    <div style={{ position: 'absolute', left: cropX + cropW - 5, top: cropY + cropH - 5, width: 10, height: 10, background: '#FFF', borderRadius: 2, cursor: 'se-resize', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                      onMouseDown={(e: React.MouseEvent) => {
                        e.preventDefault(); e.stopPropagation();
                        const sx = e.clientX; const sy = e.clientY;
                        const ow = cropW; const oh = cropH;
                        const onMove = (me: MouseEvent) => {
                          setCropW(Math.max(60, ow + me.clientX - sx));
                          setCropH(Math.max(60, oh + me.clientY - sy));
                        };
                        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                      }}
                    />
                    {/* Edge handles */}
                    <div style={{ position: 'absolute', left: cropX + cropW / 2 - 10, top: cropY - 4, width: 20, height: 8, background: '#FFF', borderRadius: 4, cursor: 'n-resize', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                      onMouseDown={(e: React.MouseEvent) => {
                        e.preventDefault(); e.stopPropagation();
                        const sy = e.clientY; const oy = cropY; const oh = cropH;
                        const onMove = (me: MouseEvent) => {
                          const dy = me.clientY - sy;
                          const nh = Math.max(60, oh - dy);
                          setCropH(nh); setCropY(oy + oh - nh);
                        };
                        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                      }}
                    />
                    <div style={{ position: 'absolute', left: cropX + cropW / 2 - 10, top: cropY + cropH - 4, width: 20, height: 8, background: '#FFF', borderRadius: 4, cursor: 's-resize', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                      onMouseDown={(e: React.MouseEvent) => {
                        e.preventDefault(); e.stopPropagation();
                        const sy = e.clientY; const oh = cropH;
                        const onMove = (me: MouseEvent) => { setCropH(Math.max(60, oh + me.clientY - sy)); };
                        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                      }}
                    />
                    <div style={{ position: 'absolute', left: cropX - 4, top: cropY + cropH / 2 - 10, width: 8, height: 20, background: '#FFF', borderRadius: 4, cursor: 'w-resize', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                      onMouseDown={(e: React.MouseEvent) => {
                        e.preventDefault(); e.stopPropagation();
                        const sx = e.clientX; const ox = cropX; const ow = cropW;
                        const onMove = (me: MouseEvent) => {
                          const nw = Math.max(60, ow - (me.clientX - sx));
                          setCropW(nw); setCropX(ox + ow - nw);
                        };
                        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                      }}
                    />
                    <div style={{ position: 'absolute', left: cropX + cropW - 4, top: cropY + cropH / 2 - 10, width: 8, height: 20, background: '#FFF', borderRadius: 4, cursor: 'e-resize', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                      onMouseDown={(e: React.MouseEvent) => {
                        e.preventDefault(); e.stopPropagation();
                        const sx = e.clientX; const ow = cropW;
                        const onMove = (me: MouseEvent) => { setCropW(Math.max(60, ow + me.clientX - sx)); };
                        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            {editTab === 'adjust' && (
              <div style={{ padding: '8px 24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#FFF', fontSize: 13, width: 90, fontFamily: 'Inter, sans-serif' }}>Brillo</span>
                  <input type="range" min={30} max={200} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} style={{ flex: 1, accentColor: '#FFF' }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, width: 36, textAlign: 'right', fontFamily: 'Inter, sans-serif' }}>{brightness}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#FFF', fontSize: 13, width: 90, fontFamily: 'Inter, sans-serif' }}>Contraste</span>
                  <input type="range" min={30} max={200} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} style={{ flex: 1, accentColor: '#FFF' }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, width: 36, textAlign: 'right', fontFamily: 'Inter, sans-serif' }}>{contrast}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#FFF', fontSize: 13, width: 90, fontFamily: 'Inter, sans-serif' }}>Saturación</span>
                  <input type="range" min={0} max={200} value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} style={{ flex: 1, accentColor: '#FFF' }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, width: 36, textAlign: 'right', fontFamily: 'Inter, sans-serif' }}>{saturation}%</span>
                </div>
                <Pressable onPress={resetAdjust} style={{ alignSelf: 'flex-end' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Restablecer</Text>
                </Pressable>
              </div>
            )}
            <div style={{ padding: '0 16px 16px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => { setCropOpen(false); setTimeout(() => fileInputRef.current?.click(), 100); }}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 20px', color: '#FFF', fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span style={{ fontSize: 16 }}>+</span> Cambiar imagen
              </button>
            </div>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  layout: { flexDirection: 'row', gap: Spacing.four },
  imageCol: { width: 280, flexShrink: 0 },
  contentCol: { flex: 1, gap: Spacing.three },
  imageCard: { gap: Spacing.three },
  previewWrap: { position: 'relative', borderRadius: 12, overflow: 'hidden' },
  previewImg: { width: '100%', height: 220, borderRadius: 12 },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    cursor: 'pointer',
  },
  uploadText: { fontFamily: Fonts.body, fontSize: 14, fontWeight: '600' },
  uploadHint: { fontFamily: Fonts.body, fontSize: 12 },
  changeBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    cursor: 'pointer',
  },
  changeBtnText: { fontFamily: Fonts.body, fontSize: 13, fontWeight: '600' },
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
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two },
  error: { fontFamily: Fonts.body, fontSize: 13, textAlign: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropModal: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cropTitle: { fontFamily: Fonts.headline, fontSize: 16, fontWeight: '700', color: '#FFF' },
  tabRow: { flexDirection: 'row', gap: Spacing.two },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.three, paddingVertical: 6, borderRadius: 999, cursor: 'pointer' },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  tabText: { fontFamily: Fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
});
