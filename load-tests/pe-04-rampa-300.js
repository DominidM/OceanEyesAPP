/* global __ENV, __VU */
/* eslint-disable import/no-unresolved -- módulos k6 provistos por el runtime de k6 */
// PE-04 Rampa de estrés hasta 300 VU con tráfico mixto (70 % lectura "Mis reportes", 30 % creación).
import http from 'k6/http';
import { check, sleep } from 'k6';
import { DOCS, bearer, myReportsQuery, reportFields, seedUser, signUp } from './lib/firebase.js';

export const options = {
  scenarios: {
    rampa: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '1m', target: 200 },
        { duration: '1m', target: 300 },
        { duration: '2m', target: 300 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

export function setup() {
  const users = [];
  for (let i = 0; i < 60; i += 1) {
    const u = signUp(`pe04-${Date.now()}-${i}@k6.test`, 'Segura123!');
    seedUser(u.uid, 'user');
    users.push(u);
  }
  return { users };
}

export default function (data) {
  const u = data.users[(__VU - 1) % data.users.length];
  if (Math.random() < 0.7) {
    const r = http.post(`${DOCS}:runQuery`, myReportsQuery(u.uid), { ...bearer(u.token), tags: { name: 'mis_reportes' } });
    check(r, { 'lectura 200': (res) => res.status === 200 });
  } else {
    const r = http.post(`${DOCS}/reports`, JSON.stringify({ fields: reportFields(u.uid) }), {
      ...bearer(u.token),
      tags: { name: 'crear_reporte' },
    });
    check(r, { 'creación 200': (res) => res.status === 200 });
  }
  sleep(Math.random() * 2 + 0.5);
}
