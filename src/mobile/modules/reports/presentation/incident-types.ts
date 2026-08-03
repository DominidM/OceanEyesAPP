import type { SymbolName } from '@/shared/components/app-symbol';

export type IncidentType = {
  id: string;
  label: string;
  icon: SymbolName;
};

export const INCIDENT_TYPES: IncidentType[] = [
  {
    id: 'spill',
    label: 'Derrame de hidrocarburos',
    icon: { ios: 'drop.fill', android: 'water-drop', web: 'water-drop' },
  },
  {
    id: 'pollution',
    label: 'Contaminación marina',
    icon: { ios: 'trash.fill', android: 'delete', web: 'delete' },
  },
  {
    id: 'fishing',
    label: 'Pesca ilegal',
    icon: { ios: 'fish.fill', android: 'phishing', web: 'phishing' },
  },
  {
    id: 'vessel',
    label: 'Embarcación siniestrada',
    icon: { ios: 'sailboat.fill', android: 'sailing', web: 'sailing' },
  },
  {
    id: 'wildlife',
    label: 'Fauna en peligro',
    icon: { ios: 'pawprint.fill', android: 'pets', web: 'pets' },
  },
  {
    id: 'debris',
    label: 'Desechos marinos',
    icon: { ios: 'arrow.3.trianglepath', android: 'recycling', web: 'recycling' },
  },
];

export function getIncidentType(id: string): IncidentType | undefined {
  return INCIDENT_TYPES.find((incident) => incident.id === id);
}
