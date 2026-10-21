# OceanEyes — Pruebas (Sección 6.2)

Este directorio documenta y evidencia las pruebas del proyecto OceanEyes para el
capítulo **6.2** del informe (capstone UPN).

## Estructura

- `6.2.1-pruebas-unitarias/` — Pruebas unitarias (Jest) sobre la lógica de dominio y
  configuración.
- `6.2.2-pruebas-aceptacion/` — Pruebas de aceptación (escenarios end-to-end sobre
  el dominio).
- `performance/` — Reservado para pruebas de rendimiento (pendiente).

## Resumen de ejecución

| Sección | Suites | Casos | Resultado |
|---------|--------|-------|-----------|
| 6.2.1 Pruebas unitarias | 8 | 21 | ✅ 21/21 |
| 6.2.2 Pruebas de aceptación | 1 | 2 | ✅ 2/2 |
| **Total** | **9** | **23** | **✅ 23/23** |

## Comando de ejecución

```bash
npm test            # ejecuta toda la suite
npm run test:watch  # modo watch
```

## Entorno de ejecución

| Dato | Valor |
|------|-------|
| Fecha | 21/10/2026 |
| SO | Windows 11 |
| Node.js | v24.21.0 |
| Jest | 30.5.2 |
| jest-expo | 54.0.18 |
| React | 19.1.0 |
| React Native | 0.81.5 |
| @testing-library/react-native | 14.1.0 |
| react-test-renderer | 19.1.0 |

## Evidencia

- `6.2.1-pruebas-unitarias/evidencias/resultados.md`
- `6.2.2-pruebas-aceptacion/evidencias/resultados.md`

Los casos se ejecutan sobre código real del repositorio (`src/`). Los tests se
encuentran en `src/**/__tests__/` y se ejecutan con Jest + jest-expo.