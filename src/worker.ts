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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/contact') {
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
