import { SymbolName } from '@/shared/components/app-symbol';

export type TutorialStep = {
  id: string;
  icon: SymbolName;
  title: string;
  body: string;
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'report',
    icon: { ios: 'camera.fill', android: 'photo-camera', web: 'photo-camera' },
    title: 'Reporta un incidente',
    body: 'Toca el botón + o "Reportar un incidente" y captura una foto o video de lo que viste: pesca ilegal, basura marina o variación del mar.',
  },
  {
    id: 'location',
    icon: { ios: 'mappin.and.ellipse', android: 'location-on', web: 'location-on' },
    title: 'Confirma tu ubicación',
    body: 'Verifica que la ubicación sea la correcta. Así las autoridades podrán localizar el punto exacto del incidente y validarlo.',
  },
  {
    id: 'review',
    icon: { ios: 'clock.fill', android: 'schedule', web: 'schedule' },
    title: 'Tu reporte se revisa',
    body: 'Un equipo de vigilancia marítima valida cada reporte. Mientras tanto, su estado aparece como "Pendiente" en tu lista.',
  },
  {
    id: 'points',
    icon: { ios: 'star.fill', android: 'star', web: 'star' },
    title: 'Gana puntos verificados',
    body: 'Cuando tu reporte es verificado, sumas puntos a tu saldo y construyes tu reputación como Guardián del Mar.',
  },
  {
    id: 'redeem',
    icon: { ios: 'gift.fill', android: 'redeem', web: 'redeem' },
    title: 'Canjea recompensas',
    body: 'Usa tus puntos para canjear beneficios como bono de combustible, equipo de seguridad y más, directamente desde esta sección.',
  },
];
