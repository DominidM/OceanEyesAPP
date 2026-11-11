// Verificación de Firebase ID tokens sin firebase-admin (Cloudflare Workers / rutas +api).
// Sigue https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
// RS256 firmado con las claves públicas de securetoken@system.gserviceaccount.com.

const GOOGLE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

export type FirebaseJwk = JsonWebKey & { kid: string };
export type FetchKeys = () => Promise<FirebaseJwk[]>;

export class TokenVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenVerificationError';
  }
}

let cachedKeys: { keys: FirebaseJwk[]; expiresAt: number } | null = null;

export const fetchGoogleKeys: FetchKeys = async () => {
  if (cachedKeys && cachedKeys.expiresAt > Date.now()) return cachedKeys.keys;
  const response = await fetch(GOOGLE_JWKS_URL);
  if (!response.ok) throw new TokenVerificationError('No se pudieron obtener las claves públicas de Google.');
  const body = (await response.json()) as { keys?: FirebaseJwk[] };
  const maxAge = Number(/max-age=(\d+)/.exec(response.headers.get('cache-control') ?? '')?.[1] ?? 3600);
  cachedKeys = { keys: body.keys ?? [], expiresAt: Date.now() + maxAge * 1000 };
  return cachedKeys.keys;
};

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function decodeJson<T>(segment: string): T {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment))) as T;
  } catch {
    throw new TokenVerificationError('Token mal formado.');
  }
}

export type VerifiedToken = { uid: string; claims: Record<string, unknown> };

export async function verifyFirebaseIdToken(
  token: string,
  projectId: string,
  options: { fetchKeys?: FetchKeys; nowSeconds?: number } = {},
): Promise<VerifiedToken> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new TokenVerificationError('Token mal formado.');
  const [headerSegment, payloadSegment, signatureSegment] = parts;

  const header = decodeJson<{ alg?: string; kid?: string }>(headerSegment);
  const payload = decodeJson<Record<string, unknown>>(payloadSegment);
  if (header.alg !== 'RS256' || !header.kid) throw new TokenVerificationError('Algoritmo o kid inválido.');

  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const exp = Number(payload.exp);
  const iat = Number(payload.iat);
  const authTime = Number(payload.auth_time);
  if (payload.aud !== projectId) throw new TokenVerificationError('Audiencia inválida.');
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new TokenVerificationError('Emisor inválido.');
  if (!Number.isFinite(exp) || exp <= now) throw new TokenVerificationError('Token expirado.');
  if (!Number.isFinite(iat) || iat > now + 300) throw new TokenVerificationError('Token emitido en el futuro.');
  if (!Number.isFinite(authTime) || authTime > now + 300) throw new TokenVerificationError('auth_time inválido.');
  if (typeof payload.sub !== 'string' || payload.sub.length === 0) throw new TokenVerificationError('Token sin sujeto.');

  const keys = await (options.fetchKeys ?? fetchGoogleKeys)();
  const jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) throw new TokenVerificationError('Clave de firma desconocida.');

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    base64UrlToBytes(signatureSegment),
    new TextEncoder().encode(`${headerSegment}.${payloadSegment}`),
  );
  if (!valid) throw new TokenVerificationError('Firma inválida.');

  return { uid: payload.sub, claims: payload };
}
