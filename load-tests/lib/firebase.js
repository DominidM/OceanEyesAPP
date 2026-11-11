/* global __ENV, __VU */
/* eslint-disable import/no-unresolved -- módulos k6 provistos por el runtime de k6 */
// Helpers k6 para hablar con los emuladores de Firebase (o con un proyecto de staging).
// NUNCA apuntar a producción (oceaneyes-5e7b4).
import http from 'k6/http';
import { check, fail } from 'k6';

export const PROJECT = __ENV.FIREBASE_PROJECT || 'demo-oceaneyes';
export const API_KEY = __ENV.FIREBASE_API_KEY || 'fake-api-key';
const FS_HOST = __ENV.FIRESTORE_HOST || 'http://127.0.0.1:8080';
const AUTH_HOST = __ENV.AUTH_HOST || 'http://127.0.0.1:9099/identitytoolkit.googleapis.com';
const ST_HOST = __ENV.STORAGE_HOST || 'http://127.0.0.1:9199';
export const BUCKET = __ENV.STORAGE_BUCKET || `${PROJECT}.appspot.com`;

if (PROJECT === 'oceaneyes-5e7b4') {
  fail('Bloqueado: no se ejecutan pruebas de carga contra producción.');
}

export const DOCS = `${FS_HOST}/v1/projects/${PROJECT}/databases/(default)/documents`;

// Seeding sin reglas: el emulador acepta "Bearer owner".
export const OWNER = { headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' } };

export function bearer(token) {
  return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
}

export function enc(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(enc) } };
  if (typeof value === 'object') return { mapValue: { fields: fields(value) } };
  return { stringValue: String(value) };
}

export function fields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[k] = enc(v);
  return out;
}

export function signUp(email, password) {
  const res = http.post(
    `${AUTH_HOST}/v1/accounts:signUp?key=${API_KEY}`,
    JSON.stringify({ email, password, returnSecureToken: true }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(res, { 'signUp 200': (r) => r.status === 200 });
  const body = res.json();
  return { uid: body.localId, token: body.idToken };
}

export function seedUser(uid, role, extra = {}) {
  const profile = {
    role,
    profileType: 'citizen',
    pointsBalance: 0,
    totalPointsEarned: 0,
    verifiedReportsCount: 0,
    status: 'active',
    walletAddress: '0x1111111111111111111111111111111111111111',
    createdAt: new Date(),
    ...extra,
  };
  http.patch(`${DOCS}/users/${uid}`, JSON.stringify({ fields: fields(profile) }), OWNER);
}

export function reportFields(uid, title = 'Pesca ilegal (k6)') {
  return fields({
    userId: uid,
    category: 'pesca_ilegal',
    title,
    description: null,
    isAnonymous: true,
    location: { latitude: -12.05 + Math.random() / 10, longitude: -77.15 + Math.random() / 10 },
    photoURLs: [],
    status: 'pendiente',
    pointsAwarded: 0,
    createdAt: new Date(),
    submittedAt: new Date(),
  });
}

export function myReportsQuery(uid) {
  return JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: 'reports' }],
      where: { fieldFilter: { field: { fieldPath: 'userId' }, op: 'EQUAL', value: { stringValue: uid } } },
    },
  });
}

export function uploadUrl(path) {
  return `${ST_HOST}/v0/b/${BUCKET}/o?name=${encodeURIComponent(path)}&uploadType=media`;
}
