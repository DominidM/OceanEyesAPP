// ============================================================
// Descubre tu Rol · Roles/personajes de OceanEyes.
// Alineados con las categorías reales de reporte de la app
// (src/mobile/modules/reports/domain/valueObjects/report-category.ts).
// ============================================================

export interface Rol {
  id: string;
  nombre: string;
  tagline: string;
  descripcion: string;
  acciones: string[];
  color: string;
  imagen: string;
}

export const MASCOT_NAME = 'Guía';

export const MASCOT_IMAGES = {
  bienvenido:
    'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786374847/bienvenido_u4ncjz.png',
  charlando:
    'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786374170/charlando_egxaao.png',
  pensativo:
    'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786374170/pensativo_bd83qb.png',
} as const;

export const ROLES: Rol[] = [
  {
    id: 'vigia',
    nombre: 'El Vigía',
    tagline: 'Nada escapa a los ojos que cuidan el mar.',
    descripcion:
      'Tu mirada atenta es la primera línea de defensa del océano. Detectas lo que otros pasan por alto: pesca ilegal, embarcaciones sospechosas y movimientos extraños en el agua. Reportar a tiempo puede frenar un daño enorme.',
    acciones: [
      'Descarga OceanEyes y crea tu cuenta',
      'Reporta pesca ilegal o embarcaciones sospechadas desde el mapa',
      'Gana puntos por cada reporte verificado por la comunidad',
    ],
    color: '#1D6A96',
    imagen:
      'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786374171/vigia_w2xrck.png',
  },
  {
    id: 'guardian',
    nombre: 'El Guardián de Costas',
    tagline: 'Cada playa limpia empieza con alguien que se anima.',
    descripcion:
      'Eres de los que actúan: la basura en la orilla y las redes fantasma no se van solas. Tu energía en el terreno convierte una costa descuidada en un hogar seguro para la vida marina.',
    acciones: [
      'Descarga OceanEyes y crea tu cuenta',
      'Reporta basura marina y redes o aparejos abandonados',
      'Suma puntos y canjea recompensas por cuidar tu costa',
    ],
    color: '#2E8B6F',
    imagen:
      'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786374171/guardia_ya0n1d.png',
  },
  {
    id: 'protector',
    nombre: 'El Protector de Fauna',
    tagline: 'Cada vida marina que salvamos, salva un pedazo del océano.',
    descripcion:
      'Tu corazón está con las criaturas del mar. Avisar a tiempo sobre un animal herido, un varamiento o una marea roja puede significar la diferencia entre la vida y la muerte para la fauna costera.',
    acciones: [
      'Descarga OceanEyes y crea tu cuenta',
      'Reporta fauna marina herida o varada y marea roja',
      'Alerta a la comunidad y ayuda a que la ayuda llegue rápido',
    ],
    color: '#E07A5F',
    imagen:
      'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786374171/protector-fauna_lojfa0.png',
  },
  {
    id: 'centinela',
    nombre: 'El Centinela',
    tagline: 'El mar avisa; alguien tiene que estar mirando.',
    descripcion:
      'Te fijas en las señales: cambios de color, derrames, temperaturas extrañas. Tu capacidad de observar patrones convierte datos sueltos en alertas tempranas para todo el ecosistema.',
    acciones: [
      'Descarga OceanEyes y crea tu cuenta',
      'Reporta derrames de hidrocarburos y variaciones del mar',
      'Ayuda a construir el mapa en tiempo real de la salud del océano',
    ],
    color: '#6D4C90',
    imagen:
      'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786374171/centinela_rczges.png',
  },
  {
    id: 'embajador',
    nombre: 'El Embajador',
    tagline: 'El cambio empieza cuando logras que otros miren el mar.',
    descripcion:
      'Tu don es contagiar. Enseñas, organizas y haces que más personas se sumen a cuidar el océano. Una comunidad entera protegiendo su costa vale más que mil ojos sueltos.',
    acciones: [
      'Descarga OceanEyes y crea tu cuenta',
      'Invita a tu comunidad a reportar y cuidar la costa contigo',
      'Comparte tus logros y sube de nivel como Guardián del Mar',
    ],
    color: '#C9A227',
    imagen:
      'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786374171/embajador_dhcriw.png',
  },
];

export const rolPorId = (id: string): Rol =>
  ROLES.find((rol) => rol.id === id) ?? ROLES[0];
