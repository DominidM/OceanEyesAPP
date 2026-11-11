# Pruebas de carga (k6) — PE-01 a PE-05

Ejecutar **solo** contra el Emulador de Firebase o un proyecto de staging. `lib/firebase.js`
aborta si `FIREBASE_PROJECT=oceaneyes-5e7b4` (producción).

| ID | Script | Carga |
|----|--------|-------|
| PE-01 | `pe-01-mis-reportes.js` | Consulta "Mis reportes", rampa 0 → 100 VU |
| PE-02 | `pe-02-registro-con-foto.js` | Alta de reporte + foto 3 MB, 50 VU |
| PE-03 | `pe-03-dashboard.js` | Dashboard admin, 30 VU |
| PE-04 | `pe-04-rampa-300.js` | Rampa mixta hasta 300 VU |
| PE-05 | `pe-05-aprobacion-concurrente.js` | 20 aprobaciones simultáneas del mismo reporte |

## Contra el emulador (desde la raíz del repo)

```bash
# Terminal 1
firebase emulators:start --only auth,firestore,storage --project demo-oceaneyes

# Terminal 2 (instalar k6: winget install k6 --source winget  |  brew install k6)
k6 run load-tests/pe-01-mis-reportes.js
k6 run load-tests/pe-02-registro-con-foto.js
k6 run load-tests/pe-03-dashboard.js
k6 run load-tests/pe-04-rampa-300.js
k6 run load-tests/pe-05-aprobacion-concurrente.js
```

## Contra staging (proyecto Firebase separado, nunca producción)

```bash
k6 run \
  -e FIREBASE_PROJECT=<proyecto-staging> \
  -e FIREBASE_API_KEY=<web-api-key-staging> \
  -e FIRESTORE_HOST=https://firestore.googleapis.com \
  -e AUTH_HOST=https://identitytoolkit.googleapis.com \
  -e STORAGE_HOST=https://firebasestorage.googleapis.com \
  -e STORAGE_BUCKET=<bucket-staging> \
  load-tests/pe-01-mis-reportes.js
```

En staging el seeding con `Bearer owner` no funciona: los usuarios admin deben crearse antes
(rol `admin` en `users/{uid}`) y los datos semilla cargarse con `firebase-admin`.

El emulador corre en un solo proceso Java: las latencias sirven para comparar escenarios y
detectar contención (PE-05), no como SLA de producción.
