# Evidencia de ejecución — 6.2.1 Pruebas Unitarias

- **Comando:** `npm test` (Jest 30.5.2, jest-expo 54.0.18)
- **Fecha:** 21/10/2026
- **Resultado global:** Test Suites: 9 passed, 9 total · Tests: 23 passed, 23 total
  (incluye la suite de aceptación 6.2.2).

## Salida completa (extracto de suites unitarias)

```
PASS src/mobile/shared/firebase/__tests__/config.test.ts
  firebase config (sin env)
    ✓ isFirebaseConfigured es false sin variables de entorno (9 ms)
    ✓ firebaseConfig expone todas las claves esperadas (3 ms)

PASS src/mobile/modules/alerts/presentation/utils/__tests__/distance.test.ts
  distance utils
    ✓ haversineKm devuelve ~0 para el mismo punto (8 ms)
    ✓ haversineKm calcula distancia entre Lima y Callao (~10 km) (1 ms)
    ✓ formatDistance usa metros para <1km (1 ms)
    ✓ formatDistance usa km con un decimal para >=1km (1 ms)

PASS src/mobile/shared/utils/__tests__/format-duration.test.ts
  formatDuration
    ✓ formats 0 ms as 00:00 (6 ms)
    ✓ formats 65 seconds as 01:05
    ✓ truncates fractional seconds (1 ms)

PASS src/shared/blockchain/__tests__/config.test.ts
  blockchain config (sin env)
    ✓ isPointLedgerConfigured es false sin dirección configurada (6 ms)
    ✓ POINT_LEDGER_ADDRESS es string

PASS src/mobile/modules/reports/domain/valueObjects/__tests__/report-category.test.ts
  report category
    ✓ acepta todas las categorías válidas (5 ms)
    ✓ rechaza una categoría desconocida (17 ms)
    ✓ devuelve etiqueta y puntos correctos (1 ms)

PASS src/mobile/modules/reports/domain/valueObjects/__tests__/report-status.test.ts
  report status
    ✓ acepta todos los estados válidos (4 ms)
    ✓ rechaza un estado desconocido (18 ms)

PASS src/mobile/modules/reports/domain/valueObjects/__tests__/geo-location.test.ts
  createGeoLocation
    ✓ crea una ubicación válida (5 ms)
    ✓ lanza error con latitud inválida (21 ms)
    ✓ lanza error con longitud inválida (2 ms)
    ✓ lanza error con NaN (1 ms)

PASS src/mobile/shared/offline/__tests__/cloudinary.test.ts
  cloudinary config (sin env)
    ✓ isCloudinaryConfigured es false sin variables de entorno (7 ms)

Test Suites: 9 passed, 9 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        2.421 s
```

## Conclusión

21/21 casos unitarios (PU-01 … PU-06) pasan. No hay fallos.