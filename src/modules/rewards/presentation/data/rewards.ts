import { SymbolName } from '@/shared/components/app-symbol';

export type Reward = {
  id: string;
  title: string;
  subtitle: string;
  points: string;
  icon: SymbolName;
  locked?: boolean;
};

export const REWARDS: Reward[] = [
  {
    id: 'report',
    title: 'Reportar pesca ilegal',
    subtitle: 'Completa 5 reportes verificados',
    points: '350',
    icon: { ios: 'exclamationmark.triangle.fill', android: 'report', web: 'report' },
  },
  {
    id: 'water',
    title: 'Medir calidad del agua',
    subtitle: 'Conecta el sensor 10 veces',
    points: '120',
    icon: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  },
  {
    id: 'safety',
    title: 'Equipo de seguridad',
    subtitle: 'Alcanza el nivel 3',
    points: '500',
    icon: { ios: 'lock.fill', android: 'lock', web: 'lock' },
    locked: true,
  },
];

export const POINTS_BALANCE = '1,240';
export const LEVEL_BADGE = 'Nivel 3 Pescador';

export const PROGRESS = {
  label: 'Recompensas canjeadas',
  value: '8',
  fill: 0.6,
};

export const RECENT_CLAIMS: Reward[] = [
  {
    id: 'claim-fuel',
    title: 'Bono de combustible',
    subtitle: 'Canjeado hace 2 dias',
    points: '200',
    icon: { ios: 'fuelpump.fill', android: 'local_gas_station', web: 'local_gas_station' },
  },
  {
    id: 'claim-double',
    title: 'Puntos dobles',
    subtitle: 'Canjeado hace 1 semana',
    points: '80',
    icon: { ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' },
  },
];

export const RECENT_TEXT = 'Unieron 8 pescadores esta semana';
