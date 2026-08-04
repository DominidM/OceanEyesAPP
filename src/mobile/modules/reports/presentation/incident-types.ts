import type { SymbolName } from '@/shared/components/app-symbol';
import type { ReportCategory } from '@/shared/firebase/types';

export type IncidentType = {
  id: ReportCategory;
  label: string;
  icon: SymbolName;
  points: number;
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
];

export function getIncidentType(id: ReportCategory): IncidentType | undefined {
  return INCIDENT_TYPES.find((incident) => incident.id === id);
}
