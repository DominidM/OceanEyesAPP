# PU-05 — Distance utils

- **Archivo de test:** `src/mobile/modules/alerts/presentation/utils/__tests__/distance.test.ts`
- **Funciones bajo prueba:** `haversineKm`, `formatDistance`
- **Objetivo:** Verificar cálculo de distancia y formateo.

## Casos

| ID | Entrada | Resultado esperado | Resultado obtenido | Estado |
|----|---------|--------------------|--------------------|--------|
| PU-05.1 | Mismo punto | `≈ 0` km | `≈ 0` km | ✅ |
| PU-05.2 | Lima → Callao | Entre 5 y 20 km | En rango | ✅ |
| PU-05.3 | `0.5` km | `500 m` | `500 m` | ✅ |
| PU-05.4 | `2.34` km | `2.3 km` | `2.3 km` | ✅ |

## Evidencia de ejecución

```
PASS src/mobile/modules/alerts/presentation/utils/__tests__/distance.test.ts
  distance utils
    ✓ haversineKm devuelve ~0 para el mismo punto (8 ms)
    ✓ haversineKm calcula distancia entre Lima y Callao (~10 km) (1 ms)
    ✓ formatDistance usa metros para <1km (1 ms)
    ✓ formatDistance usa km con un decimal para >=1km (1 ms)
Tests: 4 passed, 4 total
```