// ============================================================
// Descubre tu Rol · Contratos del quiz guiado de la landing.
// El JSON de respuestas (RolUserData) se envía como contexto a la
// IA y esta devuelve un RolSugerido. Módulo TS puro: lo usan la
// landing, la API local (+api) y el Worker de Cloudflare.
// ============================================================

/** Datos estructurados recolectados en la conversación (JSON). */
export interface RolUserData {
  nombre: string;
  preocupaciones: string[];
  entorno: string;
  habilidad: string;
  motivacion: string;
}

/** Resultado personalizado que devuelve el quiz. */
export interface RolSugerido {
  nombre: string;
  rolId: string;
  rol: string;
  tagline: string;
  descripcion: string;
  acciones: string[];
  color: string;
  perfil: string;
  imagen: string;
  /** Mensaje de cierre que la mascota muestra en el chat. */
  closing?: string;
}

export type RolStepType = 'text' | 'multi-select' | 'single-select';

export interface RolStep {
  id: string;
  field: keyof RolUserData;
  type: RolStepType;
  question: string;
  prompt: string;
  options: string[];
}

export const emptyRolUserData = (): RolUserData => ({
  nombre: '',
  preocupaciones: [],
  entorno: '',
  habilidad: '',
  motivacion: '',
});
