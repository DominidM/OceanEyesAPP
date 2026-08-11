import type { RolSugerido } from './types';

export interface ContactData {
  nombre: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

// ============================================================
// Descubre tu Rol · Plantilla HTML del correo con el resultado.
// Logo arriba, contenido del rol y, abajo de todo, la imagen
// del zorro. La usan la API local (+api) y el Worker.
// ============================================================

const LOGO_URL =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786169052/logotipo_q2mkhv.png';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildRolEmailHtml(result: RolSugerido): string {
  const nombre = escapeHtml(result.nombre);
  const rol = escapeHtml(result.rol);
  const tagline = escapeHtml(result.tagline);
  const descripcion = escapeHtml(result.descripcion);
  const perfil = escapeHtml(result.perfil);
  const closing = escapeHtml(result.closing ?? '');
  const color = escapeHtml(result.color);
  const acciones = result.acciones
    .map((accion) => `<li style="margin:6px 0;">${escapeHtml(accion)}</li>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#EFEBE3;">
  <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#2C2C2C;">
    <div style="background:#ffffff;padding:20px 24px;text-align:center;border-bottom:3px solid #134E5E;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:700;font-style:italic;color:#134E5E;letter-spacing:-0.5px;line-height:1.2;">Ocean Eyes</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;color:#98B9B1;text-transform:uppercase;margin-top:4px;">Protege lo que amas</div>
      <img src="${LOGO_URL}" alt="Ocean Eyes" style="width:64px;height:64px;display:block;margin:10px auto 0;" />
    </div>
    <div style="background:#ffffff;padding:32px 28px;">
      <p style="font-size:12px;letter-spacing:2px;color:#98B9B1;margin:0 0 8px;">DESCUBRE TU ROL</p>
      <h1 style="font-size:26px;margin:0 0 4px;color:#2C2C2C;">¡Hola, ${nombre}!</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">${perfil}</p>
      <div style="border-left:4px solid ${color};padding:12px 16px;background:#FAF7F0;margin:0 0 20px;">
        <p style="font-size:12px;letter-spacing:1.5px;color:#98B9B1;margin:0 0 4px;">TU ROL ES</p>
        <p style="font-size:24px;font-weight:bold;margin:0 0 4px;color:${color};">${rol}</p>
        <p style="font-size:14px;font-style:italic;margin:0;color:#2C2C2C;">"${tagline}"</p>
      </div>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">${descripcion}</p>
      <h2 style="font-size:16px;margin:0 0 8px;color:#134E5E;">Tus primeros pasos</h2>
      <ol style="font-size:14px;line-height:1.6;padding-left:20px;margin:0 0 20px;">${acciones}</ol>
      ${closing ? `<p style="font-size:14px;line-height:1.6;font-style:italic;color:#134E5E;margin:0;">${closing}</p>` : ''}
    </div>
    <div style="background:#134E5E;padding:24px;text-align:center;">
      <img src="${escapeHtml(result.imagen)}" alt="${rol}" style="height:180px;width:auto;" />
      <p style="font-size:12px;color:#98B9B1;margin:12px 0 0;">Ocean Eyes · Protege lo que amas</p>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================
// Contacto · Confirmación para quien escribe y aviso con los
// datos para el equipo. Mismo diseño que el correo del rol.
// ============================================================

export function buildContactConfirmationHtml(data: ContactData): string {
  const nombre = escapeHtml(data.nombre);
  const email = escapeHtml(data.email);
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#EFEBE3;">
  <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#2C2C2C;">
    <div style="background:#ffffff;padding:20px 24px;text-align:center;border-bottom:3px solid #134E5E;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:700;font-style:italic;color:#134E5E;letter-spacing:-0.5px;line-height:1.2;">Ocean Eyes</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;color:#98B9B1;text-transform:uppercase;margin-top:4px;">Protege lo que amas</div>
      <img src="${LOGO_URL}" alt="Ocean Eyes" style="width:64px;height:64px;display:block;margin:10px auto 0;" />
    </div>
    <div style="background:#ffffff;padding:32px 28px;">
      <p style="font-size:12px;letter-spacing:2px;color:#98B9B1;margin:0 0 8px;">MENSAJE RECIBIDO</p>
      <h1 style="font-size:26px;margin:0 0 4px;color:#2C2C2C;">¡Hola, ${nombre}!</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Tu mensaje fue enviado exitosamente. Gracias por escribirnos.</p>
      <div style="border-left:4px solid #134E5E;padding:12px 16px;background:#FAF7F0;margin:0 0 20px;">
        <p style="font-size:13px;line-height:1.6;margin:0;color:#2C2C2C;">
          Hemos recibido tu mensaje y el equipo de Ocean Eyes lo revisará. Espera un tiempo: te responderemos a la brevedad.
        </p>
      </div>
      <p style="font-size:14px;line-height:1.6;margin:0;color:#134E5E;">
        Responderemos al correo <strong>${email}</strong> que dejaste en el formulario.
      </p>
    </div>
    <div style="background:#134E5E;padding:24px;text-align:center;">
      <p style="font-size:12px;color:#98B9B1;margin:0;">Ocean Eyes · Protege lo que amas</p>
    </div>
  </div>
</body>
</html>`;
}

export function buildContactDataHtml(data: ContactData): string {
  const nombre = escapeHtml(data.nombre);
  const email = escapeHtml(data.email);
  const phone = data.phone
    ? `<p style="font-size:14px;line-height:1.6;margin:0 0 8px;"><strong>Teléfono:</strong> ${escapeHtml(data.phone)}</p>`
    : '';
  const subject = data.subject
    ? `<p style="font-size:14px;line-height:1.6;margin:0 0 8px;"><strong>Asunto:</strong> ${escapeHtml(data.subject)}</p>`
    : '';
  const message = escapeHtml(data.message).replace(/\n/g, '<br>');
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#EFEBE3;">
  <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#2C2C2C;">
    <div style="background:#ffffff;padding:20px 24px;text-align:center;border-bottom:3px solid #134E5E;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:700;font-style:italic;color:#134E5E;letter-spacing:-0.5px;line-height:1.2;">Ocean Eyes</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;color:#98B9B1;text-transform:uppercase;margin-top:4px;">Protege lo que amas</div>
      <img src="${LOGO_URL}" alt="Ocean Eyes" style="width:64px;height:64px;display:block;margin:10px auto 0;" />
    </div>
    <div style="background:#ffffff;padding:32px 28px;">
      <p style="font-size:12px;letter-spacing:2px;color:#98B9B1;margin:0 0 8px;">NUEVO MENSAJE DE CONTACTO</p>
      <h1 style="font-size:24px;margin:0 0 16px;color:#2C2C2C;">Nuevo mensaje de contacto</h1>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;"><strong>Nombre:</strong> ${nombre}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
      ${phone}
      ${subject}
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;"><strong>Mensaje:</strong></p>
      <p style="font-size:14px;line-height:1.6;margin:0;">${message}</p>
    </div>
    <div style="background:#134E5E;padding:24px;text-align:center;">
      <p style="font-size:12px;color:#98B9B1;margin:0;">Ocean Eyes · Protege lo que amas</p>
    </div>
  </div>
</body>
</html>`;
}
