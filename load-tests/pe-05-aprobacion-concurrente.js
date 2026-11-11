/* global __ENV, __VU */
/* eslint-disable import/no-unresolved -- módulos k6 provistos por el runtime de k6 */
// PE-05 20 aprobaciones simultáneas del MISMO reporte.
// Replica la transacción de verifyReport() (src/mobile/shared/firebase/reports.ts):
//   leer reporte -> si ya 'verificado' abortar -> update status + crear pointTransactions (auto-id)
// usando precondición updateTime (concurrencia optimista, como runTransaction).
// Criterio de aceptación: exactamente 1 commit exitoso y 1 documento pointTransactions para el reporte.
// La parte on-chain (MetaMask) no se ejercita aquí: su idempotencia está cubierta por
// contracts/test/PointLedger.test.js ("10. Un mismo reporte no puede procesarse dos veces").
import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';
import { DOCS, OWNER, PROJECT, bearer, fields, reportFields, seedUser, signUp } from './lib/firebase.js';

const commits = new Counter('aprobaciones_exitosas');

export const options = {
  scenarios: {
    aprobaciones: { executor: 'per-vu-iterations', vus: 20, iterations: 1, maxDuration: '1m' },
  },
  thresholds: {
    aprobaciones_exitosas: ['count==1'],
  },
};

export function setup() {
  const admin = signUp(`pe05-admin-${Date.now()}@k6.test`, 'Segura123!');
  seedUser(admin.uid, 'admin');
  const reporter = signUp(`pe05-rep-${Date.now()}@k6.test`, 'Segura123!');
  seedUser(reporter.uid, 'user');
  const res = http.post(`${DOCS}/reports`, JSON.stringify({ fields: reportFields(reporter.uid) }), OWNER);
  return { admin, reporter, reportId: res.json('name').split('/').pop() };
}

export default function (data) {
  const auth = bearer(data.admin.token);
  const base = `projects/${PROJECT}/databases/(default)/documents`;
  const snap = http.get(`${DOCS}/reports/${data.reportId}`, auth);
  if (snap.json('fields.status.stringValue') === 'verificado') return;
  const updateTime = snap.json('updateTime');

  const txId = `k6-${__VU}-${Date.now()}`;
  const body = {
    writes: [
      {
        update: {
          name: `${base}/reports/${data.reportId}`,
          fields: fields({ status: 'verificado', pointsAwarded: 100, reviewedBy: data.admin.uid }),
        },
        updateMask: { fieldPaths: ['status', 'pointsAwarded', 'reviewedBy'] },
        currentDocument: { updateTime },
      },
      {
        update: {
          name: `${base}/pointTransactions/${txId}`,
          fields: fields({ userId: data.reporter.uid, type: 'report_verified', amount: 100, reportId: data.reportId }),
        },
        currentDocument: { exists: false },
      },
    ],
  };
  const res = http.post(`${DOCS}:commit`, JSON.stringify(body), auth);
  if (res.status === 200) commits.add(1);
  check(res, { 'commit 200 o conflicto 400/409': (r) => [200, 400, 409].includes(r.status) });
}

export function teardown(data) {
  const q = JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: 'pointTransactions' }],
      where: { fieldFilter: { field: { fieldPath: 'reportId' }, op: 'EQUAL', value: { stringValue: data.reportId } } },
    },
  });
  const rows = http.post(`${DOCS}:runQuery`, q, OWNER).json().filter((r) => r.document);
  console.log(`pointTransactions para ${data.reportId}: ${rows.length} (esperado 1)`);
}
