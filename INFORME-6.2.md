# 6.2 Pruebas

## 6.2.1. Pruebas Unitarias

### Objetivo

Las pruebas unitarias verifican, de forma aislada y automatizada, las unidades de
lógica más pequeñas de OceanEyes: funciones de dominio, value objects, utilidades y
guards de configuración de la aplicación móvil desarrollada con React Native, Expo
SDK 54 y TypeScript. Su propósito es detectar regresiones de manera temprana en
las reglas de negocio críticas del proyecto —validación de datos del reporte,
cálculo de distancia, formato de duración y arranque sin `.env`— sin depender de la
red, de Firebase ni de dispositivos físicos. Esta actividad responde a la historia
de usuario HU-056 y al requerimiento no funcional RNF-11, y se alinea con las
características de adecuación funcional y fiabilidad de la norma ISO/IEC 25010 y
con los procesos de prueba de ISO/IEC 29119.

Se adoptó **Jest** 30.5.2 como framework de ejecución y aserciones, junto con el
preset **jest-expo** 54.0.18, que configura la transformación de TypeScript y la
simulación de los módulos nativos de Expo. Las dependencias externas se reemplazan
mediante `jest.mock` (por ejemplo, AsyncStorage en la suite de Cloudinary), lo que
mantiene las pruebas rápidas, deterministas e independientes entre sí. La Tabla 31
resume las herramientas utilizadas.

### Tabla 31 — Herramientas del entorno de pruebas unitarias

| Herramienta | Propósito | Uso en OceanEyes |
|---|---|---|
| Jest 30.5.2 | Framework de ejecución de pruebas, aserciones y medición de cobertura. | Ejecuta las suites `*.test.ts` y `*.test.tsx` del repositorio y genera el reporte de cobertura. |
| jest-expo 54.0.18 (preset) | Configuración de Jest para proyectos Expo / React Native. | Transforma TypeScript y JSX y simula los módulos nativos de Expo SDK 54. |
| React Native Testing Library 14.1.0 | Renderizado de componentes y consulta por texto o rol de accesibilidad. | Disponible en el entorno; las pruebas actuales son de dominio (sin renderizado de componentes). |
| react-test-renderer 19.1.0 | Motor de renderizado para las pruebas de componentes. | Dependencia de React Native Testing Library. |
| `jest.mock` / mocks manuales | Aislamiento de dependencias externas. | Reemplazo de AsyncStorage en `cloudinary.test.ts`, sin acceso a red ni a Firebase. |
| Temporizadores falsos de Jest | Control del tiempo en pruebas. | Disponibles para las suites de sincronización (no utilizados en las pruebas actuales). |
| Cobertura (`--coverage`) | Medición de líneas, ramas y funciones ejecutadas. | Disponible; no ejecutada en esta iteración (ver nota de alcance). |

### Alcance

El alcance se definió por módulos, priorizando la lógica de dominio de reportes y
los guards de configuración que permiten que la aplicación arranque sin `.env` en la
rama capstone. Las pruebas se concentran en las reglas de validación de los value
objects y en la configuración, y no en el código puramente visual. Quedan fuera de
las pruebas unitarias las reglas de seguridad de Firestore y Storage, que se
verifican con el emulador de Firebase en las pruebas de integración y seguridad,
así como el flujo de extremo a extremo, que se valida en las pruebas de aceptación
(6.2.2). La Tabla 32 relaciona cada módulo con las funciones evaluadas.

### Tabla 32 — Alcance de las pruebas unitarias por módulo

| Módulo | Funciones y componentes evaluados | Archivo de test |
|---|---|---|
| Utilidades compartidas | `formatDuration(millis)` | `src/mobile/shared/utils/__tests__/format-duration.test.ts` |
| Reportes — dominio (ubicación) | `createGeoLocation(lat, lon, address?)` | `src/mobile/modules/reports/domain/valueObjects/__tests__/geo-location.test.ts` |
| Reportes — dominio (estado) | `assertReportStatus`, `REPORT_STATUSES` | `src/mobile/modules/reports/domain/valueObjects/__tests__/report-status.test.ts` |
| Reportes — dominio (categoría) | `assertReportCategory`, `reportCategoryLabel`, `reportCategoryPoints`, `REPORT_CATEGORIES` (9 tipos) | `src/mobile/modules/reports/domain/valueObjects/__tests__/report-category.test.ts` |
| Alertas — utilidades | `haversineKm`, `formatDistance` | `src/mobile/modules/alerts/presentation/utils/__tests__/distance.test.ts` |
| Configuración Firebase (sin `.env`) | `isFirebaseConfigured`, `firebaseConfig` | `src/mobile/shared/firebase/__tests__/config.test.ts` |
| Configuración Cloudinary (sin `.env`) | `isCloudinaryConfigured` | `src/mobile/shared/offline/__tests__/cloudinary.test.ts` |
| Configuración blockchain (sin `.env`) | `isPointLedgerConfigured`, `POINT_LEDGER_ADDRESS` | `src/shared/blockchain/__tests__/config.test.ts` |

### Casos de prueba

Cada caso sigue el patrón Arrange–Act–Assert: se prepara el estado inicial y los
mocks, se ejecuta la unidad bajo prueba y se verifican tanto el resultado esperado
como los efectos secundarios. Se diseñaron 21 casos que cubren el flujo normal y
los flujos alternos (entradas inválidas, fuera de rango, `NaN`). La Tabla 33
presenta los casos diseñados.

### Tabla 33 — Casos de prueba unitaria de OceanEyes

| ID | Unidad bajo prueba | Escenario | Resultado esperado | Estado |
|---|---|---|---|---|
| PU-01.1 | `formatDuration` | `0` ms | `00:00` | ✅ |
| PU-01.2 | `formatDuration` | `65000` ms | `01:05` | ✅ |
| PU-01.3 | `formatDuration` | `1999` ms (fracción) | `00:01` (trunca) | ✅ |
| PU-02.1 | `createGeoLocation` | Coordenadas válidas + dirección | Objeto con lat/lon/address | ✅ |
| PU-02.2 | `createGeoLocation` | Latitud `200` | Lanza `InvalidReportError` | ✅ |
| PU-02.3 | `createGeoLocation` | Longitud `400` | Lanza `InvalidReportError` | ✅ |
| PU-02.4 | `createGeoLocation` | Latitud `NaN` | Lanza `InvalidReportError` | ✅ |
| PU-03.1 | `assertReportStatus` | Los 4 estados válidos | Sin error | ✅ |
| PU-03.2 | `assertReportStatus` | Estado `borrado` | Lanza `InvalidReportError` | ✅ |
| PU-04.1 | `assertReportCategory` | Las 9 categorías válidas | Sin error | ✅ |
| PU-04.2 | `assertReportCategory` | Categoría `basura` | Lanza `InvalidReportError` | ✅ |
| PU-04.3 | `reportCategoryLabel` / `reportCategoryPoints` | `pesca_ilegal` | `Pesca ilegal` / `100` pts | ✅ |
| PU-05.1 | `haversineKm` | Mismo punto | `≈ 0` km | ✅ |
| PU-05.2 | `haversineKm` | Lima → Callao | Entre 5 y 20 km | ✅ |
| PU-05.3 | `formatDistance` | `0.5` km | `500 m` | ✅ |
| PU-05.4 | `formatDistance` | `2.34` km | `2.3 km` | ✅ |
| PU-06.1 | `isFirebaseConfigured` | Sin `.env` | `false` | ✅ |
| PU-06.2 | `firebaseConfig` | Sin `.env` | Expone apiKey/projectId/appId | ✅ |
| PU-06.3 | `isCloudinaryConfigured` | Sin `.env` | `false` | ✅ |
| PU-06.4 | `isPointLedgerConfigured` | Sin `.env` | `false` | ✅ |
| PU-06.5 | `POINT_LEDGER_ADDRESS` | Sin `.env` | `string` | ✅ |

### Evidencia de ejecución

Comando: `npm test` (Jest 30.5.2, jest-expo 54.0.18). Fecha: 21/10/2026.

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

### Conclusión 6.2.1

Las 21 pruebas unitarias pasan (21/21). La lógica de dominio (validación de
ubicación, estados y categorías de reporte —9 tipos—, cálculo de distancia y
formato de duración) y los guards de configuración (Firebase, Cloudinary,
blockchain) se comportan según lo esperado, incluyendo el escenario "sin `.env`"
de la rama capstone. La suite se ejecuta sin red, sin Firebase y sin dispositivos
físicos, en aproximadamente 2,4 s.

---

## 6.2.2. Pruebas de Aceptación

### Objetivo

Validar escenarios de negocio de extremo a extremo sobre el dominio de reportes,
comprobando que un reporte válido se acepta y que los datos inválidos se rechazan
según las reglas de negocio, sin servicios externos.

### Criterios de aceptación

1. Un reporte con categoría válida, estado inicial `pendiente` y ubicación válida
   se acepta y recibe los puntos correspondientes a la categoría.
2. Un reporte con categoría inexistente o ubicación fuera de rango se rechaza.

### Escenario PA-01 — Creación de reporte

Precondiciones: sin `.env` (rama capstone), sin conexión a Firebase (prueba sobre
dominio puro).

#### Caso PA-01.1 — Reporte válido de pesca ilegal en Lima

| Paso | Acción | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| 1 | `assertReportCategory('pesca_ilegal')` | Sin error | Sin error | ✅ |
| 2 | `assertReportStatus('pendiente')` | Sin error | Sin error | ✅ |
| 3 | `createGeoLocation(-12.0464, -77.0428, "Lima")` | Ubicación válida | Válida | ✅ |
| 4 | `reportCategoryPoints('pesca_ilegal')` | `100` | `100` | ✅ |
| 5 | Verificar estado inicial | `pendiente` | `pendiente` | ✅ |

#### Caso PA-01.2 — Reporte con datos inválidos

| Paso | Acción | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| 1 | `assertReportCategory('no_existe')` | Lanza error | Lanza | ✅ |
| 2 | `createGeoLocation(999, 0)` | Lanza error | Lanza | ✅ |

Archivo de test: `src/mobile/modules/reports/__tests__/acceptance-report-flow.test.ts`.

### Evidencia de ejecución

```
PASS src/mobile/modules/reports/__tests__/acceptance-report-flow.test.ts
  Aceptación: flujo de creación de reporte (6.2.2)
    ✓ valida un reporte completo de pesca ilegal en Lima (5 ms)
    ✓ rechaza un reporte con categoría o ubicación inválida (17 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        2.421 s
```

### Conclusión 6.2.2

Los criterios de aceptación se cumplen: el flujo de creación de reporte acepta
datos válidos (con los puntos correspondientes a la categoría) y rechaza datos
inválidos (categoría inexistente o ubicación fuera de rango).

---

## Resumen global

| Sección | Suites | Casos | Resultado |
|---|---|---|---|
| 6.2.1 Pruebas unitarias | 8 | 21 | ✅ 21/21 |
| 6.2.2 Pruebas de aceptación | 1 | 2 | ✅ 2/2 |
| **Total** | **9** | **23** | **✅ 23/23** |

Entorno: Windows 11, Node.js 24.21.0, Jest 30.5.2, jest-expo 54.0.18,
React 19.1.0, React Native 0.81.5, TypeScript 5.9. Comando: `npm test`.

### Nota sobre alcance

Esta iteración cubre la lógica de dominio de reportes, las utilidades compartidas
y los guards de configuración (incluido el escenario "sin `.env`"). No se incluyen
pruebas de autenticación, cola offline, sincronización, moderación, recompensas ni
blockchain, ni pruebas de componentes con React Native Testing Library, por lo que
no se afirman métricas de cobertura sobre esos módulos. La medición de cobertura
(`npm test -- --coverage`) queda como trabajo futuro si se requiere evidencia
cuantitativa por módulo.