# PA-01 — Flujo de creación de reporte

- **Archivo de test:** `src/mobile/modules/reports/__tests__/acceptance-report-flow.test.ts`
- **Objetivo:** Validar el flujo completo de creación de un reporte válido y el
  rechazo de datos inválidos.

## Precondiciones

- Sin `.env` (rama capstone).
- Sin conexión a Firebase (prueba sobre dominio puro).

## Caso PA-01.1 — Reporte válido de pesca ilegal en Lima

| Paso | Acción | Resultado esperado | Resultado obtenido | Estado |
|------|--------|--------------------|--------------------|--------|
| 1 | `assertReportCategory('pesca_ilegal')` | Sin error | Sin error | ✅ |
| 2 | `assertReportStatus('pendiente')` | Sin error | Sin error | ✅ |
| 3 | `createGeoLocation(-12.0464, -77.0428, "Lima")` | Ubicación válida | Válida | ✅ |
| 4 | `reportCategoryPoints('pesca_ilegal')` | `100` | `100` | ✅ |
| 5 | Verificar estado inicial | `pendiente` | `pendiente` | ✅ |

## Caso PA-01.2 — Reporte con datos inválidos

| Paso | Acción | Resultado esperado | Resultado obtenido | Estado |
|------|--------|--------------------|--------------------|--------|
| 1 | `assertReportCategory('no_existe')` | Lanza error | Lanza | ✅ |
| 2 | `createGeoLocation(999, 0)` | Lanza error | Lanza | ✅ |

## Evidencia de ejecución

```
PASS src/mobile/modules/reports/__tests__/acceptance-report-flow.test.ts
  Aceptación: flujo de creación de reporte (6.2.2)
    ✓ valida un reporte completo de pesca ilegal en Lima (5 ms)
    ✓ rechaza un reporte con categoría o ubicación inválida (17 ms)
Tests: 2 passed, 2 total
```