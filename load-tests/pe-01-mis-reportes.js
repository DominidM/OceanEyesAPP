/* global __ENV, __VU */
/* eslint-disable import/no-unresolved -- módulos k6 provistos por el runtime de k6 */
// PE-01 Consulta "Mis reportes": rampa 0 → 100 VU.
// Replica subscribeMyReports(): where('userId','==',uid) (src/mobile/shared/firebase/reports.ts).
import http from 'k6/http';
import { check, sleep } from 'k6';
import { DOCS, OWNER, bearer, myReportsQuery, reportFields, seedUser, signUp } from './lib/firebase.js';

export const options = {
  scenarios: {
    mis_reportes: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '15s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:mis_reportes}': ['p(95)<800'],
  },
};

export function setup() {
  const users = [];
  for (let i = 0; i < 20; i += 1) {
    const u = signUp(`pe01-${Date.now()}-${i}@k6.test`, 'Segura123!');
    seedUser(u.uid, 'user');
    for (let j = 0; j < 10; j += 1) {
      http.post(`${DOCS}/reports`, JSON.stringify({ fields: reportFields(u.uid) }), OWNER);
    }
    users.push(u);
  }
  return { users };
}

export default function (data) {
  const u = data.users[(__VU - 1) % data.users.length];
  const res = http.post(`${DOCS}:runQuery`, myReportsQuery(u.uid), {
    ...bearer(u.token),
    tags: { name: 'mis_reportes' },
  });
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
