import type { RolStep } from './types';

// ============================================================
// Descubre tu Rol · Preguntas de la conversación guiada.
// Cada paso acumula un campo en el JSON de `RolUserData`.
// ============================================================

export const ROL_STEPS: RolStep[] = [
  {
    id: 'nombre',
    field: 'nombre',
    type: 'text',
    question: 'Para empezar, ¿cómo te llamas?',
    prompt: 'Escribe tu nombre',
    options: [],
  },
  {
    id: 'preocupaciones',
    field: 'preocupaciones',
    type: 'multi-select',
    question: '¿Qué es lo que más te preocupa del mar?',
    prompt: 'Elige todas las que apliquen',
    options: [
      'La pesca ilegal',
      'La basura en el mar y las playas',
      'Los derrames de petróleo',
      'Los animales marinos heridos o varados',
      'Las redes y aparejos abandonados',
      'La marea roja o el cambio de color del agua',
      'Las embarcaciones sospechosas',
      'Los cambios extraños del mar',
    ],
  },
  {
    id: 'entorno',
    field: 'entorno',
    type: 'single-select',
    question: '¿Dónde pasas más tiempo cerca del mar?',
    prompt: 'Elige una',
    options: [
      'En la playa',
      'En el puerto o zonas de pesca',
      'En una comunidad costera',
      'En la ciudad, pero visito la costa seguido',
      'Casi no voy, pero me preocupa igual',
    ],
  },
  {
    id: 'habilidad',
    field: 'habilidad',
    type: 'single-select',
    question: '¿Con cuál de estas habilidades te identificas más?',
    prompt: 'Elige una',
    options: [
      'Observar y detectar detalles',
      'Organizar y liderar personas',
      'Enseñar y comunicar',
      'Actuar en el terreno',
      'Analizar datos y patrones',
    ],
  },
  {
    id: 'motivacion',
    field: 'motivacion',
    type: 'text',
    question: 'Última pregunta… ¿por qué te importa el mar?',
    prompt: 'Cuéntame tu motivación',
    options: [],
  },
];
