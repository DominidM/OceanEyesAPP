# PU-03 — ReportStatus

- **Archivo de test:** `src/mobile/modules/reports/domain/valueObjects/__tests__/report-status.test.ts`
- **Funciones bajo prueba:** `assertReportStatus`, `REPORT_STATUSES`
- **Objetivo:** Aceptar los 4 estados válidos y rechazar cualquier otro.

## Casos

| ID | Entrada | Resultado esperado | Resultado obtenido | Estado |
|----|---------|--------------------|--------------------|--------|
| PU-03.1 | `pendiente, en_revision, verificado, descartado` | Sin error | Sin error | ✅ |
| PU-03.2 | `borrado` | Lanza `InvalidReportError` | Lanza | ✅ |

## Evidencia de ejecución

```
PASS src/mobile/modules/reports/domain/valueObjects/__tests__/report-status.test.ts
  report status
    ✓ acepta todos los estados válidos (4 ms)
    ✓ rechaza un estado desconocido (18 ms)
Tests: 2 passed, 2 total
```