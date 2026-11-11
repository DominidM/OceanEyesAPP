/* global __ENV, __VU */
/* eslint-disable import/no-unresolved -- módulos k6 provistos por el runtime de k6 */
// PE-03 Dashboard admin, 30 VU.
// Replica las lecturas de src/admin/presentation/sections/dashboard/*: reports (orderBy createdAt, limit 200),
// users, pointTransactions y alerts.
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { DOCS, OWNER, bearer, reportFields, seedUser, signUp } from './lib/firebase.js';

export const options = {
  scenarios: { dashboard: { executor: 'constant-vus', vus: 30, duration: '2m' } },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'group_duration{group:::dashboard}': ['p(95)<2500'],
  },
};

const recentReports = JSON.stringify({
  structuredQuery: {
    from: [{ collectionId: 'reports' }],
    orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
    limit: 200,
  },
});

export function setup() {
  const admin = signUp(`pe03-admin-${Date.now()}@k6.test`, 'Segura123!');
  seedUser(admin.uid, 'admin');
  for (let i = 0; i < 300; i += 1) {
    http.post(`${DOCS}/reports`, JSON.stringify({ fields: reportFields(`seed-${i % 25}`) }), OWNER);
  }
  return { admin };
}

export default function (data) {
  const auth = bearer(data.admin.token);
  group('dashboard', () => {
    check(http.post(`${DOCS}:runQuery`, recentReports, { ...auth, tags: { name: 'reports_recientes' } }), {
      'reports 200': (r) => r.status === 200,
    });
    check(http.get(`${DOCS}/users?pageSize=100`, { ...auth, tags: { name: 'users' } }), {
      'users 200': (r) => r.status === 200,
    });
    check(http.get(`${DOCS}/pointTransactions?pageSize=100`, { ...auth, tags: { name: 'pointTransactions' } }), {
      'tx 200': (r) => r.status === 200,
    });
    check(http.get(`${DOCS}/alerts?pageSize=50`, { ...auth, tags: { name: 'alerts' } }), {
      'alerts 200': (r) => r.status === 200,
    });
  });
  sleep(2);
}
