import { SymbolView } from 'expo-symbols';
import React from 'react';

export type SymbolName = React.ComponentProps<typeof SymbolView>['name'];

type AppSymbolProps = {
  name: SymbolName;
  color: string;
  size?: number;
};

export function AppSymbol({ name, color, size = 20 }: AppSymbolProps) {
  return <SymbolView name={name} tintColor={color} size={size} />;
}
