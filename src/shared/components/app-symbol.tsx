import { SymbolView, type SFSymbol } from 'expo-symbols';
import React from 'react';
import { Platform } from 'react-native';

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
  return <SymbolView name={resolved as SFSymbol} tintColor={color} size={size} />;
}
