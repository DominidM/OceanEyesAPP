import { router, type Href } from 'expo-router';

import { BottomTabItem } from '@/shared/components/bottom-tab-bar';

export type MainTabKey = 'inicio' | 'reportes' | 'zonas' | 'perfil';

type MainTabDefinition = {
  key: MainTabKey;
  label: string;
  icon: BottomTabItem['icon'];
  href: Href;
};

const MAIN_TABS: MainTabDefinition[] = [
  {
    key: 'inicio',
    label: 'Inicio',
    icon: { ios: 'house.fill', android: 'home', web: 'home' },
    href: '/',
  },
  {
    key: 'reportes',
    label: 'Reportes',
    icon: { ios: 'doc.text.fill', android: 'article', web: 'article' },
    href: '/reporter',
  },
  {
    key: 'zonas',
    label: 'Zonas',
    icon: { ios: 'safari.fill', android: 'explore', web: 'explore' },
    href: '/explore',
  },
  {
    key: 'perfil',
    label: 'Perfil',
    icon: { ios: 'person.fill', android: 'person', web: 'person' },
    href: '/perfil',
  },
];

export function getMainTabs(active: MainTabKey): BottomTabItem[] {
  return MAIN_TABS.map(({ key, label, icon, href }) => ({
    label,
    icon,
    active: key === active,
    onPress: () => router.navigate(href),
  }));
}
