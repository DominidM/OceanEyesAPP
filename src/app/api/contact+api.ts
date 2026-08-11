import {
  buildContactConfirmationHtml,
  buildContactDataHtml,
} from '@shared/rol/email-template';

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

export async function POST(request: Request) {
  let body: { name?: string; email?: string; phone?: string; subject?: string; message?: string };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, phone, subject, message } = body;

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Servicio no configurado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!senderEmail) {
    return new Response(JSON.stringify({ error: 'Email remitente no configurado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
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
      const errorData = await dataRes.json().catch(() => ({}));
      console.error('Brevo API error:', errorData);
      return new Response(JSON.stringify({ error: 'Error al enviar el mensaje' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!confirmationRes.ok) {
      console.error('[api/contact] No se pudo enviar la confirmación al usuario.');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Brevo request failed:', err);
    return new Response(JSON.stringify({ error: 'Error de conexión' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
