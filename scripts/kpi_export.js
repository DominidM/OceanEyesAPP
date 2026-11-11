#!/usr/bin/env node
/**
 * KPI de OceanEyes a partir de Firestore (solo lectura).
 *
 * Indicadores: total de reportes; con campos requeridos; con GPS válido; con evidencia;
 * con statusHistory completo; tiempo envío→primera decisión (media y mediana, horas);
 * verificados; recompensas emitidas (txHash); recompensas duplicadas.
 * Segmentación: equipo/demo vs. externos, y por mes (YYYY-MM de submittedAt/createdAt).
 *
 * Uso:
 *   npm i --no-save firebase-admin          # o reutilizar functions/node_modules
 *   # Producción (solo lectura) con cuenta de servicio:
 *   GOOGLE_APPLICATION_CREDENTIALS=./sa.json node scripts/kpi_export.js --project oceaneyes-5e7b4
 *   # Emulador:
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/kpi_export.js --project demo-oceaneyes
 *
 * Cuentas del equipo / demo (se combinan):
 *   - users con role 'admin' o 'municipal'
 *   - TEAM_UIDS="uid1,uid2"            (variables de entorno)
 *   - TEAM_EMAILS="a@x.com,b@y.com"
 *   - TEAM_EMAIL_DOMAINS="solvegrades.com,k6.test"
 *
 * Salida: tablas Markdown por stdout y JSON en --out (por defecto kpi_report.json).
 */
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const projectId = argValue('--project', process.env.GCLOUD_PROJECT || 'demo-oceaneyes');
const outFile = argValue('--out', 'kpi_report.json');

const REQUIRED_FIELDS = ['userId', 'category', 'title', 'status', 'createdAt', 'submittedAt'];
const DECIDED = new Set(['verificado', 'descartado']);
const list = (value) =>
  (value || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

const TEAM_UIDS = new Set(list(process.env.TEAM_UIDS));
const TEAM_EMAILS = new Set(list(process.env.TEAM_EMAILS));
const TEAM_DOMAINS = list(process.env.TEAM_EMAIL_DOMAINS);

const toDate = (value) => (value && typeof value.toDate === 'function' ? value.toDate() : null);

function hasRequiredFields(report) {
  return REQUIRED_FIELDS.every((field) => report[field] !== undefined && report[field] !== null && report[field] !== '');
}

function hasValidGps(report) {
  const loc = report.location;
  return (
    !!loc &&
    Number.isFinite(loc.latitude) &&
    Number.isFinite(loc.longitude) &&
    loc.latitude >= -90 &&
    loc.latitude <= 90 &&
    loc.longitude >= -180 &&
    loc.longitude <= 180 &&
    !(loc.latitude === 0 && loc.longitude === 0)
  );
}

function hasEvidence(report) {
  return (Array.isArray(report.photoURLs) && report.photoURLs.length > 0) || !!report.audioURL;
}

/** Completo = estado inicial 'pendiente' sin historial, o la última entrada lleva al estado actual. */
function historyComplete(report, history) {
  if (report.status === 'pendiente') return true;
  if (history.length === 0) return false;
  const last = history[history.length - 1];
  return last.toStatus === report.status;
}

function firstDecisionHours(report, history) {
  const sent = toDate(report.submittedAt) || toDate(report.createdAt);
  if (!sent) return null;
  const decision = history.find((h) => DECIDED.has(h.toStatus));
  const decidedAt = (decision && toDate(decision.createdAt)) || (DECIDED.has(report.status) ? toDate(report.reviewedAt) : null);
  if (!decidedAt) return null;
  return (decidedAt.getTime() - sent.getTime()) / 36e5;
}

const mean = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);
function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function emptyBucket() {
  return {
    total: 0,
    camposRequeridos: 0,
    gpsValido: 0,
    conEvidencia: 0,
    statusHistoryCompleto: 0,
    verificados: 0,
    recompensasConTxHash: 0,
    horasDecision: [],
  };
}

function summarize(bucket) {
  const { horasDecision, ...rest } = bucket;
  const round = (v) => (v === null ? null : Math.round(v * 100) / 100);
  return { ...rest, decisionesMedidas: horasDecision.length, horasMedia: round(mean(horasDecision)), horasMediana: round(median(horasDecision)) };
}

async function main() {
  initializeApp(process.env.FIRESTORE_EMULATOR_HOST ? { projectId } : { credential: applicationDefault(), projectId });
  const db = getFirestore();

  const [usersSnap, reportsSnap, txSnap] = await Promise.all([
    db.collection('users').get(),
    db.collection('reports').get(),
    db.collection('pointTransactions').get(),
  ]);

  const teamUids = new Set(TEAM_UIDS);
  usersSnap.forEach((d) => {
    const u = d.data();
    const email = String(u.email || '').toLowerCase();
    if (
      u.role === 'admin' ||
      u.role === 'municipal' ||
      TEAM_EMAILS.has(email) ||
      TEAM_DOMAINS.some((domain) => email.endsWith(`@${domain}`))
    ) {
      teamUids.add(d.id);
    }
  });

  const buckets = { global: emptyBucket(), equipo: emptyBucket(), externos: emptyBucket() };
  const byMonth = {};

  for (const reportDoc of reportsSnap.docs) {
    const report = reportDoc.data();
    const historySnap = await reportDoc.ref.collection('statusHistory').orderBy('createdAt', 'asc').get();
    const history = historySnap.docs.map((h) => h.data());
    const segment = teamUids.has(report.userId) ? 'equipo' : 'externos';
    const sent = toDate(report.submittedAt) || toDate(report.createdAt);
    const month = sent ? sent.toISOString().slice(0, 7) : 'sin-fecha';
    byMonth[month] = byMonth[month] || { equipo: emptyBucket(), externos: emptyBucket() };

    const hours = firstDecisionHours(report, history);
    for (const bucket of [buckets.global, buckets[segment], byMonth[month][segment]]) {
      bucket.total += 1;
      if (hasRequiredFields(report)) bucket.camposRequeridos += 1;
      if (hasValidGps(report)) bucket.gpsValido += 1;
      if (hasEvidence(report)) bucket.conEvidencia += 1;
      if (historyComplete(report, history)) bucket.statusHistoryCompleto += 1;
      if (report.status === 'verificado') bucket.verificados += 1;
      if (report.txHash) bucket.recompensasConTxHash += 1;
      if (hours !== null && hours >= 0) bucket.horasDecision.push(hours);
    }
  }

  const rewardsByReport = {};
  txSnap.forEach((d) => {
    const t = d.data();
    if (t.type === 'report_verified' && t.reportId) {
      rewardsByReport[t.reportId] = (rewardsByReport[t.reportId] || 0) + 1;
    }
  });
  const duplicated = Object.entries(rewardsByReport).filter(([, count]) => count > 1);
  const txWithHash = txSnap.docs.filter((d) => d.data().type === 'report_verified' && d.data().txHash).length;

  const result = {
    generadoEn: new Date().toISOString(),
    proyecto: projectId,
    cuentasEquipo: teamUids.size,
    global: summarize(buckets.global),
    equipo: summarize(buckets.equipo),
    externos: summarize(buckets.externos),
    porMes: Object.fromEntries(
      Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([m, b]) => [m, { equipo: summarize(b.equipo), externos: summarize(b.externos) }]),
    ),
    recompensas: {
      pointTransactionsReportVerified: Object.values(rewardsByReport).reduce((a, b) => a + b, 0),
      pointTransactionsConTxHash: txWithHash,
      reportesConRecompensaDuplicada: duplicated.length,
      detalleDuplicados: duplicated.map(([reportId, count]) => ({ reportId, count })),
    },
  };

  const keys = ['total', 'camposRequeridos', 'gpsValido', 'conEvidencia', 'statusHistoryCompleto', 'verificados', 'recompensasConTxHash', 'decisionesMedidas', 'horasMedia', 'horasMediana'];
  const row = (label, s) => `| ${label} | ${keys.map((k) => s[k] ?? '—').join(' | ')} |`;
  const header = `| Segmento | ${keys.join(' | ')} |\n|---|${keys.map(() => '---').join('|')}|`;

  console.log(`## KPI OceanEyes (${projectId}) — ${result.generadoEn}\n`);
  console.log(header);
  console.log(row('Global', result.global));
  console.log(row('Equipo/demo', result.equipo));
  console.log(row('Externos', result.externos));
  console.log('\n### Por mes\n');
  console.log(header.replace('Segmento', 'Mes / segmento'));
  for (const [month, seg] of Object.entries(result.porMes)) {
    console.log(row(`${month} equipo`, seg.equipo));
    console.log(row(`${month} externos`, seg.externos));
  }
  console.log('\n### Recompensas\n');
  console.log('| Indicador | Valor |\n|---|---|');
  for (const [k, v] of Object.entries(result.recompensas)) {
    if (k !== 'detalleDuplicados') console.log(`| ${k} | ${v} |`);
  }

  require('fs').writeFileSync(outFile, JSON.stringify(result, null, 2));
  console.log(`\nJSON: ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
