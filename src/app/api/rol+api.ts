import { getRolRecommendation, getRolReply } from '@shared/rol/service';
import type { RolUserData } from '@shared/rol/types';

// ============================================================
// POST /api/rol (dev local) · Recomendación de rol y respuestas
// conversadas. En producción el Worker (src/worker.ts) maneja
// esta misma ruta. La API key de Gemini vive en el servidor.
// ============================================================

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  let body: { mode?: string; userData?: RolUserData; message?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400);
  }

  const userData = body.userData;
  if (!userData) {
    return json({ error: 'Falta userData.' }, 400);
  }

  const apiKeys = process.env.API_KEY_GEMINI;
  const model = process.env.GEMINI_MODEL;

  try {
    if (body.mode === 'reply') {
      const reply = await getRolReply(userData, body.message ?? '', apiKeys, model);
      return json({ reply }, 200);
    }

    const result = await getRolRecommendation(userData, apiKeys, model);
    return json({ result }, 200);
  } catch (err) {
    console.error('[api/rol] error:', err);
    return json({ error: 'Error al procesar la solicitud' }, 500);
  }
}
