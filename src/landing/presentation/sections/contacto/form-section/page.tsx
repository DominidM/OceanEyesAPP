import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const SUBJECT_OPTIONS = [
  'Consulta general',
  'Reportar pesca ilegal',
  'Sugerencia',
  'Colaboración',
  'Otro',
];

export function ContactoForm() {
  const { isMobile } = useBreakpoints();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [themeOpen, setThemeOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(56);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        alert('Hubo un error al enviar el mensaje. Intentá de nuevo.');
      }
    } catch {
      alert('Error de conexión. Revisá tu internet e intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.section, isMobile && styles.sectionMobile]}>
      <View style={[styles.row, isMobile && styles.rowMobile]}>
        <View style={[styles.formWrapper, isMobile && styles.formWrapperMobile]}>
          {sent ? (
            <View style={[styles.successCard, isMobile && styles.successCardMobile]}>
              <FontAwesome5 name="check-circle" size={48} color="#4ADE80" />
              <Text style={styles.successTitle}>Mensaje enviado</Text>
              <Text style={styles.successText}>
                Gracias por contactarnos. Te responderemos a la brevedad.
              </Text>
              <Pressable
                style={styles.btn}
                onPress={() => {
                  setSent(false);
                  setName('');
                  setEmail('');
                  setPhone('');
                  setSubject('');
                  setMessage('');
                }}
              >
                <Text style={styles.btnText}>Enviar otro mensaje</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.form, isMobile && styles.formMobile]}>
              <View style={[styles.inlineFields, isMobile && styles.inlineFieldsMobile]}>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Tu nombre completo"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                  />
                </View>

                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>Teléfono (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+51 987 654 321"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.field, themeOpen && styles.fieldOpen]}>
                <Text style={styles.label}>Asunto</Text>
                <View style={[styles.selectWrap, themeOpen && styles.selectWrapOpen]}>
                   <Pressable
                     style={[styles.selectTrigger, themeOpen && styles.selectTriggerOpen]}
                     onPress={() => setThemeOpen((v) => !v)}
                     onLayout={(e) => {
                       setMenuTop(e.nativeEvent.layout.height + 8);
                     }}
                   >
                    <Text
                      style={[styles.selectValue, !subject && styles.selectPlaceholder]}
                    >
                      {subject || 'Seleccioná un asunto'}
                    </Text>
                    <FontAwesome5
                      name={themeOpen ? 'chevron-up' : 'chevron-down'}
                      size={12}
                      color={BrandColors.primary}
                    />
                  </Pressable>
                  {themeOpen && (
                    <View style={[styles.selectMenu, { top: menuTop }]}>
                      {SUBJECT_OPTIONS.map((option) => (
                        <Pressable
                          key={option}
                          style={({ pressed }) => [
                            styles.selectOption,
                            pressed && styles.selectOptionPressed,
                            subject === option && styles.selectOptionActive,
                          ]}
                          onPress={() => {
                            setSubject(option);
                            setThemeOpen(false);
                          }}
                        >
                          <Text style={styles.selectOptionText}>{option}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Mensaje</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Escribí tu mensaje aquí..."
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <Pressable
                style={[styles.btn, (!name || !email || !subject || !message || loading) && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={!name || !email || !subject || !message || loading}
              >
                <FontAwesome5 name={loading ? 'spinner' : 'paper-plane'} size={14} color="#FFFFFF" />
                <Text style={styles.btnText}>{loading ? 'Enviando...' : 'Enviar Mensaje'}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    backgroundColor: BrandColors.tertiary,
    alignItems: 'center',
  },
  sectionMobile: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  row: {
    gap: Spacing.six,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },
  rowMobile: {
    flexDirection: 'column',
    gap: 0,
  },
  formWrapper: {
    width: '100%',
  },
  formWrapperMobile: {
    minWidth: 0,
    maxWidth: '100%',
    width: '100%',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.five,
    gap: Spacing.four,
    borderTopWidth: 4,
    borderTopColor: BrandColors.secondary,
  },
  formMobile: {
    padding: Spacing.four,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.six,
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 500,
    justifyContent: 'center',
    borderTopWidth: 4,
    borderTopColor: '#4ADE80',
  },
  successCardMobile: {
    padding: Spacing.four,
    minHeight: 0,
  },
  successTitle: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  successText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: BrandColors.neutral,
    opacity: 0.72,
    textAlign: 'center',
    lineHeight: 24,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  inlineFieldsMobile: {
    flexDirection: 'column',
  },
  field: {
    gap: Spacing.two,
  },
  fieldOpen: {
    position: 'relative',
    zIndex: 30,
  },
  fieldHalf: {
    flex: 1,
  },
  label: {
    fontFamily: Fonts.headline,
    fontSize: 15,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  input: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: BrandColors.neutral,
    backgroundColor: BrandColors.tertiary,
    borderRadius: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
  },
  textarea: {
    minHeight: 140,
  },
  selectWrap: {
    position: 'relative',
    overflow: 'visible',
  },
  selectWrapOpen: {
    zIndex: 30,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.tertiary,
    borderRadius: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three + 1,
    borderWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
  },
  selectTriggerOpen: {
    borderColor: BrandColors.secondary,
  },
  selectValue: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: BrandColors.neutral,
  },
  selectPlaceholder: {
    color: 'rgba(0,0,0,0.35)',
  },
  selectMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: Spacing.two,
    borderWidth: 1.5,
    borderColor: BrandColors.secondary,
    overflow: 'hidden',
    boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
  },
  selectOption: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  selectOptionPressed: {
    backgroundColor: 'rgba(152,185,177,0.25)',
  },
  selectOptionActive: {
    backgroundColor: 'rgba(152,185,177,0.15)',
  },
  selectOptionText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: BrandColors.neutral,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: 999,
    marginTop: Spacing.two,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: BrandColors.tertiary,
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
  },
});
