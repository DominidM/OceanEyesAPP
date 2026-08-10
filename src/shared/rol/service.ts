import { callGemini, DEFAULT_GEMINI_MODEL, splitGeminiKeys } from './gemini';
import { getMockRecommendation } from './mock-rol';
import {
  buildRecommendPrompt,
  buildReplyPrompt,
  cleanReply,
  matchRol,
  parseJson,
} from './prompt';
import type { RolSugerido, RolUserData } from './types';

// ============================================================
// Descubre tu Rol · Servicio del lado del servidor.
// Intenta con Gemini (API key en el servidor) y, ante cualquier
// fallo o falta de configuración, cae al motor local para que
// la experiencia nunca se rompa. Lo usan la API local (+api)
// y el Worker de Cloudflare.
// ============================================================

const str = (v: unknown, fallback: string) =>
  typeof v === 'string' && v.trim() ? v.trim() : fallback;
const arr = (v: unknown, fallback: string[]) =>
  Array.isArray(v) && v.length > 0 ? v.map(String) : fallback;

export async function getRolRecommendation(
  userData: RolUserData,
  rawApiKeys?: string,
  model?: string,
): Promise<RolSugerido> {
  const apiKeys = splitGeminiKeys(rawApiKeys);
  if (apiKeys.length === 0) {
    return getMockRecommendation(userData);
  }

  try {
    const text = await callGemini(
      buildRecommendPrompt(userData),
      apiKeys,
      true,
      model || DEFAULT_GEMINI_MODEL,
      2048,
    );
    const parsed = parseJson(text);
    if (!parsed) throw new Error('La IA no devolvió JSON válido.');

    const rol = matchRol(String(parsed.rol ?? ''));
    const nombre = userData.nombre.trim() || 'amigo';

    return {
      nombre,
      rolId: rol.id,
      rol: rol.nombre,
      tagline: rol.tagline,
      descripcion: str(parsed.descripcion, rol.descripcion),
      acciones: arr(parsed.acciones, rol.acciones),
      color: rol.color,
      perfil: str(parsed.perfil, `¡${nombre}, tu perfil conecta con ${rol.nombre}!`),
      imagen: rol.imagen,
      closing: str(
        parsed.cierre,
        `¡Listo, ${nombre}! Tu rol es ${rol.nombre}. El océano te necesita tal como eres.`,
      ),
    } satisfies RolSugerido;
  } catch (err) {
    console.warn('[rol] Gemini no disponible, usando motor local.', err);
    return getMockRecommendation(userData);
  }
}

export async function getRolReply(
  userData: RolUserData,
  message: string,
  rawApiKeys?: string,
  model?: string,
): Promise<string> {
  const nombre = userData.nombre.trim() || 'amigo';
  const fallback = `¡Gracias por compartirlo, ${nombre}! Me encanta tu energía. Dame un momento para descubrir tu rol.`;

  const apiKeys = splitGeminiKeys(rawApiKeys);
  if (apiKeys.length === 0) return fallback;

  try {
    const text = await callGemini(
      buildReplyPrompt(userData, message),
      apiKeys,
      false,
      model || DEFAULT_GEMINI_MODEL,
      2048,
      0.7,
    );
    const reply = cleanReply(text);
    return reply.trim() ? reply : fallback;
  } catch (err) {
    console.warn('[rol] Respuesta IA no disponible, usando respuesta genérica.', err);
    return fallback;
  }
}
