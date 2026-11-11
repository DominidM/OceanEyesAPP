/**
 * SEC-06 /api/send-push exige idToken de admin/municipal y limita solicitudes por IP.
 * Unidades bajo prueba: src/shared/gateway/firebase-token.ts, src/shared/gateway/send-push.ts
 * El token se firma con una clave RSA generada en la prueba (sin red ni proyecto real).
 */
import { afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';

import { verifyFirebaseIdToken, type FirebaseJwk } from '@shared/gateway/firebase-token';
import { createRateLimiter, handleSendPush } from '@shared/gateway/send-push';

const PROJECT = 'demo-oceaneyes';
const NOW = 1_800_000_000;
const KID = 'test-kid';

let privateKey: CryptoKey;
let publicJwk: FirebaseJwk;
const fetchKeys = async () => [publicJwk];

const b64url = (data: Uint8Array | string) =>
  Buffer.from(typeof data === 'string' ? Buffer.from(data) : data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

async function signToken(overrides: Record<string, unknown> = {}, key: CryptoKey = privateKey): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'RS256', kid: KID, typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({
      iss: `https://securetoken.google.com/${PROJECT}`,
      aud: PROJECT,
      sub: 'admin-uid',
      iat: NOW - 60,
      auth_time: NOW - 60,
      exp: NOW + 3600,
      ...overrides,
    }),
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${payload}`));
  return `${header}.${payload}.${b64url(new Uint8Array(signature))}`;
}

async function newKeyPair() {
  return crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
}

beforeAll(async () => {
  const pair = await newKeyPair();
  privateKey = pair.privateKey;
  publicJwk = { ...(await crypto.subtle.exportKey('jwk', pair.publicKey)), kid: KID };
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('verifyFirebaseIdToken', () => {
  it('acepta un token válido y devuelve el uid', async () => {
    const result = await verifyFirebaseIdToken(await signToken(), PROJECT, { fetchKeys, nowSeconds: NOW });
    expect(result.uid).toBe('admin-uid');
  });

  it.each([
    ['audiencia de otro proyecto', { aud: 'oceaneyes-5e7b4' }],
    ['emisor incorrecto', { iss: 'https://evil.example' }],
    ['token expirado', { exp: NOW - 1 }],
    ['sin sujeto', { sub: '' }],
  ])('rechaza %s', async (_label, overrides) => {
    await expect(verifyFirebaseIdToken(await signToken(overrides), PROJECT, { fetchKeys, nowSeconds: NOW })).rejects.toThrow();
  });

  it('rechaza una firma hecha con otra clave', async () => {
    const other = await newKeyPair();
    await expect(
      verifyFirebaseIdToken(await signToken({}, other.privateKey), PROJECT, { fetchKeys, nowSeconds: NOW }),
    ).rejects.toThrow(/Firma inválida/);
  });
});

describe('createRateLimiter', () => {
  it('bloquea la solicitud N+1 dentro de la ventana y se reinicia al expirar', () => {
    let now = 0;
    const limiter = createRateLimiter(3, 60_000, () => now);
    expect([1, 2, 3].map(() => limiter.check('1.1.1.1').allowed)).toEqual([true, true, true]);
    expect(limiter.check('1.1.1.1')).toEqual({ allowed: false, retryAfterSeconds: 60 });
    expect(limiter.check('2.2.2.2').allowed).toBe(true);
    now = 60_000;
    expect(limiter.check('1.1.1.1').allowed).toBe(true);
  });
});

describe('handleSendPush', () => {
  const env = { FIREBASE_PROJECT_ID: PROJECT };
  const body = JSON.stringify({ tokens: ['ExponentPushToken[abc]'], title: 'Oleaje', message: 'Prueba', severity: 'info' });

  function request(token?: string, ip = '10.0.0.1') {
    return new Request('https://x/api/send-push', {
      method: 'POST',
      headers: { 'CF-Connecting-IP': ip, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body,
    });
  }

  function mockNetwork(role: string) {
    return jest.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('firestore.googleapis.com')) {
        return new Response(JSON.stringify({ fields: { role: { stringValue: role } } }), { status: 200 });
      }
      if (url.includes('exp.host')) {
        return new Response(JSON.stringify({ data: [{ status: 'ok' }] }), { status: 200 });
      }
      throw new Error(`fetch inesperado: ${url}`);
    });
  }

  const deps = () => ({ limiter: createRateLimiter(100, 60_000), fetchKeys, nowSeconds: NOW });

  it('401 sin token', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    const res = await handleSendPush(request(), env, deps());
    expect(res.status).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('401 con token inválido', async () => {
    const res = await handleSendPush(request('a.b.c'), env, deps());
    expect(res.status).toBe(401);
  });

  it('403 para un ciudadano (rol user)', async () => {
    const fetchSpy = mockNetwork('user');
    const res = await handleSendPush(request(await signToken()), env, deps());
    expect(res.status).toBe(403);
    expect(fetchSpy.mock.calls.some(([url]) => String(url).includes('exp.host'))).toBe(false);
  });

  it.each(['admin', 'municipal'])('200 y envío a Expo para rol %s', async (role) => {
    mockNetwork(role);
    const res = await handleSendPush(request(await signToken()), env, deps());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, sent: 1, skipped: 0 });
  });

  it('429 al superar el límite por IP, antes de verificar el token', async () => {
    const limiter = createRateLimiter(2, 60_000);
    const statuses: number[] = [];
    for (let i = 0; i < 3; i += 1) {
      statuses.push((await handleSendPush(request(undefined, '9.9.9.9'), env, { ...deps(), limiter })).status);
    }
    expect(statuses).toEqual([401, 401, 429]);
  });
});
