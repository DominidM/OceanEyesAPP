// ============================================================
// Gateway de registro municipal.
// Corre desde nuestro propio dominio (Cloudflare Worker en
// producción, rutas +api de Expo en dev) para que el navegador
// del usuario jamás llame directo a *.googleapis.com (los
// bloqueadores/adblockers cortan esas peticiones).
//
// Auth: relee Identity Toolkit REST con la API key pública.
// Datos: escribe en Firestore REST con el idToken del usuario
// (Bearer), por lo que las reglas de seguridad se aplican.
// ============================================================

export interface GatewayEnv {
  FIREBASE_API_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
}

const IDENTITY_TOOLKIT = 'https://identitytoolkit.googleapis.com/v1';
const FIRESTORE_BASE = (projectId: string) =>
  `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_CODE_MAP: Record<string, string> = {
  EMAIL_EXISTS: 'auth/email-already-in-use',
  INVALID_EMAIL: 'auth/invalid-email',
  WEAK_PASSWORD: 'auth/weak-password',
  OPERATION_NOT_ALLOWED: 'auth/operation-not-allowed',
  INVALID_ARGUMENT: 'auth/invalid-argument',
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorMessage(data: unknown): string {
  const error = (data as { error?: { message?: string } })?.error;
  return error?.message ?? 'Error desconocido';
}

function serverError(code: string, message: string): Response {
  return json({ error: true, code, message }, 400);
}

async function postJson(url: string, body: unknown, headers?: Record<string, string>) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
    body: JSON.stringify(body),
  });
}

// ── POST /api/auth/signup ──
export async function handleAuthSignup(request: Request, env: GatewayEnv): Promise<Response> {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: true, code: 'auth/invalid-argument', message: 'Cuerpo inválido' }, 400);
  }

  const email = String(body.email ?? '').trim();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!EMAIL_REGEX.test(email)) {
    return serverError('auth/invalid-email', 'Ingresá un correo válido.');
  }
  if (password.length < 6) {
    return serverError('auth/weak-password', 'La contraseña debe tener al menos 6 caracteres.');
  }
  if (!env.FIREBASE_API_KEY) {
    return json({ error: true, code: 'server/misconfigured', message: 'Servicio no configurado' }, 500);
  }

  const res = await postJson(
    `${IDENTITY_TOOLKIT}/accounts:signUp?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`,
    { email, password, returnSecureToken: true },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = errorMessage(data);
    const code = ERROR_CODE_MAP[message] ?? message.toLowerCase();
    return json({ error: true, code, message }, res.status);
  }
  return json(data, 200);
}

// ── POST /api/auth/delete ──
export async function handleAuthDelete(request: Request, env: GatewayEnv): Promise<Response> {
  let body: { idToken?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: true, message: 'Cuerpo inválido' }, 400);
  }

  const idToken = String(body.idToken ?? '');
  if (!idToken || !env.FIREBASE_API_KEY) {
    return json({ error: true, message: 'Faltan datos' }, 400);
  }

  const res = await postJson(
    `${IDENTITY_TOOLKIT}/accounts:delete?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`,
    { idToken },
  );
  if (!res.ok) {
    return json({ error: true, message: 'No se pudo eliminar la cuenta' }, res.status);
  }
  return json({ success: true }, 200);
}

// ── POST /api/municipalities/apply ──
export async function handleMunicipalityApply(request: Request, env: GatewayEnv): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: true, message: 'Cuerpo inválido' }, 400);
  }

  const idToken = String(body.idToken ?? '');
  const ownerUid = String(body.ownerUid ?? '');
  const name = String(body.name ?? '').trim();
  const region = String(body.region ?? '').trim();
  const province = String(body.province ?? '').trim();
  const contactEmail = String(body.contactEmail ?? '').trim();

  if (!idToken || !ownerUid || !name || !region || !province || !contactEmail || !env.FIREBASE_PROJECT_ID) {
    return json({ error: true, message: 'Datos incompletos' }, 400);
  }

  const base = FIRESTORE_BASE(env.FIREBASE_PROJECT_ID);
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
  };
  const now = new Date().toISOString();

  // 1) Perfil del usuario (rol municipal). Las reglas de Firestore
  //    validan ownerUid == auth.uid y role municipal sobre este token.
  const userDoc = {
    fields: {
      role: { stringValue: 'municipal' },
      profileType: { stringValue: 'citizen' },
      displayName: { stringValue: name },
      email: { stringValue: contactEmail },
      dni: { nullValue: null },
      pointsBalance: { integerValue: '0' },
      totalPointsEarned: { integerValue: '0' },
      verifiedReportsCount: { integerValue: '0' },
      status: { stringValue: 'active' },
      createdAt: { timestampValue: now },
      updatedAt: { timestampValue: now },
    },
  };
  const userMask = Object.keys(userDoc.fields)
    .map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`)
    .join('&');

  const userRes = await fetch(`${base}/users/${ownerUid}?${userMask}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify(userDoc),
  });
  if (!userRes.ok) {
    const text = await userRes.text().catch(() => '');
    return json({ error: true, message: `No se pudo crear tu perfil (${userRes.status}).`, detail: text.slice(0, 200) }, 502);
  }

  // 2) Solicitud en la colección municipalities (estado pending).
  const municipalityFields: Record<string, { stringValue?: string; timestampValue?: string }> = {
    name: { stringValue: name },
    region: { stringValue: region },
    province: { stringValue: province },
    contactEmail: { stringValue: contactEmail },
    ownerUid: { stringValue: ownerUid },
    status: { stringValue: 'pending' },
    createdAt: { timestampValue: now },
    updatedAt: { timestampValue: now },
  };
  for (const [key, value] of [['address', body.address], ['contactName', body.contactName], ['phone', body.phone]] as const) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (text) municipalityFields[key] = { stringValue: text };
  }

  const municipalityRes = await fetch(`${base}/municipalities/${encodeURIComponent(ownerUid)}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ fields: municipalityFields }),
  });
  if (!municipalityRes.ok) {
    const text = await municipalityRes.text().catch(() => '');
    return json({ error: true, message: `No se pudo enviar tu solicitud (${municipalityRes.status}).`, detail: text.slice(0, 200) }, 502);
  }

  return json({ success: true }, 200);
}
