import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

export function ContactoSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    const mailto = `mailto:contacto@oceaneyes.pe?subject=Contacto desde OceanEyes&body=Nombre: ${encodeURIComponent(name)}%0D%0AEmail: ${encodeURIComponent(email)}%0D%0A%0D%0A${encodeURIComponent(message)}`;
    window?.open?.(mailto, '_blank');
    setSent(true);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Contacto</Text>
      <Text style={styles.subtitle}>
        ¿Tenés preguntas, sugerencias o querés colaborar? Escribinos.
      </Text>

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
                setMessage('');
              }}
            >
              <Text style={styles.btnText}>Enviar otro mensaje</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre completo"
                placeholderTextColor="rgba(0,0,0,0.35)"
              />
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
              style={[styles.btn, (!name || !email || !message) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!name || !email || !message}
            >
              <FontAwesome5 name="paper-plane" size={14} color="#FFFFFF" />
              <Text style={styles.btnText}>Enviar Mensaje</Text>
            </Pressable>
          </View>
        )}
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
  title: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
    marginBottom: Spacing.three,
  },
  subtitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: BrandColors.neutral,
    opacity: 0.72,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.six,
  },
  formWrapper: {
    maxWidth: 700,
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
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.six,
    alignItems: 'center',
    gap: Spacing.three,
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
  field: {
    gap: Spacing.two,
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
