# 6.2.2 — Pruebas de Aceptación

## Objetivo

Validar escenarios de negocio de extremo a extremo sobre el dominio de reportes,
comprobando que un reporte válido se acepta y que los datos inválidos se rechazan
según las reglas de negocio.

## Alcance

Escenario: creación de un reporte ambiental (categoría, estado inicial, ubicación
y puntos asignados). Se valida el flujo completo sobre los value objects del
dominio, sin servicios externos.

## Criterios de aceptación

1. Un reporte con categoría válida, estado `pendiente` y ubicación válida se
   acepta y recibe los puntos correspondientes a la categoría.
2. Un reporte con categoría inexistente o ubicación fuera de rango se rechaza.

## Herramientas

- **Jest** 30.5.2 + **jest-expo** 54.0.18

## Estructura de casos

| ID | Archivo de test | Escenario | Casos | Resultado |
|----|-----------------|-----------|-------|-----------|
| PA-01 | `src/mobile/modules/reports/__tests__/acceptance-report-flow.test.ts` | Flujo de creación de reporte | 2 | ✅ |

**Total: 1 suite, 2 casos, 2/2 OK.**

## Detalle de casos

Ver `01-flujo-creacion-reporte.md`.

## Conclusión

Los criterios de aceptación se cumplen: el flujo de creación de reporte acepta
datos válidos (con puntos por categoría) y rechaza datos inválidos.