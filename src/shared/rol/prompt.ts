import { MASCOT_NAME, ROLES, rolPorId } from './roles';
import type { Rol } from './roles';
import type { RolUserData } from './types';

// ============================================================
// Descubre tu Rol · Prompts y saneado de respuestas de la IA.
// El JSON del usuario se adjunta completo como contexto y se le
// pide al modelo que responda con un JSON de forma exacta.
// ============================================================

const rolesContext = ROLES.map((r) => `- ${r.nombre}: ${r.tagline}. ${r.descripcion}`).join('\n');

export function buildRecommendPrompt(userData: RolUserData): string {
  return [
    `Actúa como ${MASCOT_NAME}, el zorro guardián y mentor de OceanEyes, una app ciudadana para reportar incidentes que dañan el mar (pesca ilegal, basura marina, derrames, fauna herida, etc.).`,
    `Una persona acaba de responder un quiz guiado en la landing.`,
    `Datos estructurados de la persona:`,
    JSON.stringify(userData, null, 2),
    ``,
    `Roles de OceanEyes disponibles:`,
    rolesContext,
    ``,
    `Elige UN solo rol y genera una recomendación personalizada en JSON con EXACTAMENTE esta forma (sin comentarios ni texto extra):`,
    `{ "rol": string, "descripcion": string, "acciones": string[], "perfil": string, "cierre": string }`,
    `Reglas:`,
    `- "rol" debe ser el nombre EXACTO de uno de los roles listados.`,
    `- "perfil" es un párrafo motivador (2-3 frases) que mencione el nombre de la persona y conecte sus respuestas con el rol elegido.`,
    `- "descripcion" explica por qué ese rol conecta con lo que contó la persona.`,
    `- "acciones" son 3 primeros pasos concretos relacionados con usar la app OceanEyes (reportar incidentes, ganar puntos, invitar a la comunidad).`,
    `- "cierre" es un mensaje corto (1-2 frases) de ${MASCOT_NAME} motivándola a descargar OceanEyes y empezar a proteger el mar.`,
  ].join('\n');
}

// Limpia posibles "autoverificaciones" que el modelo pueda escupir en la
// respuesta (label/asteriscos/numeración/checklist) dejando solo el mensaje.
export function cleanReply(text: string): string {
  const meta =
    /(\bChecked\b|\bRules?\b|\bChecklist\b|\bStep\b|\bVerificad|\bComprobad|\*+|-+\s*[0-9]|^\s*[0-9]+\.)|("instead of"|"No mention"|"per the rules"|"Do not"|"Must not"|"no mention")/i;
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !meta.test(l));
  let out = lines.join(' ').trim();
  if (out && !/[.!?…]$/.test(out)) {
    const lastPeriod = out.lastIndexOf('.');
    const lastExcl = out.lastIndexOf('!');
    const lastQuestion = out.lastIndexOf('?');
    const lastEnd = Math.max(lastPeriod, lastExcl, lastQuestion, -1);
    if (lastEnd > 10) {
      out = out.slice(0, lastEnd + 1).trim();
    } else {
      const words = out.split(/\s+/);
      if (words.length > 1) {
        words.pop();
        out = words.join(' ').trim();
      }
      if (out && out.length < 3) out = '';
    }
  }
  return out;
}

export function buildReplyPrompt(userData: RolUserData, message: string): string {
  const nombre = userData.nombre.trim() || 'amigo';
  return [
    `Eres ${MASCOT_NAME}, el zorro guardián y mentor de OceanEyes, conversando con ${nombre}.`,
    `Contexto de sus respuestas:`,
    JSON.stringify(userData, null, 2),
    ``,
    `La última respuesta de la persona fue: "${message}".`,
    `Tu respuesta es ÚNICAMENTE el mensaje que le dices ahora a ${nombre} en primera persona. Escribe 2-3 frases completas, cercanas, motivadoras y entusiastas, reaccionando a esa respuesta.`,
    `Reglas de formato:`,
    `1. Empieza directamente con la frase de ${MASCOT_NAME}.`,
    `2. Termina con un punto final.`,
    `3. Escribe solo el mensaje final de ${MASCOT_NAME}. Prohibido emitir razonamiento, notas, etiquetas, asteriscos, viñetas, listas numeradas, verificaciones, "Checked", "Rules", auto-evaluaciones o cualquier texto fuera del mensaje.`,
    `4. Sin emojis.`,
  ].join('\n');
}

export function parseJson(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function matchRol(name?: string): Rol {
  const norm = (name ?? '').toLowerCase().trim();
  if (norm) {
    const found = ROLES.find(
      (r) => r.nombre.toLowerCase() === norm || norm.includes(r.nombre.toLowerCase()),
    );
    if (found) return found;
  }
  return rolPorId('');
}
