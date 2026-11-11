/* global __ENV, __VU */
/* eslint-disable import/no-unresolved -- módulos k6 provistos por el runtime de k6 */
// PE-02 Registro de reporte con foto de 3 MB, 50 VU.
// Replica publishReportOnline(): addDoc(reports) + subida de medio + updateDoc(photoURLs).
// En el emulador la foto va a Storage (fallback de src/mobile/shared/offline/cloudinary.ts cuando
// Cloudinary no está configurado). NO cargar el Cloudinary real con esta prueba.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { DOCS, bearer, fields, reportFields, seedUser, signUp, uploadUrl } from './lib/firebase.js';

const PHOTO = new Uint8Array(3 * 1024 * 1024).buffer;

export const options = {
  scenarios: {
    registro: { executor: 'constant-vus', vus: 50, duration: '2m' },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    'http_req_duration{name:crear_reporte}': ['p(95)<1500'],
    'http_req_duration{name:subir_foto}': ['p(95)<5000'],
  },
};

export function setup() {
  const users = [];
  for (let i = 0; i < 50; i += 1) {
    const u = signUp(`pe02-${Date.now()}-${i}@k6.test`, 'Segura123!');
    seedUser(u.uid, 'user');
    users.push(u);
  }
  return { users };
}

export default function (data) {
  const u = data.users[(__VU - 1) % data.users.length];
  const created = http.post(`${DOCS}/reports`, JSON.stringify({ fields: reportFields(u.uid) }), {
    ...bearer(u.token),
    tags: { name: 'crear_reporte' },
  });
  if (!check(created, { 'reporte creado': (r) => r.status === 200 })) return;
  const reportId = created.json('name').split('/').pop();

  const up = http.post(uploadUrl(`reports/${reportId}/${reportId}-0.jpg`), PHOTO, {
    headers: { Authorization: `Bearer ${u.token}`, 'Content-Type': 'image/jpeg' },
    tags: { name: 'subir_foto' },
  });
  check(up, { 'foto subida': (r) => r.status === 200 });

  const patch = http.patch(
    `${DOCS}/reports/${reportId}?updateMask.fieldPaths=photoURLs`,
    JSON.stringify({ fields: fields({ photoURLs: [`reports/${reportId}/${reportId}-0.jpg`] }) }),
    { ...bearer(u.token), tags: { name: 'actualizar_reporte' } },
  );
  check(patch, { 'photoURLs actualizado': (r) => r.status === 200 });
  sleep(1);
}
