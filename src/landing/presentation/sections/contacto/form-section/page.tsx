import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

const contactImg = require('../../../../../../assets/images/IMAGEN-BAJO-MAR.jpg');

export function ContactoForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
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
    <View style={styles.section}>
      <View style={styles.row}>
        <View style={styles.imageCol}>
          <Image source={contactImg} style={styles.image} contentFit="cover" />
        </View>

        <View style={styles.formWrapper}>
          {sent ? (
            <View style={styles.successCard}>
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
                  setMessage('');
                }}
              >
                <Text style={styles.btnText}>Enviar otro mensaje</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inlineFields}>
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
                style={[styles.btn, (!name || !email || !message || loading) && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={!name || !email || !message || loading}
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
  row: {
    flexDirection: 'row',
    gap: Spacing.six,
    maxWidth: 1200,
    width: '100%',
    alignItems: 'flex-start',
  },
  formWrapper: {
    flex: 1,
    maxWidth: 700,
    minWidth: 400,
  },
  imageCol: {
    flex: 0.8,
    minWidth: 280,
    maxWidth: 400,
  },
  image: {
    width: '100%',
    height: 500,
    borderRadius: 20,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.five,
    gap: Spacing.four,
    borderTopWidth: 4,
    borderTopColor: BrandColors.secondary,
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
  field: {
    gap: Spacing.two,
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
