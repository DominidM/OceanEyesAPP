#!/usr/bin/env node

/**
 * Script de Pruebas de Carga - Firebase Emulator
 * Registra N usuarios concurrentes y mide el rendimiento
 *
 * Uso: node test-emulator.js [numUsuarios] [concurrencia]
 * Ejemplo: node test-emulator.js 100 10
 */

const http = require('http');

// Parámetros
const NUM_USUARIOS = parseInt(process.argv[2]) || 50;
const CONCURRENCIA = parseInt(process.argv[3]) || 10;
const FIREBASE_PROJECT = 'oceaneyes-5e7b4';
const AUTH_EMULATOR_HOST = 'localhost:9099';
const API_KEY = 'fake-api-key-for-emulator';

console.log('═══════════════════════════════════════════════════════════');
console.log('📊 PRUEBA DE CARGA - FIREBASE EMULATOR');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Usuarios: ${NUM_USUARIOS}`);
console.log(`Concurrencia: ${CONCURRENCIA}`);
console.log(`Auth Emulator: http://${AUTH_EMULATOR_HOST}`);
console.log('');

// Función para registrar un usuario
async function registerUser(index) {
  return new Promise((resolve, reject) => {
    const email = `perf.user${index}@test.local`;
    const password = 'Prueba#2026x';

    const payload = JSON.stringify({
      email: email,
      password: password,
      returnSecureToken: true
    });

    const options = {
      hostname: 'localhost',
      port: 9099,
      path: `/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    };

    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        try {
          const response = JSON.parse(data);
          if (response.idToken) {
            resolve({
              success: true,
              email: email,
              duration: duration,
              statusCode: res.statusCode,
              error: null
            });
          } else {
            reject({
              success: false,
              email: email,
              duration: duration,
              statusCode: res.statusCode,
              error: response.error?.message || 'Sin idToken'
            });
          }
        } catch (e) {
          reject({
            success: false,
            email: email,
            duration: duration,
            statusCode: res.statusCode,
            error: e.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        success: false,
        email: email,
        duration: Date.now() - startTime,
        statusCode: 0,
        error: error.message
      });
    });

    req.write(payload);
    req.end();
  });
}

// Función para ejecutar pruebas con concurrencia limitada
async function runTestsWithConcurrency() {
  const results = [];
  const startTime = Date.now();

  console.log(`Iniciando ${NUM_USUARIOS} registros con concurrencia ${CONCURRENCIA}...`);
  console.log('');

  // Procesar en lotes
  for (let i = 0; i < NUM_USUARIOS; i += CONCURRENCIA) {
    const batch = [];
    for (let j = 0; j < CONCURRENCIA && (i + j) < NUM_USUARIOS; j++) {
      batch.push(
        registerUser(i + j + 1)
          .then(result => {
            results.push(result);
            process.stdout.write('.');
          })
          .catch(error => {
            results.push(error);
            process.stdout.write('✗');
          })
      );
    }
    await Promise.all(batch);
  }

  const totalTime = Date.now() - startTime;

  console.log('');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📈 RESULTADOS');
  console.log('═══════════════════════════════════════════════════════════');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Total: ${results.length} usuarios`);
  console.log(`✓ Exitosos: ${successful.length} (${(successful.length / results.length * 100).toFixed(1)}%)`);
  console.log(`✗ Fallidos: ${failed.length} (${(failed.length / results.length * 100).toFixed(1)}%)`);
  console.log('');

  if (successful.length > 0) {
    const durations = successful.map(r => r.duration);
    const avgDuration = durations.reduce((a, b) => a + b) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    console.log('Latencia (Exitosos):');
    console.log(`  Promedio: ${avgDuration.toFixed(2)} ms`);
    console.log(`  Mínimo: ${minDuration} ms`);
    console.log(`  Máximo: ${maxDuration} ms`);
    console.log('');
  }

  console.log(`Tiempo total: ${(totalTime / 1000).toFixed(2)} segundos`);
  console.log(`Throughput: ${(results.length / (totalTime / 1000)).toFixed(2)} usuarios/seg`);
  console.log('');

  if (failed.length > 0) {
    console.log('Errores:');
    failed.forEach(f => {
      console.log(`  ✗ ${f.email}: ${f.error}`);
    });
  }

  console.log('═══════════════════════════════════════════════════════════');
}

// Ejecutar
runTestsWithConcurrency().catch(console.error);
