# Plan de Base de Datos — OceanEyes (Hackathon)

> Firestore NoSQL, Firebase Auth, Ethereum para trazabilidad de puntos.

---

## Roles

| Rol | Plataforma | Funciones |
|-----|-----------|-----------|
| **Pescador / Ciudadano** | App móvil | Registrar, reportar incidentes, ganar puntos, canjear recompensas |
| **Administrador** | Panel web | Revisar reportes, verificar/descartar, gestionar recompensas, ver estadísticas |

`role` en `users/{uid}`: `'fisher' | 'citizen'` (móvil) o `'admin'` (web).

---

## Colecciones Firestore

### 1. `users` — Perfiles de usuario

```
users/{uid}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `role` | `'fisher' \| 'citizen' \| 'admin'` | Rol |
| `displayName` | `string` | Nombre visible |
| `email` | `string` | Correo |
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
| `location` | `{ lat, lng, address? }` | Geolocalización |
| `photoURLs` | `string[]` | URLs de fotos (Storage → base64 si no usas Blaze) |
| `status` | `'pendiente' \| 'en_revision' \| 'verificado' \| 'descartado'` | Estado |
| `pointsAwarded` | `number` | Puntos otorgados (0 hasta verificar) |
| `txHash` | `string?` | Hash de transacción Ethereum (cuando se usa blockchain) |
| `isAnonymous` | `boolean` | Reporte anónimo |
| `createdAt` | `timestamp` | |
| `reviewedAt` | `timestamp?` | |
| `reviewedBy` | `string?` | Admin UID |
| `rejectionReason` | `string?` | Motivo de descarte |

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

## Integración Blockchain (Ethereum)

### Objetivo
Trazabilidad de puntos: cada vez que se otorgan puntos por un reporte verificado, se registra en un smart contract en una testnet de Ethereum (Sepolia). Esto da auditoría pública: cualquiera puede verificar que los puntos existen y no fueron inflados.

### Smart Contract (mínimo para hackathon)

```solidity
// PointLedger.sol
contract PointLedger {
    struct Transaction {
        address user;
        uint256 amount;
        string category;   // "pesca_ilegal", "basura_marina", "variacion_mar"
        uint256 timestamp;
    }

    Transaction[] public transactions;

    event PointsAwarded(address indexed user, uint256 amount, string category, uint256 timestamp);

    function awardPoints(address user, uint256 amount, string memory category) public {
        transactions.push(Transaction(user, amount, category, block.timestamp));
        emit PointsAwarded(user, amount, category, block.timestamp);
    }

    function getTotalPoints(address user) public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < transactions.length; i++) {
            if (transactions[i].user == user) total += transactions[i].amount;
        }
        return total;
    }
}
```

### Flujo

```
Usuario reporta → Admin verifica → Firestore guarda puntos
                                       ↓
                                  Se llama al smart contract (via ethers.js)
                                  awardPoints(wallet, amount, category)
                                       ↓
                                  txHash se guarda en pointTransactions y reports
```

### Cuentas
- Cada usuario tiene opcionalmente `walletAddress` en su perfil
- Para hackathon: usar MetaMask en web, o RainbowKit/WalletConnect en mobile
- Testnet: **Sepolia** (gratis, faucet disponible)

### Instalación (cuando toque)

```bash
npm install ethers @web3modal/wagmi wagmi viem
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
│           BLOCKCHAIN (Sepolia Testnet)        │
│  PointLedger.sol → registro público de puntos │
└──────────────────────────────────────────────┘
```

---

## Lo que ya tienes vs lo que falta

### Ya implementado ✓
- Firebase Auth (login/registro)
- Firestore collections: `users`, `reports`
- Subida de fotos a Storage
- Panel admin básico (revisar reportes)
- UI del móvil (tabs, formulario de reporte en 5 pasos)
- UI de recompensas (datos mock)

### Falta implementar ✗
| Tarea | Prioridad |
|-------|-----------|
| Crear colección `rewards` y `redemptions` en Firestore | Alta |
| Conectar admin dashboard a Firestore real (datos mock → queries) | Alta |
| Adaptar categorías a las 3 del hackathon | Alta |
| Registrar `pointTransactions` al verificar reportes | Alta |
| Funcionalidad de canje de recompensas (móvil) | Alta |
| `walletAddress` en perfil de usuario | Media |
| Smart contract `PointLedger.sol` + deploy en Sepolia | Media |
| Integración ethers.js para registrar puntos en blockchain | Media |
| Perfil de usuario real (no placeholder) | Baja |
