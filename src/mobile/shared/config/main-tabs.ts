import { BottomTabItem, BottomTabBarProps } from '@/shared/components/bottom-tab-bar';
import { SymbolName } from '@/shared/components/app-symbol';

export type MainTabKey = 'inicio' | 'reportes' | 'recompensas' | 'perfil';

type MainTabDefinition = {
  key: MainTabKey;
  label: string;
  icon: BottomTabItem['icon'];
};

const MAIN_TABS: MainTabDefinition[] = [
  {
    key: 'inicio',
    label: 'Inicio',
    icon: { ios: 'house.fill', android: 'home', web: 'home' },
  },
  {
    key: 'reportes',
    label: 'Reportes',
    icon: { ios: 'doc.text.fill', android: 'article', web: 'article' },
  },
  {
    key: 'recompensas',
    label: 'Recompensas',
    icon: { ios: 'gift.fill', android: 'redeem', web: 'redeem' },
  },
  {
    key: 'perfil',
    label: 'Perfil',
    icon: { ios: 'person.fill', android: 'person', web: 'person' },
  },
];

export function getMainTabs(active: MainTabKey, onSelect: (key: MainTabKey) => void): BottomTabItem[] {
  return MAIN_TABS.map(({ key, label, icon }) => ({
    label,
    icon,
    active: key === active,
    onPress: () => onSelect(key),
  }));
}

export const MAIN_FAB: NonNullable<BottomTabBarProps['fab']> = {
  icon: { ios: 'plus', android: 'add', web: 'add' } as SymbolName,
  afterIndex: 1,
};
