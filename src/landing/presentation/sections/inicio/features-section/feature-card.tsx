import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';

type FeatureCardProps = {
  icon: number;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Image source={icon} style={styles.icon} contentFit="contain" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
    maxWidth: 550,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    width: 48,
    height: 48,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: BrandColors.primary,
    fontWeight: '600',
    fontFamily: Fonts.body,
    marginBottom: Spacing.two,
  },
  description: {
    fontSize: 14,
    color: '#5A7684',
    lineHeight: 21,
    fontFamily: Fonts.body,
  },
});
