# PU-01 — formatDuration

- **Archivo de test:** `src/mobile/shared/utils/__tests__/format-duration.test.ts`
- **Función bajo prueba:** `formatDuration(millis: number): string`
- **Objetivo:** Verificar el formateo de milisegundos a `MM:SS`.

## Casos

| ID | Entrada | Resultado esperado | Resultado obtenido | Estado |
|----|---------|--------------------|--------------------|--------|
| PU-01.1 | `0` | `00:00` | `00:00` | ✅ |
| PU-01.2 | `65000` | `01:05` | `01:05` | ✅ |
| PU-01.3 | `1999` | `00:01` (trunca fracción) | `00:01` | ✅ |

## Evidencia de ejecución

```
PASS src/mobile/shared/utils/__tests__/format-duration.test.ts
  formatDuration
    ✓ formats 0 ms as 00:00 (6 ms)
    ✓ formats 65 seconds as 01:05
    ✓ truncates fractional seconds (1 ms)
Tests: 3 passed, 3 total
```