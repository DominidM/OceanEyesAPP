import { buildRolEmailHtml } from '@shared/rol/email-template';
import type { RolSugerido } from '@shared/rol/types';

// ============================================================
// POST /api/email-rol (dev local) · Envía el resultado del quiz
// al correo del usuario con Brevo. En producción el Worker
// (src/worker.ts) maneja esta misma ruta.
// ============================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  let body: { email?: string; result?: RolSugerido };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400);
  }

  const { email, result } = body;

  if (!email || !EMAIL_REGEX.test(email) || !result) {
    return json({ error: 'Correo o resultado inválido' }, 400);
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

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
      const errorData = await res.json().catch(() => ({}));
      console.error('Brevo API error:', errorData);
      return json({ error: 'Error al enviar el mensaje' }, 502);
    }

    return json({ success: true, message: `¡Listo! Te enviamos tu rol a ${email}.` }, 200);
  } catch (err) {
    console.error('Brevo request failed:', err);
    return json({ error: 'Error de conexión' }, 502);
  }
}
