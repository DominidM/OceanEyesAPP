# Informe de correcciones — OceanEyes (rama `fix/cierre-100`)

> Base: `main` @ `9f533c6`. Rama: `fix/cierre-100` (17 commits, sin push ni merge).
> Fecha: 2026-11-11. Nada se ejecutó contra `oceaneyes-5e7b4`: reglas y carga se probaron con los
> emuladores de Firebase (proyecto `demo-oceaneyes`). Cada cifra sale de un comando ejecutado en
> esta sesión; los artefactos están en el repositorio (`load-tests/results/`) o se indican.

---

## 1. Tareas 1–15

| # | Tarea | Estado | Commit | Archivos tocados |
|---|---|---|---|---|
| — | Base: pruebas, k6, KPI e informe de auditoría | HECHO | `07b6be7` | `__tests__/`, `load-tests/`, `scripts/kpi_export.js`, `.github/workflows/ci.yml`, `informe_insumos_sistema.md` |
| 1 | SEC-01/SEC-02 reglas de `reports` | HECHO | `56ea041` | `firestore.rules`, `__tests__/rules/security-rules.test.ts` |
| 2 | SEC-03 lista blanca en `users` | HECHO (ver nota a) | `1e84f61` | `firestore.rules`, `src/mobile/shared/firebase/rewards.ts`, `src/mobile/shared/firebase/types.ts`, pruebas |
| 3 | SEC-04 `pointTransactions` solo admin | HECHO (ver nota a) | `8576a27` | `firestore.rules`, `rewards.ts`, `types.ts`, pruebas |
| 4 | Categorías on-chain — opción (a) mapeo, sin redeploy | HECHO | `efabd68` | `src/shared/blockchain/category-map.ts` (nuevo), `src/shared/blockchain/ledger.ts`, `__tests__/unit/category-map.test.ts` |
| 5 | Eliminar `awardPointsForVerifiedReport` | HECHO | `d06b8c1` | `functions/src/index.ts` (`npm run build` → exit 0; `lib/index.js` solo exporta `promoteAlertCluster`) |
| 6 | PU-02 contraseña ≥ 8 | HECHO | `a5a5423` | `src/shared/auth/password-policy.ts` (nuevo), `login.viewmodel.ts`, `municipal-signup.ts`, `change-password-screen.tsx`, `users-new-screen.tsx`, `municipio/application-section/page.tsx`, pruebas |
| 7 | Campo descripción (opcional, ≤ 500) | HECHO | `091b5d6` | `incident-step.tsx`, `summary-step.tsx`, `report-create-screen.tsx`, `report-create.viewmodel.ts`, `domain/entities/report.ts`, `report-detail-screen.tsx`, pruebas |
| 8 | `statusHistory` inicial y en la misma transacción | HECHO | `7479456` | `src/mobile/shared/firebase/reports.ts`, `report-detail-screen.tsx`, `firestore.rules`, pruebas |
| 9 | Validación MIME/tamaño ≤ 25 MB | HECHO (ver nota b) | `523a0a6` | `src/mobile/shared/offline/media-validation.ts` (nuevo), `media.ts`, `cloudinary.ts`, `capture-step.tsx`, `storage.rules`, `scripts/create-cloudinary-preset.sh`, pruebas |
| 10 | `/api/send-push`: idToken admin/municipal + límite por IP | HECHO | `c7b0239` | `src/shared/gateway/firebase-token.ts` y `send-push.ts` (nuevos), `src/worker.ts`, `src/app/api/send-push+api.ts`, `alerts-screen.tsx`, `__tests__/unit/send-push.test.ts` |
| 11 | HU-056 Jest en `main` (cherry-pick selectivo) | HECHO | `49a024c` | `jest.config.js`, 9 suites `src/**/__tests__/`, `tests/` (docs 6.2), `package.json` (`test`, `test:coverage`, `test:rules`; jest 30.5.2, jest-expo 54.0.18, @types/jest 30), `package-lock.json`, `.gitignore` |
| 12 | HU-057 CI en `push`/`pull_request` a `main` | HECHO (ver nota c) | `7e5bb2f` | `.github/workflows/ci.yml` |
| 13 | HU-058 OpenAPI 3.1 | HECHO | `625164c` | `docs/openapi.yaml` |
| 14 | `contracts/package-lock.json` | HECHO | `e27a3fb` | `contracts/package-lock.json` (`npm ci` → exit 0) |
| 15 | k6 PE-01…PE-05 contra emulador | HECHO (2 escenarios no cumplen umbral) | `68f39fe` | `load-tests/results/*`, `load-tests/run-all.js`, `load-tests/README.md` |

Notas:
- **a)** Desviación consciente del enunciado: el canje (`redeemReward`) descuenta puntos y asienta su `pointTransactions` desde el cliente. Para no romperlo, las reglas solo admiten (1) un débito de `pointsBalance` igual a `pointsSpent` de un `redemptions` creado **en la misma transacción** (`lastRedemptionId`), y (2) un asiento `type: 'redemption'`, `amount` negativo, con id fijo `redemption-<redemptionId>`. Los créditos (`report_verified`, `bonus`) son solo admin. También se exige `pointsSpent == rewards.pointsCost` al crear un canje. La lista blanca de `users` incluye además `dni`, `profileType` y `email` porque la app los edita (`updateUserProfile`, `linkAccountWithEmail`).
- **b)** `max_file_size=26214400` quedó documentado y añadido al script de Cloudinary, pero **no se ejecutó ni se validó contra la API de Cloudinary** (requiere credenciales reales).
- **c)** El workflow está activo en el YAML, pero **no se ha ejecutado en GitHub**: la rama no se ha subido.

### Mapeo de categorías (tarea 4)

| Categoría app | Pts app (Firestore) | Categoría on-chain | Pts on-chain |
|---|---|---|---|
| pesca_ilegal | 100 | pesca_ilegal | 100 |
| embarcacion_sospechosa | 40 | pesca_ilegal | 100 |
| basura_marina | 50 | basura_marina | 50 |
| derrame_hidrocarburos | 100 | basura_marina | 50 |
| redes_fantasmas | 50 | basura_marina | 50 |
| variacion_mar | 30 | variacion_mar | 30 |
| marea_roja | 40 | variacion_mar | 30 |
| fauna_herida | 60 | variacion_mar | 30 |
| otro | 30 | variacion_mar | 30 |

Los puntos canjeables siguen siendo los de Firestore. En 4 categorías el puntaje on-chain difiere del de la app (`embarcacion_sospechosa`, `derrame_hidrocarburos`, `marea_roja`, `fauna_herida`); igualarlos exige la opción (b) con redeploy.

---

## 2. Pruebas por caso

Comandos: `npx jest` (raíz, 15 suites / 74 tests), `cd __tests__ && npx jest --selectProjects unit` (6 suites / 51 tests), `npm run test:rules` (emulador, 32 tests).

| Caso | Archivo | Resultado | Antes (auditoría) |
|---|---|---|---|
| PU-01 Registro válido | `__tests__/unit/auth-register.test.ts` | ✅ Aprobado | ✅ |
| PU-02 Contraseña < 8 (registro) | idem | ✅ Aprobado | ❌ |
| PU-02 Vinculación de invitado con 7 caracteres | idem | ✅ Aprobado | — |
| PU-02 Gateway `/api/auth/signup` → 400 `auth/weak-password` sin llamar a Firebase | idem | ✅ Aprobado | — |
| PU-03 Wizard con campos vacíos (5 casos) | `__tests__/unit/report-wizard.test.ts` | ✅ 5/5 | ✅ |
| PU-04 Lat > 90 (3 casos) | idem | ✅ 3/3 | ✅ |
| PU-05 Cliente: MIME y tamaño ≤ 25 MB (9 casos) | `__tests__/unit/media-validation.test.ts` | ✅ 9/9 | — |
| PU-05 Storage: JPEG ok, PDF ✗, 26 MB ✗, 24 MB ok, 51 MB ✗, reporte ajeno ✗ | `__tests__/rules/security-rules.test.ts` | ✅ 6/6 | ✅ 4/4 (límite 50 MB) |
| PU-06 Guardado offline (2 casos) | `__tests__/unit/offline-sync.test.ts` | ✅ 2/2 | ✅ |
| PU-07 Sync 3 pendientes sin duplicar | idem | ✅ | ✅ |
| PU-08 Pendiente→Verificado con `statusHistory` (2 casos) | reglas | ✅ 2/2 | ✅ |
| PU-08b Historial inicial `— → pendiente` en batch con el reporte; dueño no escribe otras entradas; admin estado+historial atómico | reglas | ✅ 3/3 | — |
| PU-09 Ciudadano no lee reporte ajeno (2 casos) | reglas | ✅ 2/2 | ✅ |
| PU-10 Ciudadano no cambia estado | reglas | ✅ | ✅ |
| SEC-01 Crear reporte: pendiente ok; verificado ✗; con puntos ✗; con `txHash`/`reviewedBy`/`onChainStatus` ✗ | reglas | ✅ 4/4 | ❌ (aceptaba verificado) |
| SEC-02 Dueño: medios en pendiente ok; `pointsAwarded`/`location` ✗; tras verificación todo ✗ | reglas | ✅ 3/3 | — |
| SEC-03 Perfil: campos permitidos ok; `status`/`bannedUntil`/`deviceHash`/`banReason`/`role` ✗; suspendido no se reactiva ni cambia wallet; puntos fuera de canje ✗; débito ligado a canje ok; débito incorrecto ✗ | reglas | ✅ 6/6 | — |
| SEC-04 `pointTransactions`: crédito por usuario ✗; débito sin canje ✗; canje completo ok; costo distinto ✗; admin ok | reglas | ✅ 5/5 | — |
| SEC-06 `/api/send-push`: token válido/aud/iss/exp/sub/firma; 401 sin token y token inválido; 403 rol `user`; 200 admin y municipal; 429 por IP; limitador | `__tests__/unit/send-push.test.ts` | ✅ 13/13 | — |
| Mapeo de categorías: cobertura de las 9, mapeo y puntos por categoría, rechazo de desconocida | `__tests__/unit/category-map.test.ts` | ✅ 11/11 | — |
| Descripción: `send()` la incluye recortada; vacía se omite; dominio rechaza > 500 | `__tests__/unit/report-wizard.test.ts` | ✅ 3/3 | — |
| Suites de capstone (distance, geo-location, report-status, report-category, acceptance-report-flow, configs, format-duration) | `src/**/__tests__/` | ✅ 23/23 | solo en rama capstone |
| Contrato PointLedger | `contracts/test/` | ✅ 29/29 | ✅ 29/29 |

Totales: **Jest raíz 74/74**, **reglas 32/32**, **Hardhat 29/29**. Ningún caso fallido.

---

## 3. Cobertura y calidad

| Indicador | Resultado | Comando |
|---|---|---|
| Contrato | Stmts 100 % · Branch 97,06 % · Funcs 100 % · Lines 100 % | `cd contracts && npx hardhat coverage` |
| App, global `src/**` | Stmts 5,00 % (351/7012) · Branch 3,97 % (199/5006) · Funcs 4,11 % (77/1873) · **Lines 5,19 % (329/6328)** | `npx jest --coverage` |
| App, archivos con lógica probada | `category-map.ts` 100 % · `password-policy.ts` 100 % · `report.ts` (dominio) 100 % líneas · `media-validation.ts` 95 % · `send-push.ts` 89,06 % · `firebase-token.ts` 83,72 % · `report-create.viewmodel.ts` 82,6 % (runner `__tests__`) · `outbox.ts` 89,89 % · `sync-engine.ts` 62,85 % · `login.viewmodel.ts` 58 % | ambos runners |
| `npx tsc --noEmit` | 0 errores | — |
| `npx eslint src` | 0 errores · 32 advertencias (`no-unused-vars` 17, `import/first` 10, `exhaustive-deps` 3, `no-require-imports` 1, `array-type` 1) | — |
| OpenAPI | Válido; 1 advertencia (`no-server-example.com`: servidor `localhost` de desarrollo, intencional) | `npx @redocly/cli@1.34.5 lint docs/openapi.yaml` |
| Worker | Empaqueta: 44,35 KiB (gzip 12,20 KiB) | `npx wrangler deploy --dry-run` (sin desplegar) |

La cobertura global es baja porque la mayor parte de `src/` es UI (pantallas React Native/web) sin pruebas de componentes.

`npm audit --omit=dev`:

| Paquete | Crítica | Alta | Moderada | Baja | Total | Auditoría previa |
|---|---|---|---|---|---|---|
| Raíz | 1 | 13 | 33 | 1 | 48 | 1 / 13 / 17 / 1 = 32 |
| `functions/` | 1 | 3 | 9 | 1 | 14 | igual |
| `contracts/` | 0 | 0 | 0 | 0 | 0 | igual |
| `contracts/` (con dev) | 1 | 24 | 13 | 19 | 57 | igual |

Las 16 moderadas nuevas de la raíz aparecen al añadir Jest (tarea 11): `jest`, `jest-circus`, `jest-runtime`, `@jest/*`, `babel-jest`, `babel-plugin-istanbul`, `test-exclude`, `glob`/`minimatch`, entre otras, que npm incluye en el árbol de `--omit=dev`. No se corrigieron vulnerabilidades en esta rama.

---

## 4. Resultados k6 (emulador `demo-oceaneyes`, k6 v1.0.0)

Emuladores auth + firestore + storage en un solo equipo Windows (proceso Java único). Las cifras sirven para comparar escenarios; **no son una medición de producción**.

| ID | VUs | Peticiones | p95 | Errores HTTP | Umbral | ¿Cumple? |
|---|---|---|---|---|---|---|
| PE-01 Mis reportes (rampa 0→100) | 100 | 8 311 (71,4 req/s) | 49 ms (`mis_reportes`) | 0,00 % | p95 < 800 ms; errores < 1 % | ✅ Sí |
| PE-02 Alta + foto 3 MB | 50 | 3 004 | `crear_reporte` 1 392 ms · `subir_foto` **5 833 ms** | 0,00 % | alta < 1 500 ms ✅; subida < 5 000 ms ❌; errores < 2 % ✅ | ❌ No (subida) |
| PE-03 Dashboard admin | 30 | 6 942 | grupo dashboard 257 ms (HTTP 150 ms) | 0,00 % | grupo < 2 500 ms; errores < 1 % | ✅ Sí |
| PE-04 Rampa mixta a 300 | 300 | 31 512 (94,1 req/s) | **2 928 ms** (p90 2 058 ms) | 0,00 % | p95 < 2 000 ms ❌; errores < 5 % ✅ | ❌ No (latencia) |
| PE-05 20 aprobaciones simultáneas | 20 | 40 | 2 948 ms | 32,50 % (rechazos esperados) | exactamente 1 aprobación | ✅ Sí: 1 commit exitoso, 13 rechazados por precondición `updateTime`, 6 abortados al leer `verificado`; `pointTransactions` del reporte = **1** |

- PE-04, primer intento (`load-tests/results/pe-04-rampa-300.intento1.*`): el proceso se detuvo en 4 min 30 s y se reanudó 2 h 13 min después sin salida intermedia (compatible con una suspensión del equipo); 300 iteraciones interrumpidas, p95 3 911 ms. Se descartó y se repitió completo (5 min 35 s, 0 iteraciones interrumpidas).
- PE-05 cuenta los commits rechazados como `http_req_failed`; su criterio es el contador `aprobaciones_exitosas == 1`, que se cumplió.

Archivos: `load-tests/results/pe-0X-*.txt` (salida completa) y `*.summary.json`.

---

## 5. Inventario funcional F01–F35 actualizado

| # | Funcionalidad | Antes | Ahora | Evidencia del cambio |
|---|---|---|---|---|
| F01 | Registro email/contraseña | Parcial | **Implementada** | Tarea 6, PU-02 ✅ |
| F02 | Login Google | Implementada | Implementada | — |
| F03 | Invitado + vinculación | Implementada | Implementada | Mínimo 8 también en vinculación |
| F04 | Login Apple | Retirada | Retirada (decisión del equipo) | — |
| F05 | Wizard 5 pasos | Implementada | Implementada | — |
| F06 | Foto/video/galería | Implementada | Implementada | + validación MIME/tamaño |
| F07 | Audio | Implementada | Implementada | — |
| F08 | Ubicación GPS | Implementada | Implementada | — |
| F09 | Anonimato/DNI/consentimiento | Implementada | Implementada | — |
| F10 | Descripción libre | No implementada | **Implementada** | Tarea 7 |
| F11 | Offline-first | Implementada | Implementada | + historial inicial al sincronizar |
| F12 | Mis reportes | Implementada | Implementada | — |
| F13 | Mapa en tiempo real | Implementada | Implementada | — |
| F14 | Notificación de cambio de estado | Parcial | Parcial | Sin cambios (solo local, con la app abierta o en segundo plano) |
| F15 | Canje de recompensas | Implementada | Implementada | Reglas de canje endurecidas |
| F16 | Seguimiento de canjes | Implementada | Implementada | — |
| F17 | Historial de puntos | Implementada | Implementada | Créditos solo admin |
| F18 | Wallet + saldo on-chain | Implementada | Implementada | — |
| F19 | Verificación + puntos on-chain | Parcial | **Implementada** | Tarea 4: las 9 categorías se registran on-chain (con puntaje agrupado) |
| F20 | Revocación on-chain | Parcial | Parcial | Sin UI de `revokePoints` |
| F21 | Dashboard admin | Implementada | Implementada | — |
| F22 | Gestión de usuarios | Implementada | Implementada | — |
| F23 | Baneo | Implementada | Implementada | El baneo ya no se puede revertir desde el cliente (SEC-03) |
| F24 | Alertas oficiales + push | Implementada | Implementada | Endpoint autenticado (tarea 10) |
| F25 | Ingesta USGS/NOAA | Implementada | Implementada | — |
| F26 | Alertas por clúster | Implementada en código | Implementada en código | Despliegue no verificable |
| F27 | Onboarding municipal | Implementada | Implementada | — |
| F28 | Campañas | Implementada | Implementada | — |
| F29 | Catálogo ONG (HU-040) | Eliminada | Eliminada | No abordada (fuera de las 15 tareas) |
| F30 | Landing + quiz + contacto | Implementada | Implementada | — |
| F31 | Accesibilidad, legales | Implementada | Implementada | — |
| F32 | Pruebas automatizadas (HU-056) | Parcial | **Implementada** | Tarea 11 (cobertura global 5,19 %) |
| F33 | CI/CD (HU-057) | No implementada | **Parcial** | CI activo en YAML (no ejecutado en GitHub); sin despliegue continuo |
| F34 | OpenAPI (HU-058) | No implementada | **Implementada** | Tarea 13 |
| F35 | Puntos por Cloud Function | No funcional | Retirada por diseño | Tarea 5 (los puntos se otorgan en `verifyReport`) |

**Ahora: 29 implementadas · 3 parciales (F14, F20, F33) · 3 retiradas/eliminadas (F04, F29, F35).**
- 29/35 = **82,9 %**; con parciales a 0,5: 30,5/35 = **87,1 %**.
- Si F04 y F35 se excluyen por ser retiros por decisión de diseño: 29/33 = **87,9 %**.

**Fe de erratas de `informe_insumos_sistema.md` §4.3:** decía "24 implementadas, 7 parciales, 4 no" y "78,6 %". El recuento correcto de esa tabla es 24 implementadas, 5 parciales (F01, F14, F19, F20, F32) y 6 no implementadas/retiradas → 68,6 % (sin cambio) y **75,7 %** con parciales a 0,5.

### Lo que falta para un 100 % real

| Pendiente | Esfuerzo (h) | Archivos |
|---|---|---|
| F14 Push del cambio de estado con la app cerrada (Cloud Function `onDocumentUpdated` → Expo Push con `deviceTokens`) | 6 | `functions/src/index.ts` |
| F20 UI de `revokePoints` en el detalle del reporte | 4 | `report-detail-screen.tsx`, `ledger.ts` |
| F33 CD: job de despliegue (Worker y reglas) con secretos de GitHub y aprobación manual | 4 | `.github/workflows/` |
| F29 Catálogo de ONG verificadas (HU-040) | 12 | restaurar desde `c4af22c` |
| PE-02 / PE-04: repetir en staging (no emulador) antes de concluir sobre rendimiento | 3 | `load-tests/` |
| Riesgos pendientes: SEC-05 (`rewards.update` por cualquier usuario), SEC-07 (abuso de `/api/contact` y `/api/email-rol`), SEC-08 (contraseña admin en memoria), URLs públicas de Cloudinary | 10 | `firestore.rules`, `src/worker.ts`, `auth.ts` |

---

## 6. Capturas para el Anexo F

| # | Captura | Dónde / comando | Qué debe verse |
|---|---|---|---|
| F-1 | Rama y commits | `git log --oneline main..fix/cierre-100` | Los 17 commits `fix(...)` |
| F-2 | Reglas en emulador | `npm run test:rules` | 32 passed, incluidos SEC-01…SEC-04 y PU-08b |
| F-3 | Jest unificado | `npm test` | 15 suites, 74 passed |
| F-4 | Cobertura app | `npm run test:coverage` | Resumen 5,19 % líneas y tabla por archivo |
| F-5 | Hardhat | `cd contracts && npx hardhat test && npx hardhat coverage` | 29 passing; 100 % líneas / 97,06 % ramas |
| F-6 | `npm ci` del contrato | `cd contracts && npm ci` | Instalación sin el error de lockfile |
| F-7 | Functions compila | `cd functions && npm run build` | Sin errores; solo `promoteAlertCluster` en `lib/index.js` |
| F-8 | tsc / ESLint | `npx tsc --noEmit` y `npx eslint src` | 0 errores; 32 advertencias |
| F-9 | Descripción en el wizard | App → Reportar → paso 4 | Campo "Descripción (opcional)" con contador 0/500 en cualquier categoría |
| F-10 | Descripción en resumen y panel | Paso 5 y `/admin/reports/[id]` | Fila "Descripción" con el texto enviado |
| F-11 | Contraseña corta | `/mobile/login` → Crear cuenta con 7 caracteres | "La contraseña debe tener al menos 8 caracteres." |
| F-12 | Archivo rechazado | Paso 2 → galería con imagen > 25 MB | Alerta "Archivo no válido … el máximo es 25.0 MB" |
| F-13 | Historial de estados | Consola del emulador → `reports/{id}/statusHistory` | Entrada `initial` (`null → pendiente`) y entrada del cambio con `changedBy` |
| F-14 | Push protegido | `curl -X POST …/api/send-push` sin token | HTTP 401 `{"error":"Falta el token de autenticación."}` |
| F-15 | OpenAPI | `npx @redocly/cli lint docs/openapi.yaml` o vista Redoc/Swagger | "Your API description is valid" y los 7 endpoints |
| F-16 | CI | `.github/workflows/ci.yml` y, tras el push, la pestaña Actions | Triggers `push`/`pull_request` a `main` y los 6 jobs |
| F-17 | k6 | `load-tests/results/pe-0X-*.txt` | Bloque THRESHOLDS de cada escenario (PE-02 y PE-04 con ✗) |
| F-18 | Idempotencia | `load-tests/results/pe-05-aprobacion-concurrente.txt` | `aprobaciones_exitosas count=1` y "pointTransactions …: 1 (esperado 1)" |
