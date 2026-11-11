# PU-04 — ReportCategory

- **Archivo de test:** `src/mobile/modules/reports/domain/valueObjects/__tests__/report-category.test.ts`
- **Funciones bajo prueba:** `assertReportCategory`, `reportCategoryLabel`, `reportCategoryPoints`, `REPORT_CATEGORIES`
- **Objetivo:** Validar categorías y devolver etiqueta/puntos correctos.

## Casos

| ID | Entrada | Resultado esperado | Resultado obtenido | Estado |
|----|---------|--------------------|--------------------|--------|
| PU-04.1 | Todas las keys de `REPORT_CATEGORIES` | Sin error | Sin error | ✅ |
| PU-04.2 | `basura` | Lanza `InvalidReportError` | Lanza | ✅ |
| PU-04.3 | `pesca_ilegal` → label/puntos | `Pesca ilegal` / `100` | Igual | ✅ |

## Evidencia de ejecución

```
PASS src/mobile/modules/reports/domain/valueObjects/__tests__/report-category.test.ts
  report category
    ✓ acepta todas las categorías válidas (5 ms)
    ✓ rechaza una categoría desconocida (17 ms)
    ✓ devuelve etiqueta y puntos correctos (1 ms)
Tests: 3 passed, 3 total
```