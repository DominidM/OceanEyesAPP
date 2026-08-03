import { MaterialIcons } from '@expo/vector-icons';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import React from 'react';
import { Platform, View } from 'react-native';

export type PlatformIcon = {
  ios: SFSymbol;
  android?: string;
  web?: string;
  default?: string;
};

export type SymbolName = SFSymbol | PlatformIcon;

type AppSymbolProps = {
  name: SymbolName;
  color: string;
  size?: number;
};

export function AppSymbol({ name, color, size = 20 }: AppSymbolProps) {
  const resolved = typeof name === 'string' ? name : Platform.select(name) ?? name.ios;

  if (Platform.OS === 'ios') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <SymbolView name={resolved as SFSymbol} tintColor={color} size={size} />
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialIcons name={resolved as any} color={color} size={size} />
    </View>
  );
}
