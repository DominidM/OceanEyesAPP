# PLAN DE IMPLEMENTACIÓN — INTEGRACIÓN ARBITRUM EN OCEANEYES

## 1. Objetivo

Implementar una integración funcional entre OceanEyes y Arbitrum Sepolia para registrar públicamente los puntos otorgados por reportes ambientales verificados.

La integración debe:

* Desplegar al menos un smart contract funcional en Arbitrum Sepolia.
* Registrar on-chain cada asignación de puntos.
* Impedir que un reporte reciba puntos más de una vez.
* Permitir que únicamente wallets autorizadas otorguen puntos.
* Guardar en Firestore el hash y estado de cada transacción.
* Permitir consultar la evidencia mediante Arbiscan.
* Mantener operativo el flujo administrativo cuando el usuario todavía no tenga wallet o la red falle temporalmente.

La blockchain representa el registro auditable de puntos otorgados. Firestore continúa almacenando los datos operativos de la aplicación.

---

## 2. Alcance obligatorio del MVP

Implementar completamente:

1. Contrato `PointLedger.sol`.
2. Proyecto de contratos con Hardhat.
3. Pruebas automatizadas del contrato.
4. Despliegue en Arbitrum Sepolia.
5. Verificación del contrato en Arbiscan.
6. Integración con ethers v6.
7. Conexión de MetaMask en el panel web administrativo.
8. Registro del `txHash` y estado de sincronización en Firestore.
9. Visualización del enlace a Arbiscan.
10. Documentación técnica y datos del contrato desplegado.

El contrato `RewardRedemption.sol` es opcional. No debe iniciarse hasta que el flujo obligatorio funcione de extremo a extremo.

---

## 3. Restricciones técnicas

* Mantener Expo SDK 54, React Native 0.81.5, Expo Router v6, TypeScript 5.9 y Firebase.
* Utilizar ethers v6.
* Utilizar Arbitrum Sepolia con `chainId: 421614`.
* No reestructurar módulos ajenos a la integración.
* No insertar direcciones ficticias, hashes inventados ni resultados de despliegues no ejecutados.
* No almacenar claves privadas en el frontend, Firestore o repositorio.
* MetaMask debe proporcionar el `Signer` del administrador.
* La clave privada del deployer solo puede utilizarse desde el proyecto Hardhat mediante un archivo `.env` ignorado por Git.
* La dirección y ABI del contrato sí pueden incluirse como configuración pública.
* No afirmar que los puntos son transferibles: `PointLedger` es un registro de puntos otorgados, no un token ERC-20.
* No considerar el balance on-chain como saldo disponible para canjes mientras los canjes continúen gestionándose únicamente en Firestore.

---

## 4. Fase 0 — Inspección y diseño

Antes de modificar código:

1. Examinar la estructura real del repositorio.
2. Leer:

   * `package.json`
   * `src/mobile/shared/firebase/types.ts`
   * `src/mobile/shared/firebase/reports.ts`
   * `src/admin/shared/components/admin-shell.tsx`
   * `docs/ARBITRUM_PLAN.md`
   * `docs/STATUS.md`
3. Confirmar cómo se ejecuta el panel web y desde qué componente se llama `verifyReport()`.
4. Revisar las reglas de Firestore y comprobar que un usuario no pueda modificar:

   * Sus puntos.
   * El estado blockchain de un reporte.
   * El `txHash`.
   * Las transacciones de puntos.
5. Presentar un resumen breve de los archivos que serán modificados.

No asumir que los fragmentos proporcionados coinciden exactamente con la versión actual del repositorio.

---

## 5. Fase 1 — Smart contract

Crear un proyecto Hardhat aislado, preferentemente dentro de `contracts/`.

### Requisitos de `PointLedger.sol`

El contrato debe:

* Utilizar Solidity `^0.8.20`.
* Registrar reportante, verificador, puntos, categoría, identificador del reporte y timestamp.
* Rechazar la dirección cero.
* Rechazar categorías desconocidas.
* Impedir la doble asignación para un mismo `reportId`.
* Restringir `awardPoints()` a verificadores autorizados.
* Permitir al propietario autorizar o revocar verificadores.
* Emitir eventos al:

  * Otorgar puntos.
  * Autorizar un verificador.
  * Revocar un verificador.
* Exponer funciones de consulta para:

  * Puntos totales otorgados a una dirección.
  * Estado de verificación de un reporte.
  * Cantidad de transacciones.
  * Transacción por índice.

Utilizar `Ownable` o `AccessControl` de OpenZeppelin. Una función pública sin control de acceso sería una vulnerabilidad crítica porque cualquier wallet podría generar puntos.

Para la idempotencia puede utilizarse un identificador derivado:

```solidity
bytes32 reportKey = keccak256(bytes(reportId));
```

### Pruebas mínimas

Comprobar:

1. El propietario puede autorizar un verificador.
2. Un verificador autorizado puede otorgar puntos.
3. Una wallet no autorizada no puede otorgarlos.
4. Cada categoría entrega 100, 50 o 30 puntos.
5. Una categoría inválida es rechazada.
6. La dirección cero es rechazada.
7. Un `reportId` no puede procesarse dos veces.
8. El balance acumulado es correcto.
9. Los eventos contienen los datos esperados.
10. Las funciones de consulta devuelven información correcta.

La fase termina únicamente cuando compilación y pruebas finalicen correctamente.

---

## 6. Fase 2 — Despliegue

1. Configurar Arbitrum Sepolia en Hardhat.
2. Crear `.env.example` sin secretos.
3. Confirmar que `.env` esté ignorado por Git.
4. Crear un script reproducible de despliegue.
5. Desplegar `PointLedger`.
6. Autorizar la wallet administrativa que utilizará el panel.
7. Verificar el código fuente en Arbiscan.
8. Registrar:

   * Dirección del contrato.
   * Red y chain ID.
   * Hash de despliegue.
   * Enlace de Arbiscan.
   * Wallet del deployer.
   * Wallet verificadora autorizada.

Si falta ETH de prueba, una firma de MetaMask o una clave requerida, detenerse y solicitar esa acción al usuario. Nunca simular que el despliegue se completó.

---

## 7. Fase 3 — Capa blockchain del frontend

Crear un módulo desacoplado, por ejemplo:

```text
src/shared/blockchain/
├── config.ts
├── point-ledger.abi.ts
├── wallet.ts
└── ledger.ts
```

Adaptar la ubicación a la arquitectura real del repositorio.

El módulo debe proporcionar:

* Detección de `window.ethereum`.
* Conexión y desconexión lógica de MetaMask.
* Obtención de cuenta y red activa.
* Validación de Arbitrum Sepolia.
* Solicitud de cambio de red.
* Lectura del contrato mediante `JsonRpcProvider`.
* Escritura mediante `BrowserProvider` y `Signer`.
* `awardPointsOnChain()`.
* Consulta de puntos otorgados on-chain.
* Construcción segura de enlaces a Arbiscan.
* Errores tipados y mensajes comprensibles.

No crear un `Signer` con una clave privada dentro de la aplicación.

---

## 8. Fase 4 — Consistencia Firestore–Arbitrum

No representar todos los fallos con `txHash: null`. Incorporar un estado explícito:

```ts
type BlockchainStatus =
  | 'not_applicable'
  | 'pending'
  | 'submitted'
  | 'confirmed'
  | 'failed';
```

Agregar, cuando corresponda:

* `blockchainStatus`
* `txHash`
* `blockchainError`
* `blockchainAttempts`
* `blockchainUpdatedAt`

### Flujo de verificación

1. La transacción atómica de Firestore verifica el reporte, otorga los puntos operativos y crea `pointTransactions`.
2. Si el usuario no tiene wallet:

   * Usar `blockchainStatus: 'not_applicable'`.
   * Mantener `txHash: null`.
3. Si tiene wallet:

   * Registrar `blockchainStatus: 'pending'`.
   * Solicitar la transacción mediante MetaMask.
4. Al enviarse:

   * Guardar inmediatamente el hash.
   * Cambiar a `submitted`.
5. Después de la confirmación:

   * Cambiar a `confirmed`.
6. Si la firma es rechazada o la red falla:

   * Cambiar a `failed`.
   * Conservar el reporte verificado.
   * Guardar un error sanitizado.
   * Permitir un reintento administrativo.

El reintento debe consultar primero si el `reportId` ya fue procesado en el contrato. Esto permite recuperar el sistema si la transacción fue confirmada on-chain, pero falló la actualización posterior de Firestore.

La operación debe actualizar tanto `reports` como la entrada correspondiente de `pointTransactions`.

---

## 9. Fase 5 — Interfaz administrativa

Agregar al panel:

* Botón “Conectar wallet”.
* Dirección abreviada de la cuenta conectada.
* Indicador de red correcta o incorrecta.
* Acción para cambiar a Arbitrum Sepolia.
* Confirmación antes de firmar.
* Estado visual: pendiente, enviada, confirmada o fallida.
* Enlace de la transacción a Arbiscan.
* Botón de reintento para registros fallidos.
* Desactivación de acciones mientras una operación está en curso.

No marcar una operación como confirmada solo porque MetaMask devolvió un hash; esperar al menos una confirmación de la red.

---

## 10. Fase 6 — Perfil y evidencia pública

En el perfil del usuario:

* Permitir registrar y validar una dirección Ethereum.
* Mostrar la dirección abreviada.
* Mostrar “puntos otorgados on-chain”, diferenciándolos del saldo disponible en Firestore.
* Incluir enlace al contrato o explorador.
* Informar claramente cuando el usuario aún no tiene wallet vinculada.

En el panel:

* Mostrar cantidad de reportes confirmados on-chain.
* Mostrar pendientes y fallidos.
* Permitir abrir cada evidencia en Arbiscan.

---

## 11. Fase 7 — Validación

Ejecutar:

* Pruebas del contrato.
* Pruebas de la capa blockchain con proveedor o contrato simulado.
* Pruebas del flujo sin MetaMask.
* Pruebas con red incorrecta.
* Pruebas con firma rechazada.
* Pruebas con usuario sin wallet.
* Prueba de doble verificación.
* Prueba de reintento después de fallo.
* Lint.
* TypeScript check.
* Build web.
* Prueba manual completa en Arbitrum Sepolia.

Flujo demostrable:

```text
Usuario crea reporte
→ administrador lo revisa
→ conecta MetaMask
→ verifica el reporte
→ firma la transacción
→ Arbitrum confirma
→ Firestore guarda el hash
→ la interfaz abre la evidencia en Arbiscan
```

---

## 12. Criterios de aceptación

La tarea se considera terminada cuando:

* `PointLedger.sol` compila y todas sus pruebas pasan.
* Solamente verificadores autorizados pueden otorgar puntos.
* No puede procesarse dos veces el mismo reporte.
* El contrato está desplegado y verificado en Arbitrum Sepolia.
* El panel valida wallet y red.
* Un reporte con wallet genera una transacción real.
* El hash se guarda en `reports` y `pointTransactions`.
* Un usuario sin wallet puede ser verificado sin romper el flujo.
* Los fallos quedan visibles y pueden reintentarse.
* La UI diferencia puntos on-chain del saldo operativo.
* Lint, comprobación de tipos y build finalizan sin errores.
* La documentación contiene dirección, red, Arbiscan y transacción de prueba.
* No existen claves privadas ni credenciales dentro del repositorio.

---

## 13. Entregables finales

Actualizar o crear:

* `docs/ARBITRUM_PLAN.md`
* `docs/DELIVERABLES.md`
* README del proyecto de contratos.
* `.env.example`
* Diagrama de arquitectura.
* Dirección y enlace del contrato.
* Hash de una transacción demostrativa.
* Instrucciones para reproducir pruebas y despliegue.

También deben prepararse:

* Video pitch de 2–3 minutos.
* Pitch deck en PDF.
* URL de la demo.
* Video del flujo completo.
* Repositorio público.
* Enlace al diagrama de arquitectura.

---

## 14. Orden de prioridad

1. Seguridad e idempotencia del contrato.
2. Pruebas del contrato.
3. Despliegue y verificación.
4. Flujo completo reporte–Arbitrum–Firestore.
5. Recuperación ante fallos.
6. Evidencia en la interfaz.
7. Documentación y material del pitch.
8. `RewardRedemption.sol`, solamente si todo lo anterior está terminado.

Al finalizar cada fase, informar archivos modificados, pruebas ejecutadas, resultados reales y bloqueos pendientes. No continuar ocultando errores ni declarar completada una fase que dependa de acciones externas todavía no realizadas.
