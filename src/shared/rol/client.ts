import { getMockRecommendation } from './mock-rol';
import type { RolSugerido, RolUserData } from './types';

// ============================================================
// Descubre tu Rol · Cliente usado por la landing.
// Llama a POST /api/rol (API local en dev, Worker en producción)
// y, si la API no está disponible, cae al motor local para que
// la experiencia nunca se rompa.
// ============================================================

const API_URL = '/api/rol';

export async function fetchRolRecommendation(userData: RolUserData): Promise<RolSugerido> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'recommend', userData }),
    });
    if (!res.ok) throw new Error(`La API respondió ${res.status}`);
    const data = (await res.json()) as { result?: RolSugerido };
    if (!data?.result) throw new Error('La API no devolvió un resultado');
    return data.result;
  } catch (err) {
    console.warn('[rol] API no disponible, usando modo local.', err);
    return getMockRecommendation(userData);
  }
}

export async function fetchRolReply(userData: RolUserData, message: string): Promise<string> {
  const nombre = userData.nombre.trim() || 'amigo';
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'reply', userData, message }),
    });
    if (!res.ok) throw new Error(`La API respondió ${res.status}`);
    const data = (await res.json()) as { reply?: string };
    if (!data?.reply?.trim()) throw new Error('La API no devolvió una respuesta');
    return data.reply.trim();
  } catch (err) {
    console.warn('[rol] Respuesta IA no disponible, usando respuesta genérica.', err);
    return `¡Gracias por compartirlo, ${nombre}! Me encanta tu energía. Dame un momento para descubrir tu rol.`;
  }
}
