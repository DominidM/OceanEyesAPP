import { rolPorId } from './roles';
import type { RolSugerido, RolUserData } from './types';

// ============================================================
// Motor local (fallback) · Mapea el JSON del usuario hacia un
// rol con reglas de afinidad, sin depender de la IA. Garantiza
// que la experiencia nunca se rompa si la API falla.
// ============================================================

interface Affinity {
  rolId: string;
  weight: number;
}

const KEYWORDS: Record<string, Affinity[]> = {
  // Preocupaciones
  'La pesca ilegal': [
    { rolId: 'vigia', weight: 3 },
    { rolId: 'centinela', weight: 1 },
  ],
  'La basura en el mar y las playas': [{ rolId: 'guardian', weight: 3 }],
  'Los derrames de petróleo': [{ rolId: 'centinela', weight: 3 }],
  'Los animales marinos heridos o varados': [{ rolId: 'protector', weight: 3 }],
  'Las redes y aparejos abandonados': [
    { rolId: 'guardian', weight: 2 },
    { rolId: 'protector', weight: 1 },
  ],
  'La marea roja o el cambio de color del agua': [
    { rolId: 'protector', weight: 2 },
    { rolId: 'centinela', weight: 2 },
  ],
  'Las embarcaciones sospechosas': [{ rolId: 'vigia', weight: 3 }],
  'Los cambios extraños del mar': [
    { rolId: 'centinela', weight: 2 },
    { rolId: 'vigia', weight: 1 },
  ],
  // Entorno
  'En la playa': [{ rolId: 'guardian', weight: 2 }],
  'En el puerto o zonas de pesca': [{ rolId: 'vigia', weight: 2 }],
  'En una comunidad costera': [
    { rolId: 'embajador', weight: 2 },
    { rolId: 'guardian', weight: 1 },
  ],
  'En la ciudad, pero visito la costa seguido': [{ rolId: 'embajador', weight: 1 }],
  'Casi no voy, pero me preocupa igual': [{ rolId: 'embajador', weight: 1 }],
  // Habilidad
  'Observar y detectar detalles': [{ rolId: 'vigia', weight: 3 }],
  'Organizar y liderar personas': [
    { rolId: 'embajador', weight: 2 },
    { rolId: 'guardian', weight: 1 },
  ],
  'Enseñar y comunicar': [{ rolId: 'embajador', weight: 3 }],
  'Actuar en el terreno': [
    { rolId: 'guardian', weight: 2 },
    { rolId: 'protector', weight: 1 },
  ],
  'Analizar datos y patrones': [{ rolId: 'centinela', weight: 3 }],
};

// Pistas dentro del texto libre de motivación
const MOTIVACION_HINTS: Record<string, Affinity[]> = {
  pesca: [{ rolId: 'vigia', weight: 2 }],
  pescadores: [{ rolId: 'vigia', weight: 1 }],
  basura: [{ rolId: 'guardian', weight: 2 }],
  plastico: [{ rolId: 'guardian', weight: 2 }],
  plástico: [{ rolId: 'guardian', weight: 2 }],
  limpieza: [{ rolId: 'guardian', weight: 2 }],
  playa: [{ rolId: 'guardian', weight: 1 }],
  petroleo: [{ rolId: 'centinela', weight: 2 }],
  petróleo: [{ rolId: 'centinela', weight: 2 }],
  derrame: [{ rolId: 'centinela', weight: 2 }],
  contaminacion: [{ rolId: 'centinela', weight: 2 }],
  contaminación: [{ rolId: 'centinela', weight: 2 }],
  tortuga: [{ rolId: 'protector', weight: 2 }],
  tortugas: [{ rolId: 'protector', weight: 2 }],
  animal: [{ rolId: 'protector', weight: 2 }],
  animales: [{ rolId: 'protector', weight: 2 }],
  fauna: [{ rolId: 'protector', weight: 2 }],
  delfin: [{ rolId: 'protector', weight: 2 }],
  delfines: [{ rolId: 'protector', weight: 2 }],
  ballena: [{ rolId: 'protector', weight: 2 }],
  ballenas: [{ rolId: 'protector', weight: 2 }],
  vida: [{ rolId: 'protector', weight: 1 }],
  naturaleza: [{ rolId: 'protector', weight: 1 }],
  hijos: [{ rolId: 'embajador', weight: 2 }],
  futuro: [{ rolId: 'embajador', weight: 1 }],
  generaciones: [{ rolId: 'embajador', weight: 2 }],
  comunidad: [{ rolId: 'embajador', weight: 2 }],
  gente: [{ rolId: 'embajador', weight: 1 }],
  personas: [{ rolId: 'embajador', weight: 1 }],
  enseñar: [{ rolId: 'embajador', weight: 2 }],
  educar: [{ rolId: 'embajador', weight: 2 }],
  buceo: [{ rolId: 'centinela', weight: 1 }],
  nadar: [{ rolId: 'protector', weight: 1 }],
  casa: [{ rolId: 'guardian', weight: 1 }],
  infancia: [{ rolId: 'embajador', weight: 1 }],
};

// Orden de desempate
const TIEBREAK = ['vigia', 'guardian', 'protector', 'centinela', 'embajador'];

export function getMockRecommendation(userData: RolUserData): RolSugerido {
  const scores = new Map<string, number>();

  const apply = (affinities: Affinity[]) => {
    for (const a of affinities) {
      scores.set(a.rolId, (scores.get(a.rolId) ?? 0) + a.weight);
    }
  };

  for (const preocupacion of userData.preocupaciones) apply(KEYWORDS[preocupacion] ?? []);
  apply(KEYWORDS[userData.entorno] ?? []);
  apply(KEYWORDS[userData.habilidad] ?? []);

  const motivacion = userData.motivacion.toLowerCase();
  for (const [key, affinities] of Object.entries(MOTIVACION_HINTS)) {
    if (motivacion.includes(key)) apply(affinities);
  }

  let best = TIEBREAK[0];
  for (const id of TIEBREAK) {
    if ((scores.get(id) ?? 0) > (scores.get(best) ?? 0)) best = id;
  }

  const rol = rolPorId(best);
  const nombre = userData.nombre.trim() || 'amigo';
  const preocupaciones =
    userData.preocupaciones.slice(0, 2).join(' y ').toLowerCase() || 'lo que pasa en el mar';

  const perfil = `${nombre}, todo lo que me contaste dibuja un perfil claro. Tu preocupación por ${preocupaciones} y tu forma de ser te alinean con ${rol.nombre}. No es casualidad: es tu forma natural de cuidar el océano.`;

  return {
    nombre,
    rolId: rol.id,
    rol: rol.nombre,
    tagline: rol.tagline,
    descripcion: rol.descripcion,
    acciones: rol.acciones,
    color: rol.color,
    perfil,
    imagen: rol.imagen,
    closing: `¡Listo, ${nombre}! Tu rol es ${rol.nombre}. El océano te necesita tal como eres.`,
  };
}
