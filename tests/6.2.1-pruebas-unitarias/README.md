# 6.2.1 — Pruebas Unitarias

## Objetivo

Verificar de forma aislada la lógica de dominio y de configuración del proyecto
OceanEyes, garantizando que las reglas de negocio y los guards de configuración
se comporten correctamente sin depender de servicios externos (Firebase,
Cloudinary, blockchain).

## Alcance

Se prueban funciones puras y value objects del dominio de reportes, utilidades
compartidas y los guards de configuración que permiten que la app arranque sin
`.env` (rama capstone).

## Herramientas

- **Jest** 30.5.2 (runner)
- **jest-expo** 54.0.18 (preset multiplataforma)
- **@testing-library/react-native** 14.1.0
- **react-test-renderer** 19.1.0

## Estructura de casos

| ID | Archivo de test | Suite | Casos | Resultado |
|----|-----------------|-------|-------|-----------|
| PU-01 | `src/mobile/shared/utils/__tests__/format-duration.test.ts` | formatDuration | 3 | ✅ |
| PU-02 | `src/mobile/modules/reports/domain/valueObjects/__tests__/geo-location.test.ts` | createGeoLocation | 4 | ✅ |
| PU-03 | `src/mobile/modules/reports/domain/valueObjects/__tests__/report-status.test.ts` | report status | 2 | ✅ |
| PU-04 | `src/mobile/modules/reports/domain/valueObjects/__tests__/report-category.test.ts` | report category | 3 | ✅ |
| PU-05 | `src/mobile/modules/alerts/presentation/utils/__tests__/distance.test.ts` | distance utils | 4 | ✅ |
| PU-06 | `src/mobile/shared/firebase/__tests__/config.test.ts` | firebase config (sin env) | 2 | ✅ |
| PU-07 | `src/mobile/shared/offline/__tests__/cloudinary.test.ts` | cloudinary config (sin env) | 1 | ✅ |
| PU-08 | `src/shared/blockchain/__tests__/config.test.ts` | blockchain config (sin env) | 2 | ✅ |

**Total: 8 suites, 21 casos, 21/21 OK.**

## Cómo ejecutar

```bash
npm test
```

## Detalle de casos

Ver archivos individuales en esta carpeta (`01-*.md` … `06-*.md`).

## Conclusión

Todas las pruebas unitarias pasan. La lógica de dominio (validación de
ubicación, estados y categorías de reporte, cálculo de distancia y formato de
duración) y los guards de configuración (Firebase, Cloudinary, blockchain) se
comportan según lo esperado, incluyendo el escenario "sin `.env`" de la rama
capstone.