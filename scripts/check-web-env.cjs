/* global __dirname */
/**
 * Corta `deploy:web` antes de compilar si falta alguna variable pública que el bundle web
 * necesita. Sin ellas `expo export` genera igual un bundle que arranca sin Firebase ni
 * Cloudinary (pasó el 2026-11-12 con la versión e54b5c02).
 *
 * Lee las variables igual que `expo export` (modo production): primero process.env y luego
 * .env.production.local, .env.local, .env.production y .env con @expo/env.
 * Solo imprime nombres, nunca valores.
 */
const path = require('path');
const { parseProjectEnv } = require('@expo/env');

const REQUIRED = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME',
];

const projectRoot = path.join(__dirname, '..');
const { env: fromFiles, files } = parseProjectEnv(projectRoot, { mode: 'production', silent: true });
const value = (name) => (process.env[name] ?? fromFiles[name] ?? '').trim();
const missing = REQUIRED.filter((name) => value(name) === '');

if (missing.length > 0) {
  const loaded = files.length > 0 ? files.map((file) => path.basename(file)).join(', ') : 'ninguno';
  console.error('deploy:web cancelado: faltan variables públicas para el bundle web:');
  for (const name of missing) console.error(`  - ${name}`);
  console.error(`Archivos .env leídos: ${loaded}. Crea .env.local a partir de .env.example.`);
  process.exit(1);
}

console.log(`Variables públicas del bundle web: ${REQUIRED.length}/${REQUIRED.length} presentes.`);
