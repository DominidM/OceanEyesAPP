// POST /api/send-push — envía alertas oficiales por Expo Push.
// Requiere un Firebase ID token de un usuario con rol admin o municipal y aplica un límite
// simple de solicitudes por IP. Lo usan src/worker.ts (producción) y src/app/api/send-push+api.ts (dev).

import { TokenVerificationError, verifyFirebaseIdToken, type FetchKeys } from './firebase-token';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const MAX_TOKENS_PER_REQUEST = 100;
const ALLOWED_ROLES = ['admin', 'municipal'];

export const PUSH_RATE_LIMIT = { limit: 10, windowMs: 60_000 };

export interface SendPushEnv {
  FIREBASE_PROJECT_ID?: string;
}

interface SendPushBody {
  tokens?: string[];
  title?: string;
  message?: string;
  severity?: string;
  data?: Record<string, unknown>;
}

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

/** Ventana fija en memoria por IP. Es por instancia del Worker: frena ráfagas, no es un límite global. */
export function createRateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, { count: number; windowStart: number }>();
  return {
    check(key: string): { allowed: boolean; retryAfterSeconds: number } {
      const current = now();
      const entry = hits.get(key);
      if (!entry || current - entry.windowStart >= windowMs) {
        hits.set(key, { count: 1, windowStart: current });
        return { allowed: true, retryAfterSeconds: 0 };
      }
      entry.count += 1;
      const retryAfterSeconds = Math.ceil((entry.windowStart + windowMs - current) / 1000);
      return { allowed: entry.count <= limit, retryAfterSeconds };
    },
  };
}

const defaultLimiter = createRateLimiter(PUSH_RATE_LIMIT.limit, PUSH_RATE_LIMIT.windowMs);

/** Lee users/{uid}.role con el propio idToken: las reglas de Firestore permiten al dueño leer su perfil. */
async function fetchUserRole(projectId: string, uid: string, idToken: string): Promise<string | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${encodeURIComponent(uid)}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
  if (!response.ok) return null;
  const body = (await response.json()) as { fields?: { role?: { stringValue?: string } } };
  return body.fields?.role?.stringValue ?? null;
}

export type SendPushDeps = {
  limiter?: ReturnType<typeof createRateLimiter>;
  fetchKeys?: FetchKeys;
  nowSeconds?: number;
};

export async function handleSendPush(request: Request, env: SendPushEnv, deps: SendPushDeps = {}): Promise<Response> {
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'unknown';
  const rate = (deps.limiter ?? defaultLimiter).check(ip);
  if (!rate.allowed) {
    return json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, 429, { 'Retry-After': String(rate.retryAfterSeconds) });
  }

  const projectId = env.FIREBASE_PROJECT_ID;
  if (!projectId) return json({ error: 'Servicio no configurado' }, 500);

  const idToken = /^Bearer\s+(.+)$/i.exec(request.headers.get('Authorization') ?? '')?.[1];
  if (!idToken) return json({ error: 'Falta el token de autenticación.' }, 401);

  let uid: string;
  try {
    ({ uid } = await verifyFirebaseIdToken(idToken, projectId, { fetchKeys: deps.fetchKeys, nowSeconds: deps.nowSeconds }));
  } catch (error) {
    if (error instanceof TokenVerificationError) return json({ error: 'Token inválido.' }, 401);
    throw error;
  }

  const role = await fetchUserRole(projectId, uid, idToken);
  if (!role || !ALLOWED_ROLES.includes(role)) {
    return json({ error: 'Solo administradores o municipalidades pueden enviar alertas.' }, 403);
  }

  let body: SendPushBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400);
  }

  const { tokens, title, message } = body;
  const safeTokens = (tokens ?? [])
    .map((t) => String(t ?? '').trim())
    .filter((t) => /^Expo(nent)?PushToken\[.+\]$/.test(t));
  const safeTitle = String(title ?? 'OceanEyes').trim();
  const safeMessage = String(message ?? '').trim();
  const isDanger = body.severity === 'danger';

  if (safeTokens.length === 0) {
    return json({ success: true, sent: 0, skipped: 0 }, 200);
  }

  const chunks: string[][] = [];
  for (let i = 0; i < safeTokens.length; i += MAX_TOKENS_PER_REQUEST) {
    chunks.push(safeTokens.slice(i, i + MAX_TOKENS_PER_REQUEST));
  }

  let sent = 0;
  try {
    for (const chunk of chunks) {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(
          chunk.map((to) => ({
            to,
            title: isDanger ? `⚠ ALERTA DE PELIGRO: ${safeTitle}` : safeTitle,
            body: safeMessage,
            sound: isDanger ? 'alarma_peligro.wav' : 'default',
            priority: isDanger ? 'high' : 'default',
            ttl: isDanger ? 300 : 3600,
            channelId: isDanger ? 'official-alerts' : 'oceaneyes',
            interruptionLevel: isDanger ? 'time-sensitive' : 'active',
            data: { kind: 'official-alert', severity: body.severity ?? 'info', ...(body.data ?? {}) } as Record<string, unknown>,
          })),
        ),
      });

      if (!res.ok) {
        console.error('Expo Push error:', res.status, await res.text());
        continue;
      }

      const result = (await res.json()) as { data?: { status?: string }[] };
      sent += (result.data ?? []).filter((d) => d.status === 'ok').length;
    }

    return json({ success: true, sent, skipped: safeTokens.length - sent }, 200);
  } catch (err) {
    console.error('Expo Push request failed:', err);
    return json({ error: 'Error de conexión con el servicio de push' }, 502);
  }
}
