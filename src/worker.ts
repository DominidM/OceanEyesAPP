import { getRolRecommendation, getRolReply } from './shared/rol/service';
import { buildRolEmailHtml } from './shared/rol/email-template';
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
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
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

  const brevoBody = {
    sender: { email: senderEmail, name: 'Ocean Eyes' },
    to: [{ email: senderEmail, name: 'Ocean Eyes' }],
    replyTo: { email, name },
    subject: `Contacto OceanEyes - ${name}`,
    htmlContent: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${subject ? `<p><strong>Asunto:</strong> ${escapeHtml(subject)}</p>` : ''}
      ${phone ? `<p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>` : ''}
      <p><strong>Mensaje:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `,
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

    return env.ASSETS.fetch(request);
  },
};
