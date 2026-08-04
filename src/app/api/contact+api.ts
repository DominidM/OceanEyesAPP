export async function POST(request: Request) {
  let body: { name?: string; email?: string; phone?: string; message?: string };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, phone, message } = body;

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

  const brevoBody = {
    sender: { email: senderEmail, name: 'Ocean Eyes' },
    to: [{ email: senderEmail, name: 'Ocean Eyes' }],
    subject: `Contacto OceanEyes - ${name}`,
    htmlContent: `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ''}
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
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
      const errorData = await res.json();
      console.error('Brevo API error:', errorData);
      return new Response(JSON.stringify({ error: 'Error al enviar el mensaje' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
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
