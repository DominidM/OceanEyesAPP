/* global __dirname */
// Ejecuta PE-01..PE-05 contra los emuladores levantados por `firebase emulators:exec` y guarda
// los resúmenes en load-tests/results/. Uso (desde la raíz del repo):
//   firebase emulators:exec --only auth,firestore,storage --project demo-oceaneyes "node load-tests/run-all.js"
//   firebase emulators:exec ... "node load-tests/run-all.js pe-04"   # solo un escenario
// Binario de k6: variable K6_BIN o `k6` en el PATH.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const results = path.join(dir, 'results');
fs.mkdirSync(results, { recursive: true });

const k6 = process.env.K6_BIN || 'k6';
const env = {
  ...process.env,
  FIREBASE_PROJECT: 'demo-oceaneyes',
  FIRESTORE_HOST: `http://${process.env.FIRESTORE_EMULATOR_HOST}`,
  AUTH_HOST: `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com`,
  STORAGE_HOST: `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}`,
};

const only = process.argv.slice(2);
const scripts = ['pe-01-mis-reportes', 'pe-02-registro-con-foto', 'pe-03-dashboard', 'pe-04-rampa-300', 'pe-05-aprobacion-concurrente']
  .filter((name) => only.length === 0 || only.some((prefix) => name.startsWith(prefix)));

for (const name of scripts) {
  const started = new Date().toISOString();
  const run = spawnSync(
    k6,
    ['run', '--no-color', '--summary-export', path.join(results, `${name}.summary.json`), path.join(dir, `${name}.js`)],
    { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  fs.writeFileSync(
    path.join(results, `${name}.txt`),
    `# ${name} — inicio ${started} — exit ${run.status}\n# Emuladores Firebase (demo-oceaneyes)\n\n${run.stdout}\n${run.stderr}`,
  );
  console.log(`${name}: exit ${run.status}`);
}
