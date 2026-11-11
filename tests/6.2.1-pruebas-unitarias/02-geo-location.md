# PU-02 — createGeoLocation

- **Archivo de test:** `src/mobile/modules/reports/domain/valueObjects/__tests__/geo-location.test.ts`
- **Función bajo prueba:** `createGeoLocation(latitude, longitude, address?)`
- **Objetivo:** Validar latitud/longitud y lanzar `InvalidReportError` fuera de rango.

## Casos

| ID | Entrada | Resultado esperado | Resultado obtenido | Estado |
|----|---------|--------------------|--------------------|--------|
| PU-02.1 | `(-12.0464, -77.0428, "Lima")` | Objeto con lat/lon/address | Igual | ✅ |
| PU-02.2 | `(200, 0)` | Lanza `InvalidReportError` | Lanza | ✅ |
| PU-02.3 | `(0, 400)` | Lanza `InvalidReportError` | Lanza | ✅ |
| PU-02.4 | `(NaN, 0)` | Lanza `InvalidReportError` | Lanza | ✅ |

## Evidencia de ejecución

```
PASS src/mobile/modules/reports/domain/valueObjects/__tests__/geo-location.test.ts
  createGeoLocation
    ✓ crea una ubicación válida (5 ms)
    ✓ lanza error con latitud inválida (21 ms)
    ✓ lanza error con longitud inválida (2 ms)
    ✓ lanza error con NaN (1 ms)
Tests: 4 passed, 4 total
```