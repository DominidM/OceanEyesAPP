# Plan de Base de Datos — OceanEyes (Hackathon)

> Firestore NoSQL, Firebase Auth, Arbitrum (Sepolia) para trazabilidad de puntos.

---

## Roles

| Rol | Plataforma | Funciones |
|-----|-----------|-----------|
| **Pescador / Ciudadano** | App móvil | Registrar, reportar incidentes, ganar puntos, canjear recompensas |
| **Administrador** | Panel web | Revisar reportes, verificar/descartar, gestionar recompensas, ver estadísticas |

`role` en `users/{uid}`: `'user'` (móvil, asignado en registro) o `'admin'` (asignado por `seedAdminAndTestData()`). El tipo de perfil se guarda en `profileType`: `'fisher' | 'citizen'`. Los usuarios admin de prueba: `admin@oceaneyes.com` / `admin123`.

---

## Colecciones Firestore

### 1. `users` — Perfiles de usuario

```
users/{uid}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `role` | `'user' \| 'admin'` | Rol |
| `profileType` | `'fisher' \| 'citizen'` | Tipo de perfil |
| `displayName` | `string` | Nombre visible |
| `email` | `string` | Correo |
| `phone` | `string?` | Teléfono |
| `walletAddress` | `string?` | Dirección Ethereum (opcional, para blockchain) |
| `pointsBalance` | `number` | Puntos disponibles (default 0) |
| `totalPointsEarned` | `number` | Puntos totales ganados |
| `verifiedReportsCount` | `number` | Reportes verificados |
| `status` | `'active' \| 'suspended'` | Estado |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

---

### 2. `reports` — Reportes/Denuncias

```
reports/{reportId}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | `string` | UID del reportante |
| `category` | `'pesca_ilegal' \| 'basura_marina' \| 'variacion_mar'` | Tipo de incidente |
| `title` | `string` | Título |
| `description` | `string?` | Descripción detallada |
| `location` | `{ latitude, longitude, address? }` | Geolocalización |
| `photoURLs` | `string[]` | URLs de fotos (Storage) |
| `status` | `'pendiente' \| 'en_revision' \| 'verificado' \| 'descartado'` | Estado |
| `pointsAwarded` | `number` | Puntos otorgados (0 hasta verificar) |
| `txHash` | `string?` | Hash de transacción Ethereum (cuando se usa blockchain) |
| `isAnonymous` | `boolean` | Reporte anónimo |
| `createdAt` | `timestamp` | |
| `reviewedAt` | `timestamp?` | |
| `reviewedBy` | `string?` | Admin UID |
| `rejectionReason` | `string?` | Motivo de descarte |
| `submittedAt` | `timestamp` | Fecha de envío |

### Categorías de reporte (las 3 del hackathon)

| `category` | Etiqueta | Puntos |
|-----------|----------|--------|
| `pesca_ilegal` | Pesca ilegal | 100 |
| `basura_marina` | Basura en el mar u orillas | 50 |
| `variacion_mar` | Variación del mar (corrientes, temperatura, marea) | 30 |

---

### 3. `rewards` — Catálogo de recompensas

```
rewards/{rewardId}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `title` | `string` | "Bono de combustible", "Equipo de seguridad" |
| `description` | `string` | Detalle de la recompensa |
| `pointsCost` | `number` | Puntos necesarios |
| `stock` | `number \| null` | Cantidad disponible (null = ilimitado) |
| `active` | `boolean` | Disponible para canje |
| `sponsor` | `string?` | Patrocinador (ONG, municipio, etc.) |
| `imageURL` | `string?` | Imagen |
| `createdAt` | `timestamp` | |

---

### 4. `redemptions` — Canjes de recompensas

```
redemptions/{redemptionId}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | `string` | UID del usuario |
| `rewardId` | `string` | ID de recompensa |
| `pointsSpent` | `number` | Puntos gastados |
| `status` | `'pendiente' \| 'entregado' \| 'cancelado'` | |
| `claimedAt` | `timestamp` | |
| `deliveredAt` | `timestamp?` | |

---

### 5. `pointTransactions` — Historial de puntos

```
pointTransactions/{txId}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | `string` | |
| `type` | `'report_verified' \| 'redemption' \| 'bonus'` | Tipo de movimiento |
| `amount` | `number` | Positivo (ganancia) o negativo (canje) |
| `reportId` | `string?` | Si viene de un reporte |
| `rewardId` | `string?` | Si es canje de recompensa |
| `balanceBefore` | `number` | |
| `balanceAfter` | `number` | |
| `txHash` | `string?` | Transacción Ethereum (cuando se registra en blockchain) |
| `createdAt` | `timestamp` | |

---

## Integración Blockchain (Arbitrum)

> ⚠️ Plan actualizado. El contrato, la justificación y los pasos de implementación viven ahora en **`docs/ARBITRUM_PLAN.md`** (deploy en **Arbitrum Sepolia**, contrato `PointLedger.sol`, ethers v6). Esta sección queda como referencia histórica.

### Objetivo
Trazabilidad de puntos: cada vez que se otorgan puntos por un reporte verificado, se registra en un smart contract en Arbitrum Sepolia. Esto da auditoría pública: cualquiera puede verificar que los puntos existen y no fueron inflados.

### Flujo

```
Usuario reporta → Admin verifica → Firestore guarda puntos
                                       ↓
                                  Se llama al smart contract (via ethers.js)
                                  awardPoints(wallet, category)
                                       ↓
                                  txHash se guarda en pointTransactions y reports
```

### Cuentas
- Cada usuario tiene opcionalmente `walletAddress` en su perfil
- Para hackathon: conectar wallet del admin en el panel web (MetaMask) — el móvil no necesita wallet
- Red: **Arbitrum Sepolia** (testnet, chainId `421614`, faucet disponible)

### Instalación (pendiente)

```bash
npm install ethers
```

---

## Arquitectura de la App con el Plan

```
┌──────────────────────────────────────────────┐
│                  APP MÓVIL                    │
│  Registro → Login → Reportar → Ver puntos     │
│                      ↓                        │
│              Canjear recompensas              │
└────────────────────┬─────────────────────────┘
                     │ Firebase Auth + Firestore
                     │
┌────────────────────┴─────────────────────────┐
│              PANEL ADMIN WEB                  │
│  Ver reportes → Revisar → Verificar/Descartar │
│  Gestionar recompensas → Ver estadísticas     │
└────────────────────┬─────────────────────────┘
                     │ ethers.js
                     │
┌────────────────────┴─────────────────────────┐
│           BLOCKCHAIN (Arbitrum Sepolia)        │
│  PointLedger.sol → registro público de puntos │
└──────────────────────────────────────────────┘
```

---

## Estado actual (visto el 4/8/2026)

> Para el estado vivo y completo ver `docs/STATUS.md`. Este archivo es el plan histórico de datos.

### Ya implementado ✓
- Firebase Auth (login/registro)
- Firestore collections: `users`, `reports`, `rewards`, `redemptions`, `pointTransactions`
- Subida de fotos a Storage + modo offline (cola en AsyncStorage)
- Panel admin: dashboard conectado a Firestore con charts, moderación de reportes, listado de usuarios
- UI del móvil (tabs, wizard de reporte en 5 pasos, recompensas, perfil)
- `seedRewards()` + `seedAdminAndTestData()`

### Falta implementar ✗ (blockchain)
| Tarea | Prioridad |
|-------|-----------|
| Smart contract `PointLedger.sol` + deploy en Arbitrum Sepolia | Alta |
| Integración ethers.js para registrar puntos on-chain + guardar `txHash` | Alta |
| Botón "Conectar wallet" en el admin (MetaMask) | Media |
| `walletAddress` en perfil de usuario | Media |
| Verificación del contrato en Arbiscan | Media |

> Pasos detallados: `docs/ARBITRUM_PLAN.md`.
