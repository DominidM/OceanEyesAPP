import type { SymbolName } from '@/shared/components/app-symbol';
import type { ReportCategory } from '@/shared/firebase/types';

export type IncidentType = {
  id: ReportCategory;
  label: string;
  icon: SymbolName;
  points: number;
  custom?: boolean;
};

export const INCIDENT_TYPES: IncidentType[] = [
  {
    id: 'pesca_ilegal',
    label: 'Pesca ilegal',
    points: 100,
    icon: { ios: 'fish.fill', android: 'phishing', web: 'phishing' },
  },
  {
    id: 'basura_marina',
    label: 'Basura en el mar u orillas',
    points: 50,
    icon: { ios: 'trash.fill', android: 'delete', web: 'delete' },
  },
  {
    id: 'variacion_mar',
    label: 'Variación del mar',
    points: 30,
    icon: { ios: 'water.waves', android: 'waves', web: 'waves' },
  },
  {
    id: 'derrame_hidrocarburos',
    label: 'Derrame de hidrocarburos',
    points: 100,
    icon: { ios: 'drop.fill', android: 'water-drop', web: 'water-drop' },
  },
  {
    id: 'fauna_herida',
    label: 'Fauna marina herida o varada',
    points: 60,
    icon: { ios: 'pawprint.fill', android: 'pets', web: 'pets' },
  },
  {
    id: 'redes_fantasmas',
    label: 'Redes o aparejos abandonados',
    points: 50,
    icon: {
      ios: 'line.3.horizontal.decrease.circle.fill',
      android: 'filter_alt',
      web: 'filter_alt',
    },
  },
  {
    id: 'embarcacion_sospechosa',
    label: 'Embarcación sospechosa',
    points: 40,
    icon: { ios: 'sailboat.fill', android: 'directions-boat', web: 'directions-boat' },
  },
  {
    id: 'marea_roja',
    label: 'Marea roja o cambio de color del agua',
    points: 40,
    icon: { ios: 'drop.circle.fill', android: 'colorize', web: 'colorize' },
  },
  {
    id: 'otro',
    label: 'Otro incidente',
    points: 30,
    icon: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
    custom: true,
  },
];

export type CustomIconKey =
  | 'warning'
  | 'drop'
  | 'flame'
  | 'paw'
  | 'sailboat'
  | 'leaf'
  | 'heart'
  | 'tag';

export const CUSTOM_INCIDENT_ICONS: Record<CustomIconKey, SymbolName> = {
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  drop: { ios: 'drop.fill', android: 'water-drop', web: 'water-drop' },
  flame: { ios: 'flame.fill', android: 'local-fire-department', web: 'local-fire-department' },
  paw: { ios: 'pawprint.fill', android: 'pets', web: 'pets' },
  sailboat: { ios: 'sailboat.fill', android: 'directions-boat', web: 'directions-boat' },
  leaf: { ios: 'leaf.fill', android: 'eco', web: 'eco' },
  heart: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  tag: { ios: 'tag.fill', android: 'sell', web: 'sell' },
};

export const CUSTOM_INCIDENT_ICON_KEYS: CustomIconKey[] = [
  'warning',
  'drop',
  'flame',
  'paw',
  'sailboat',
  'leaf',
  'heart',
  'tag',
];

export function getIncidentType(id: ReportCategory): IncidentType | undefined {
  return INCIDENT_TYPES.find((incident) => incident.id === id);
}

export function isCustomIconKey(value: string): value is CustomIconKey {
  return value in CUSTOM_INCIDENT_ICONS;
}

export function resolveIncidentIcon(id: ReportCategory, customIcon?: string | null): SymbolName {
  if (customIcon && isCustomIconKey(customIcon)) {
    return CUSTOM_INCIDENT_ICONS[customIcon];
  }
  return getIncidentType(id)?.icon ?? CUSTOM_INCIDENT_ICONS.warning;
}
