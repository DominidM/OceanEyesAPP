# Modelo de Datos Objetivo — OceanEyes (Firebase)

> Documento de referencia para el modelo de datos **objetivo** de OceanEyes.
> Incluye la captura de **audio** en los reportes y la integración con **blockchain**
> (smart contracts en Arbitrum Sepolia) para el registro auditable de puntos.
>
> - Estado real visto en Firestore (3/8/2026): `docs/ENTIDADES.md` / histórico `docs/DATABASE_PLAN.md`.
> - Plan de integración blockchain: `docs/PLANTOTAL.MD`, `docs/ARBITRUM_PLAN.md`.

---

## 1. Visión general

| Capa | Rol | Tecnología |
|------|-----|------------|
| **Fuente operativa** | Estado de la app: perfiles, reportes, recompensas, canjes, historial de puntos | Firestore (NoSQL) |
| **Archivos** | Fotos, videos y **audio** de los reportes | Firebase Storage |
| **Registro auditable** | Puntos otorgados por reportes verificados, inmutables y públicos | Smart contract `PointLedger.sol` (Arbitrum Sepolia, chainId `421614`) |

Principios de diseño:

- **Firestore manda** en lo operativo; la blockchain es un registro de auditoría, **no** la fuente del saldo disponible para canjes.
- `PointLedger` es un **ledger de puntos otorgados**, no un token ERC-20. No se afirma que los puntos son transferibles.
- Estados y enum en **español**, consistentes con la UI y el contrato (los puntos por categoría se replican en el contrato).
- Toda escritura sensible (puntos, estado del reporte, `txHash`) queda restringida a admin en las reglas.

---

## 2. Convenciones

- **IDs**: generados por Firestore (`addDoc`) salvo `users/{uid}` (UID de Auth) y `bannedDevices/{deviceHash}`.
- **Timestamps**: `Timestamp` de Firestore (`serverTimestamp()`).
- **Estados**:
  - Reporte: `pendiente | en_revision | verificado | descartado`
  - Canje: `pendiente | entregado | cancelado`
  - Usuario: `active | suspended`
  - Sincronización blockchain: `not_applicable | pending | submitted | confirmed | failed`
- **Flujo de estados del reporte**:
  - `pendiente → en_revision → verificado` (+puntos de la categoría)
  - `pendiente → en_revision → descartado` (0 puntos)
  - `verificado → descartado` (reporte resultó **falso**: reversión de puntos en Firestore + `revokePoints` on-chain)
  - Cada cambio de estado queda registrado en `reports/{id}/statusHistory` (`fromStatus`, `toStatus`, `changedBy`, `createdAt`).
- **Categorías de reporte (9)**:

| `category` | Etiqueta | Puntos |
|-----------|----------|--------|
| `pesca_ilegal` | Pesca ilegal | 100 |
| `basura_marina` | Basura en el mar u orillas | 50 |
| `variacion_mar` | Variación del mar | 30 |
| `derrame_hidrocarburos` | Derrame de hidrocarburos | 100 |
| `fauna_herida` | Fauna marina herida o varada | 60 |
| `redes_fantasmas` | Redes o aparejos abandonados | 50 |
| `embarcacion_sospechosa` | Embarcación sospechosa | 40 |
| `marea_roja` | Marea roja o cambio de color del agua | 40 |
| `otro` | Otro incidente (texto e ícono personalizados) | 30 |

> Los puntos por categoría se mantienen en Firestore (`REPORT_CATEGORIES`) y se **replican on-chain** en el contrato. Al tocar la tabla, actualizar ambos.

---

## 3. Colecciones

### 3.1 `users/{uid}` — Perfiles de usuario

| Campo | Tipo | Descripción | Estado |
|-------|------|-------------|--------|
| `role` | `'user' \| 'admin'` | Rol | actual |
| `profileType` | `'fisher' \| 'citizen'` | Tipo de perfil | actual |
| `displayName` | `string` | Nombre visible | actual |
| `email` | `string` | Correo | actual |
| `dni` | `string?` | DNI (8 dígitos) | actual |
| `phone` | `string?` | Teléfono | actual |
| `walletAddress` | `string?` | Dirección Ethereum (checksummed) | actual (types.ts) |
| `pointsBalance` | `number` | Puntos disponibles (default 0) | actual |
| `totalPointsEarned` | `number` | Puntos totales ganados | actual |
| `pointsOnChain` | `number?` | Puntos otorgados on-chain (informativo) | **objetivo** |
| `verifiedReportsCount` | `number` | Reportes verificados | actual |
| `status` | `'active' \| 'suspended'` | Estado | actual |
| `banReason` | `string?` | Motivo de suspensión | actual |
| `bannedBy` | `string?` | Admin que suspendió | actual |
| `bannedAt` | `timestamp?` | Fecha de suspensión | actual |
| `deviceHash` | `string?` | Huella de dispositivo (anti-baneo) | actual |
| `createdAt` | `timestamp` | Alta | actual |
| `updatedAt` | `timestamp` | Última actualización | actual |

> `walletAddress` se valida al registrarse/editar (checksum EIP-55). La blockchain **no** se usa para login; es solo vinculación para recibir puntos on-chain.

---

### 3.2 `reports/{reportId}` — Reportes/Denuncias

| Campo | Tipo | Descripción | Estado |
|-------|------|-------------|--------|
| `userId` | `string` | UID del reportante | actual |
| `category` | `ReportCategory` | Una de las 9 categorías | actual (ampliado) |
| `title` | `string` | Título (para `otro`, el texto personalizado) | actual |
| `description` | `string?` | Descripción detallada | actual |
| `isAnonymous` | `boolean` | Reporte anónimo | actual |
| `deviceHash` | `string?` | Huella de dispositivo | actual |
| `location` | `{ latitude: number, longitude: number, address?: string }` | Geolocalización | actual |
| `photoURLs` | `string[]` | URLs de fotos **y videos** (Storage) | actual |
| `customIcon` | `string?` | Clave del ícono elegido cuando `category === 'otro'` | **nuevo** |
| `audioURL` | `string?` | URL del audio en Storage (`.m4a`) | **nuevo** |
| `audioDurationMillis` | `number?` | Duración del audio en ms | **nuevo** |
| `status` | `'pendiente' \| 'en_revision' \| 'verificado' \| 'descartado'` | Estado | actual |
| `pointsAwarded` | `number` | Puntos otorgados = puntos de la categoría al verificar (hoy el código escribe `0`; ver §9) | actual (a corregir) |
| `evidenceHash` | `string?` | Hash (SHA-256) del contenido del reporte, anclado on-chain | **nuevo** |
| `blockchainStatus` | `BlockchainStatus` | Estado de la transacción on-chain | **nuevo** |
| `txHash` | `string?` | Hash de la transacción en Arbitrum | **nuevo** |
| `blockchainError` | `string?` | Error sanitizado si falló la tx | **nuevo** |
| `blockchainAttempts` | `number?` | Reintentos administrativos | **nuevo** |
| `blockchainUpdatedAt` | `timestamp?` | Última actualización del estado on-chain | **nuevo** |
| `createdAt` | `timestamp` | Creación | actual |
| `submittedAt` | `timestamp` | Envío | actual |
| `reviewedAt` | `timestamp?` | Revisión | actual |
| `reviewedBy` | `string?` | Admin que revisó | actual |
| `rejectionReason` | `string?` | Motivo de descarte | actual |

> `photoURLs` almacena hoy fotos y videos en el mismo arreglo. Se mantiene así; el audio se guarda aparte en `audioURL` (1 por reporte).

> **Subcolección `statusHistory`**: `reports/{reportId}/statusHistory` registra cada cambio de estado
> (`fromStatus`, `toStatus`, `changedBy`, `createdAt`). La escribe el panel admin; es **real** (no aspiracional).

#### Reporte falso (reversión en Firestore)

Cuando un reporte **verificado** resulta falso y el panel lo pasa a `descartado` (objetivo, ver §6.4):

1. `reports/{id}`: `status: 'descartado'`, `pointsAwarded: 0`, `reviewedAt`, `reviewedBy`, `rejectionReason`.
2. `pointTransactions`: movimiento **negativo** (`type: 'report_verified'`, `amount: -puntos`).
3. `users/{uid}`: `pointsBalance -= puntos`, `totalPointsEarned -= puntos`.
4. `statusHistory`: `verificado → descartado`.
5. On-chain: el owner llama `revokePoints(reportId)`.

#### Bloque blockchain

```ts
type BlockchainStatus =
  | 'not_applicable' // el usuario no tiene wallet
  | 'pending'        // se pedirá firma (MetaMask) o se está preparando
  | 'submitted'      // tx enviada a la red (hay hash)
  | 'confirmed'      // confirmada on-chain
  | 'failed';        // falló; el reporte sigue verificado en Firestore
```

---

### 3.3 `rewards/{rewardId}` — Catálogo de recompensas

| Campo | Tipo | Descripción | Estado |
|-------|------|-------------|--------|
| `title` | `string` | Nombre | actual |
| `description` | `string` | Detalle | actual |
| `pointsCost` | `number` | Puntos necesarios | actual |
| `stock` | `number \| null` | Disponibilidad (`null` = ilimitado) | actual |
| `active` | `boolean` | Disponible para canje | actual |
| `sponsor` | `string?` | Patrocinador | actual |
| `imageURL` | `string?` | Imagen | actual |
| `createdAt` | `timestamp` | Alta | actual |
| `updatedAt` | `timestamp?` | Última actualización | actual |

---

### 3.4 `redemptions/{redemptionId}` — Canjes de recompensas

| Campo | Tipo | Descripción | Estado |
|-------|------|-------------|--------|
| `userId` | `string` | UID del usuario | actual |
| `rewardId` | `string` | ID de recompensa | actual |
| `pointsSpent` | `number` | Puntos gastados | actual |
| `status` | `'pendiente' \| 'entregado' \| 'cancelado'` | Estado | actual |
| `claimedAt` | `timestamp` | Fecha de canje | actual |
| `deliveredAt` | `timestamp?` | Fecha de entrega | actual |
| `txHash` | `string?` | Tx on-chain del canje (si se usa `RewardRedemption.sol`) | **objetivo (opcional)** |

---

### 3.5 `pointTransactions/{txId}` — Historial de movimientos de puntos

| Campo | Tipo | Descripción | Estado |
|-------|------|-------------|--------|
| `userId` | `string` | Usuario | actual |
| `type` | `'report_verified' \| 'redemption' \| 'bonus'` | Tipo de movimiento | actual |
| `amount` | `number` | Positivo (ganancia) o negativo (canje) | actual |
| `reportId` | `string?` | Reporte origen | actual |
| `rewardId` | `string?` | Recompensa (canje) | actual |
| `balanceBefore` | `number` | Saldo previo | actual |
| `balanceAfter` | `number` | Saldo posterior | actual |
| `blockchainStatus` | `BlockchainStatus` | Estado de la tx on-chain | **nuevo** |
| `txHash` | `string?` | Hash de la tx en Arbitrum | **nuevo** |
| `blockchainError` | `string?` | Error sanitizado | **nuevo** |
| `blockchainAttempts` | `number?` | Reintentos | **nuevo** |
| `blockchainUpdatedAt` | `timestamp?` | Última actualización | **nuevo** |
| `createdAt` | `timestamp` | Fecha | actual |

> El `blockchainStatus` se mantiene **sincronizado** entre `reports` y su `pointTransactions` (misma operación de actualización).

---

### 3.6 `bannedDevices/{deviceHash}` — Dispositivos baneados

| Campo | Tipo | Descripción | Estado |
|-------|------|-------------|--------|
| `reason` | `string?` | Motivo | actual |
| `bannedBy` | `string?` | Admin | actual |
| `bannedAt` | `timestamp` | Fecha | actual |

---

## 4. Storage y audio

Estructura de rutas en Firebase Storage:

```
reports/{reportId}/{mediaId}.{ext}   # foto (.jpg/.png/...) o video (.mp4/...)
reports/{reportId}/{mediaId}.m4a     # audio (AAC), 1 por reporte
```

Reglas para `audio/*` (`storage.rules`):

```
match /reports/{reportId}/{fileName} {
  allow read: if request.auth != null
    && (firestore.get(/databases/(default)/documents/reports/$(reportId)).data.userId == request.auth.uid
      || request.auth.token.admin == true);
  allow write: if request.auth != null
    && firestore.get(/databases/(default)/documents/reports/$(reportId)).data.userId == request.auth.uid
    && request.resource.size < 20 * 1024 * 1024
    && request.resource.contentType.matches('image/.*|video/.*|audio/.*');
}
```

Configuración del audio:

- **Formato**: `.m4a` (AAC), calidad media-baja (~64–96 kbps).
- **Tamaño máximo**: 10 MB por archivo.
- **Cantidad**: 1 audio por reporte (se sobrescribe al regrabar).
- **Al subir**, se guardan `audioURL` y `audioDurationMillis` en el documento del reporte (misma transacción que `photoURLs`).

---

## 5. Offline / outbox

La cola local (AsyncStorage, key `@oceaneyes/outbox/v1`) ya serializa `ReportInput` completo:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ID local |
| `input` | `ReportInput` | Datos del reporte (incluye `customIcon`, `audioURL` tras subir) |
| `media` | `PendingMedia[]` | `{ localUri, kind }` con `kind: 'photo' \| 'video' \| 'audio'` |
| `remoteId` | `string?` | ID remoto una vez publicado |
| `createdAt` / `updatedAt` | `number` | Timestamps locales |
| `attempts` | `number` | Reintentos |
| `state` | `'queued' \| 'uploading' \| 'retrying' \| 'stuck'` | Estado |
| `lastError` | `string?` | Último error |

El audio se gestiona igual que una foto: se "stagea" al encolar y se sube a `reports/{reportId}/{mediaId}.m4a` al publicar.

---

## 6. Integración Blockchain (Arbitrum Sepolia)

### 6.1 Contrato `PointLedger.sol`

Estado real (compilado y testeado en `contracts/`, 22 tests) + ajustes objetivo:

- Solidity `^0.8.20`, hereda `Ownable` de OpenZeppelin.
- `Transaction`: `reporter`, `verifier`, `points`, `category`, `reportId`, `timestamp` — **solo esto on-chain**
  (regla de oro: nunca `deviceHash`, datos personales ni estados de suspensión).
- `awardPoints(reporter, reportId, category)`:
  - `onlyVerifier` (wallet autorizada por el owner).
  - Rechaza `ZeroReporter`, `EmptyReportId`, `UnknownCategory` (puntos == 0) y `AlreadyProcessed`.
  - Idempotencia por `bytes32 reportKey = keccak256(bytes(reportId))`.
- **`revokePoints(reportId)`** — para reportes que resultaron **falsos**:
  - `onlyOwner` (más restrictivo que otorgar).
  - Rechaza `NotProcessed` y `AlreadyRevoked`.
  - Resta del balance on-chain y marca `isReportRevoked`.
  - El historial `transactions[]` **permanece intacto** (ledger inmutable); el reporte revocado no puede volver a otorgarse.
- Eventos: `PointsAwarded`, `VerifierAuthorized`, `VerifierRevoked`, `PointsRevoked`.
- Consultas: `getBalance`, `isReportProcessed`, `isReportRevoked`, `getTransactionCount`, `getTransaction`.
- **Desync**: `pointsForCategory()` hoy solo reconoce 3 categorías (`pesca_ilegal` 100, `basura_marina` 50,
  `variacion_mar` 30). Objetivo: replicar **las 9** con los mismos puntos que Firestore (`REPORT_CATEGORIES`).
  Hasta hacerlo, `awardPoints` con una categoría nueva hace `revert UnknownCategory`.

### 6.2 Flujo de verificación canónico (panel admin = única ruta que otorga puntos)

Hoy existen **tres rutas de verificación contradictorias** (§9); el modelo objetivo las unifica
en **una sola**: la moderación desde el panel admin. La transacción atómica de Firestore y la
firma on-chain son operaciones **separadas**: la primera nunca falla por red o wallet; la
segunda registra el estado en los 5 campos blockchain.

```
Admin (panel web) verifica reporte
  → Transacción atómica Firestore (implementar en changeStatus('verificado') del panel):
       reports: status='verificado', pointsAwarded = puntos de la categoría
       users: pointsBalance += pts, totalPointsEarned += pts, verifiedReportsCount += 1
       pointTransactions: type 'report_verified', amount +pts (balanceBefore/balanceAfter)
       statusHistory: <estado_anterior> → 'verificado'
  → ¿el reportante tiene walletAddress?
       no  → blockchainStatus: 'not_applicable'
       sí  → blockchainStatus: 'pending'
  → Admin conecta MetaMask (Arbitrum Sepolia) y firma
       awardPointsOnChain(reporterAddress, reportId, category)   // onlyVerifier
  → Se guarda txHash de inmediato → 'submitted'
  → Tras confirmación de red → 'confirmed'
  → Si falla → 'failed' (se conserva el reporte verificado, se permite reintento)
```

- El **reintento** consulta primero `isReportProcessed(reportId)` en el contrato (recuperación si la tx confirmó on-chain pero falló la actualización de Firestore).
- `verifyReport()` en `src/mobile/shared/firebase/reports.ts` (sin llamadores) y la Cloud Function en `functions/src/index.ts` quedan **deprecadas**; el punto de verdad es el panel admin.
- `evidenceHash`: hash SHA-256 del contenido del reporte (metadatos + URLs de media/audio) opcionalmente pasado al contrato como ancla de evidencia; se guarda en `reports.evidenceHash`.
- El móvil **no** necesita wallet; solo vincula `users.walletAddress` (registro/perfil).
- Fallback: sin wallet o con red caída, el flujo administrativo sigue operando (`not_applicable` / `failed`).
- `blockchainStatus` usa el enum de 5 estados; **nunca** `'not_started'` (valor ajeno al enum, escrito hoy por la Cloud Function).

### 6.3 Puntos on-chain vs saldo operativo

| Concepto | Fuente | Uso |
|----------|--------|-----|
| Saldo disponible para canjes | `users.pointsBalance` (Firestore) | Canjes, UI |
| Puntos otorgados on-chain | `PointLedger.balances` | Auditoría pública, perfil ("puntos on-chain") |

No mezclar: el canje se sigue gestionando **solo en Firestore** mientras `RewardRedemption.sol` no esté activo.

### 6.4 Reporte falso (revocación on-chain + reversión en Firestore)

Objetivo del flujo completo cuando un reporte verificado resulta falso. Hoy solo existen el
`revokePoints` del contrato y el botón "Banear dispositivo" del panel; la **reversión en
Firestore** y el **wiring** de `revokePoints` al panel están pendientes de implementar.

```
Admin detecta reporte falso
  → Panel: mover reporte 'verificado' → 'descartado' (habilitar en moderación)
  → Firestore (transacción atómica):
       reports: status='descartado', pointsAwarded=0, reviewedAt/reviewedBy/rejectionReason
       pointTransactions: type 'report_verified', amount -puntos
       users: pointsBalance -= pts, totalPointsEarned -= pts
       statusHistory: 'verificado' → 'descartado'
  → On-chain: el owner llama revokePoints(reportId) (MetaMask)
       isReportRevoked(reportId) = true; balance on-chain restado; historial intacto
  → Verificación: el panel consulta isReportRevoked(reportId) (sin campos nuevos en Firestore)
  → Opcional: ban de dispositivo (bannedDevices) y/o suspensión (users.status='suspended')
```

- La revocación on-chain es una **acción manual del administrador/owner** (más restrictiva que
  otorgar). Los bans/suspensiones viven **off-chain** (regla de oro, §6.1).
- Un reporte revocado no puede volver a otorgarse (`processedReports` persiste en el contrato).

---

## 7. Índices compuestos requeridos

Firestore exige índices compuestos para combinaciones `where` + `orderBy`:

| Colección | Campos | Uso |
|-----------|--------|-----|
| `reports` | `userId` ASC, `createdAt` DESC | Mis reportes |
| `reports` | `status` ASC, `createdAt` DESC | Moderación admin |
| `reports` | `category` ASC, `createdAt` DESC | Filtros por categoría |
| `pointTransactions` | `userId` ASC, `createdAt` DESC | Historial de puntos |
| `redemptions` | `userId` ASC, `claimedAt` DESC | Mis canjes |
| `rewards` | `active` ASC, `pointsCost` ASC | Catálogo activo |

> Si se agrega filtrado por `location` en el mapa, evaluar un índice geo (geohash) en lugar de consultas por rango de lat/lng.

---

## 8. Reglas de seguridad (objetivo)

Correcciones sobre `firestore.rules` actual:

1. **Estados en español**: `status == 'verified'` → `'verificado'`. El campo `visibility`/`public` no existe hoy; si no se implementa, eliminar esa condición (o definirla explícitamente).
2. **Colección `rewardRedemptions`** → `redemptions` (la real).
3. **Admin**: decidir una sola fuente. Recomendado: helper `isAdmin()` leyendo `users/{request.auth.uid}.role == 'admin'` desde Firestore (no depende del custom claim, que hoy no se emite). Si se implementan custom claims, documentarlo.
4. **Bloquear campos sensibles** para el usuario (solo admin puede escribir):
   - `users`: `pointsBalance`, `totalPointsEarned`, `verifiedReportsCount`, `walletAddress` validada, `status`, campos de ban.
   - `reports`: `status`, `pointsAwarded`, `blockchainStatus`, `txHash`, `blockchainError`, `blockchainAttempts`, `blockchainUpdatedAt`, `evidenceHash`.
   - `pointTransactions`: escritura solo admin.
5. **Subcolección `private`** (en las reglas, sin uso en el código): retirarla. **`statusHistory`** sí la escribe el panel admin (real): mantenerla con `allow write: if isAdmin()` y `allow read: admin o dueño del reporte`.

> ⚠️ La Cloud Function en `functions/src/index.ts` usa otro esquema en inglés (`illegal_fishing`, `status: 'verified'`, `pointTransactions/{id}-verified`, `blockchainStatus: 'not_started'`) y **no dispara** con el código real (estados en español). Está desincronizada: alinear al esquema de este documento o **deprecarla** en favor del flujo de verificación del panel admin (§6.2).

---

## 9. Desincronizaciones pendientes de corregir

| Área | Estado actual | Objetivo |
|------|---------------|----------|
| **Verificación** | Tres rutas contradictorias: `verifyReport()` móvil (sin llamadores), `changeStatus()` del panel (no otorga puntos) y Cloud Function inglesa (no dispara) | Unificar en el panel admin: verificar otorga puntos + `statusHistory` (§6.2) |
| `pointsAwarded` | Se escribe `0` siempre (campo muerto) | Al verificar, `= puntos de la categoría`; al descartar un verificado, `0` + reversión (§3.2) |
| `statusHistory` | La escribe el panel admin; ausente en DATABASE_PLAN | Subcolección real documentada (§3.2, §8) |
| `BlockchainStatus` | La Cloud Function escribe `'not_started'` (fuera del enum) | Solo `not_applicable \| pending \| submitted \| confirmed \| failed` |
| `firestore.rules` | Esquema en inglés + campos/subcolecciones aspiracionales + admin por custom claim no emitido | Esquema de este documento, admin por Firestore o claims, bloquear campos blockchain |
| `functions/src/index.ts` | Trigger con esquema en inglés desactualizado | Alinear al esquema objetivo o deprecar |
| `storage.rules` | Solo `image/*|video/*` | Añadir `audio/*` |
| `PointLedger.pointsForCategory()` | Solo 3 categorías (pesca/basura/variacion) | Replicar las 9 (idénticas a Firestore) |
| Móvil (audio) | Se graba pero no se sube | Subir a Storage y guardar `audioURL` + `audioDurationMillis` (online y offline) |
| `docs/STATUS.md` | Documenta 3 categorías y sin `verificado → descartado` | Actualizar a 9 categorías y flujo completo |

---

## 10. Glosario

| Término | Definición |
|---------|-----------|
| `BlockchainStatus` | `not_applicable \| pending \| submitted \| confirmed \| failed` |
| `evidenceHash` | SHA-256 del contenido del reporte anclado on-chain |
| `PointLedger` | Contrato de registro de puntos otorgados (Arbitrum Sepolia) |
| `reportKey` | `keccak256(reportId)`; clave idempotente de un reporte en el contrato |
| `revokePoints` | Función del contrato (solo owner) que revoca el award de un reporte falso |
| `isReportRevoked` | Consulta on-chain: indica si el award de un reporte fue revocado |
| `statusHistory` | Subcolección `reports/{id}/statusHistory` con el historial de estados |
| `RewardRedemption` | Contrato opcional de canjes on-chain |
| `walletAddress` | Dirección Ethereum vinculada al perfil (EIP-55) |
