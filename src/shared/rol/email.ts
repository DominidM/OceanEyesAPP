import type { RolSugerido } from './types';

// ============================================================
// Descubre tu Rol · Envío del resultado al correo del usuario.
// Llama a POST /api/email-rol (API local en dev, Worker en
// producción), que envía con Brevo. La API key vive en el
// servidor, nunca en el navegador.
// ============================================================

export interface RolEmailStatus {
  success: boolean;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendRolEmail(
  email: string,
  result: RolSugerido,
): Promise<RolEmailStatus> {
  if (!email || !EMAIL_REGEX.test(email)) {
    return { success: false, message: 'Ingresa un correo válido.' };
  }

  try {
    const res = await fetch('/api/email-rol', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, result }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
      error?: string;
    };

    if (!res.ok) {
      return {
        success: false,
        message: data.error || `No se pudo enviar el correo (${res.status}).`,
      };
    }

    return {
      success: true,
      message: data.message || `¡Listo! Te enviamos tu rol a ${email}.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[rol] Error al enviar el correo:', err);
    return { success: false, message: `No se pudo enviar el correo: ${msg}` };
  }
}
