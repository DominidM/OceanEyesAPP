# PU-06 — Configuración sin `.env` (rama capstone)

- **Archivos de test:**
  - `src/mobile/shared/firebase/__tests__/config.test.ts`
  - `src/mobile/shared/offline/__tests__/cloudinary.test.ts`
  - `src/shared/blockchain/__tests__/config.test.ts`
- **Funciones bajo prueba:** `isFirebaseConfigured`, `isCloudinaryConfigured`,
  `isPointLedgerConfigured`, `firebaseConfig`, `POINT_LEDGER_ADDRESS`.
- **Objetivo:** Garantizar que la app arranque sin `.env` y que los guards
  desactiven el backend real.

## Casos

| ID | Guard | Resultado esperado (sin env) | Resultado obtenido | Estado |
|----|-------|------------------------------|--------------------|--------|
| PU-06.1 | `isFirebaseConfigured()` | `false` | `false` | ✅ |
| PU-06.2 | `firebaseConfig` tiene apiKey/projectId/appId | Presentes | Presentes | ✅ |
| PU-06.3 | `isCloudinaryConfigured()` | `false` | `false` | ✅ |
| PU-06.4 | `isPointLedgerConfigured()` | `false` | `false` | ✅ |
| PU-06.5 | `POINT_LEDGER_ADDRESS` | `string` | `string` | ✅ |

## Evidencia de ejecución

```
PASS src/mobile/shared/firebase/__tests__/config.test.ts
  firebase config (sin env)
    ✓ isFirebaseConfigured es false sin variables de entorno (9 ms)
    ✓ firebaseConfig expone todas las claves esperadas (3 ms)
Tests: 2 passed, 2 total

PASS src/mobile/shared/offline/__tests__/cloudinary.test.ts
  cloudinary config (sin env)
    ✓ isCloudinaryConfigured es false sin variables de entorno (7 ms)
Tests: 1 passed, 1 total

PASS src/shared/blockchain/__tests__/config.test.ts
  blockchain config (sin env)
    ✓ isPointLedgerConfigured es false sin dirección configurada (6 ms)
    ✓ POINT_LEDGER_ADDRESS es string
Tests: 2 passed, 2 total
```