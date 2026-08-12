import {
  handleAuthDelete,
  handleAuthSignup,
  handleMunicipalityApply,
} from './shared/gateway/municipal-signup';
import { getRolRecommendation, getRolReply } from './shared/rol/service';
import {
  buildContactConfirmationHtml,
  buildContactDataHtml,
  buildRolEmailHtml,
} from './shared/rol/email-template';
import type { RolSugerido, RolUserData } from './shared/rol/types';

interface ContactBody {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  BREVO_API_KEY?: string;
  BREVO_SENDER_EMAIL?: string;
  API_KEY_GEMINI?: string;
  GEMINI_MODEL?: string;
  FIREBASE_API_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function sendBrevoEmail(apiKey: string, brevoBody: unknown): Promise<Response> {
  return fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(brevoBody),
  });
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const MAX_TOKENS_PER_REQUEST = 100;

interface SendPushBody {
  tokens?: string[];
  title?: string;
  message?: string;
  severity?: string;
  data?: Record<string, unknown>;
}

async function handleSendPush(request: Request): Promise<Response> {
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

async function handleContact(request: Request, env: Env): Promise<Response> {
  let body: ContactBody;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400);
  }

  const { name, email, phone, subject, message } = body;

  if (!name || !email || !message) {
    return json({ error: 'Todos los campos son requeridos' }, 400);
  }

  const apiKey = env.BREVO_API_KEY;
  const senderEmail = env.BREVO_SENDER_EMAIL;

  if (!apiKey) {
    return json({ error: 'Servicio no configurado' }, 500);
  }

  if (!senderEmail) {
    return json({ error: 'Email remitente no configurado' }, 500);
  }

  const confirmationBody = {
    sender: { email: senderEmail, name: 'Ocean Eyes' },
    to: [{ email, name }],
    subject: 'Recibimos tu mensaje · Ocean Eyes',
    htmlContent: buildContactConfirmationHtml({ nombre: name, email, message }),
  };

  const dataBody = {
    sender: { email: senderEmail, name: 'Ocean Eyes' },
    to: [{ email: senderEmail, name: 'Ocean Eyes' }],
    replyTo: { email, name },
    subject: `Contacto OceanEyes - ${name}`,
    htmlContent: buildContactDataHtml({ nombre: name, email, phone, subject, message }),
  };

  try {
    const confirmationRes = await sendBrevoEmail(apiKey, confirmationBody);
    const dataRes = await sendBrevoEmail(apiKey, dataBody);

    if (!dataRes.ok) {
      const text = await dataRes.text().catch(() => '');
      console.error('[api/contact] Brevo data error:', text.slice(0, 300));
      return json({ error: 'Error al enviar el mensaje' }, 502);
    }

    if (!confirmationRes.ok) {
      console.error('[api/contact] No se pudo enviar la confirmación al usuario.');
    }

    return json({ success: true }, 200);
  } catch {
    return json({ error: 'Error de conexión' }, 502);
  }
}

interface RolBody {
  mode?: string;
  userData?: RolUserData;
  message?: string;
}

async function handleRol(request: Request, env: Env): Promise<Response> {
  let body: RolBody;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400);
  }

  const userData = body.userData;
  if (!userData) {
    return json({ error: 'Falta userData.' }, 400);
  }

  try {
    if (body.mode === 'reply') {
      const reply = await getRolReply(
        userData,
        body.message ?? '',
        env.API_KEY_GEMINI,
        env.GEMINI_MODEL,
      );
      return json({ reply }, 200);
    }

    const result = await getRolRecommendation(userData, env.API_KEY_GEMINI, env.GEMINI_MODEL);
    return json({ result }, 200);
  } catch (err) {
    console.error('[api/rol] error:', err);
    return json({ error: 'Error al procesar la solicitud' }, 500);
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RolEmailBody {
  email?: string;
  result?: RolSugerido;
}

async function handleRolEmail(request: Request, env: Env): Promise<Response> {
  let body: RolEmailBody;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400);
  }

  const { email, result } = body;

  if (!email || !EMAIL_REGEX.test(email) || !result) {
    return json({ error: 'Correo o resultado inválido' }, 400);
  }

  const apiKey = env.BREVO_API_KEY;
  const senderEmail = env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    return json({ error: 'Servicio no configurado' }, 500);
  }

  const brevoBody = {
    sender: { email: senderEmail, name: 'Ocean Eyes' },
    to: [{ email, name: result.nombre || undefined }],
    subject: `Tu rol en OceanEyes: ${result.rol}`,
    htmlContent: buildRolEmailHtml(result),
  };

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(brevoBody),
    });

    if (!res.ok) {
      return json({ error: 'Error al enviar el mensaje' }, 502);
    }

    return json({ success: true, message: `¡Listo! Te enviamos tu rol a ${email}.` }, 200);
  } catch {
    return json({ error: 'Error de conexión' }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/contact') {
      return handleContact(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/rol') {
      return handleRol(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/email-rol') {
      return handleRolEmail(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/send-push') {
      return handleSendPush(request);
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/signup') {
      return handleAuthSignup(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/delete') {
      return handleAuthDelete(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/municipalities/apply') {
      return handleMunicipalityApply(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
