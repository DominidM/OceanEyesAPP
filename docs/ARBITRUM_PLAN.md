# Plan de Integración Arbitrum — OceanEyes

> Hackathon Ethereum Lima 2026 | Blockchain: Arbitrum Sepolia (testnet)

---

## 1. Justificación: ¿Por qué Arbitrum?

**Problema real que blockchain resuelve:**

En el sistema de recompensas actual, los puntos por reportes verificados se guardan solo en Firestore (base de datos centralizada). Esto presenta 3 problemas:

1. **Falta de transparencia** — Los pescadores no pueden verificar independientemente que sus puntos existen y no fueron alterados.
2. **Centralización** — Un admin malicioso o un error en el servidor podría eliminar o modificar el historial de puntos.
3. **Sin interoperabilidad** — Los puntos no pueden transferirse ni usarse fuera de la app.

**Solución con Arbitrum:**

Cada vez que un admin verifica un reporte, los puntos se registran en un smart contract en Arbitrum. Esto garantiza:

- **Auditoría pública** — Cualquiera puede verificar el historial de puntos en Arbiscan.
- **Inmutabilidad** — Los registros on-chain no pueden borrarse ni alterarse.
- **Transparencia para patrocinadores** — ONGs y municipios pueden auditar que las recompensas se entregan correctamente.
- **Identidad descentralizada** — Los pescadores vinculan su wallet y su reputación queda registrada en la cadena.

**Elección de Arbitrum:**

- Bajo costo de gas (testnet gratuito, mainnet ~$0.01 por tx)
- Compatible con Solidity (sin aprender un lenguaje nuevo)
- Ecosistema activo y subvenciones disponibles
- Arbitrum Sepolia para hackathon (testnet)

---

## 2. Smart Contracts

### 2.1 `PointLedger.sol` — Registro de puntos

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PointLedger {
    struct Transaction {
        address reporter;
        address verifier;
        uint256 points;
        string reportCategory; // "pesca_ilegal", "basura_marina", "variacion_mar"
        string reportId;
        uint256 timestamp;
    }

    Transaction[] public transactions;
    mapping(address => uint256) public balances;

    event PointsAwarded(
        address indexed reporter,
        address indexed verifier,
        uint256 points,
        string reportId,
        uint256 timestamp
    );

    function awardPoints(
        address reporter,
        string memory reportId,
        string memory category
    ) external {
        uint256 points = getPointsForCategory(category);
        require(points > 0, "Categoria invalida");

        transactions.push(Transaction({
            reporter: reporter,
            verifier: msg.sender,
            points: points,
            reportCategory: category,
            reportId: reportId,
            timestamp: block.timestamp
        }));

        balances[reporter] += points;

        emit PointsAwarded(reporter, msg.sender, points, reportId, block.timestamp);
    }

    function getPointsForCategory(string memory category) internal pure returns (uint256) {
        if (keccak256(bytes(category)) == keccak256(bytes("pesca_ilegal"))) return 100;
        if (keccak256(bytes(category)) == keccak256(bytes("basura_marina"))) return 50;
        if (keccak256(bytes(category)) == keccak256(bytes("variacion_mar"))) return 30;
        return 0;
    }

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 index) external view returns (Transaction memory) {
        return transactions[index];
    }
}
```

### 2.2 `RewardRedemption.sol` — Canje de recompensas (opcional, bonus)

```solidity
contract RewardRedemption {
    struct Redemption {
        address user;
        uint256 pointsSpent;
        uint256 rewardId;   // ID de la recompensa en Firestore
        uint256 timestamp;
    }

    Redemption[] public redemptions;

    event RewardRedeemed(address indexed user, uint256 pointsSpent, uint256 rewardId, uint256 timestamp);

    function redeem(uint256 pointsSpent, uint256 rewardId) external {
        redemptions.push(Redemption({
            user: msg.sender,
            pointsSpent: pointsSpent,
            rewardId: rewardId,
            timestamp: block.timestamp
        }));
        emit RewardRedeemed(msg.sender, pointsSpent, rewardId, block.timestamp);
    }
}
```

---

## 3. Arquitectura de Integración

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│  App Móvil   │────▶│  Firestore    │────▶│  Panel Admin    │
│  (usuario)   │     │  (datos)      │     │  (verificador)  │
└──────────────┘     └──────┬───────┘     └────────┬────────┘
                            │                       │
                            │                 Al verificar:
                            │                 1. Guarda en Firestore
                            │                 2. Registra en Arbitrum
                            │                       │
                            ▼                       ▼
                     ┌──────────────────────────────────┐
                     │       PointLedger.sol             │
                     │     (Arbitrum Sepolia)            │
                     │                                   │
                     │  awardPoints(address, id, cat)    │
                     │  getBalance(address)              │
                     │  getTransaction(index)            │
                     └──────────────────────────────────┘
```

### Flujo completo

```
Pescador reporta → Admin verifica → Firestore guarda estado
                                         ↓
                                    ethers.js llama a:
                                    PointLedger.awardPoints()
                                         ↓
                                    txHash se guarda en:
                                    Firestore reports.txHash
                                         ↓
                                    Visible en Arbiscan
```

---

## 4. Implementación Técnica

### 4.1 Instalación

```bash
npm install ethers
```

### 4.2 Configuración (`src/mobile/shared/blockchain/config.ts`)

```ts
export const ARBITRUM_SEPOLIA = {
  chainId: 421614,
  rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
  explorer: 'https://sepolia.arbiscan.io',
};
```

### 4.3 Conexión del admin

```ts
// src/mobile/shared/blockchain/ledger.ts
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x...'; // del deploy
const ABI = [/* ABI del contrato */];

export async function awardPointsOnChain(
  reporterAddress: string,
  reportId: string,
  category: string,
  signer: ethers.Signer // admin wallet
) {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  const tx = await contract.awardPoints(reporterAddress, reportId, category);
  await tx.wait();
  return tx.hash;
}
```

### 4.4 Integración en `verifyReport()`

Modificar `src/mobile/shared/firebase/reports.ts` para que al verificar un reporte también registre en Arbitrum:

```ts
// Dentro de verifyReport():
const txHash = await awardPointsOnChain(walletAddress, reportId, category, signer);

// Guardar txHash en Firestore:
tx.update(reportRef, { txHash });
```

---

## 5. Enfoque según las reglas de la hackathon

Análisis de elegibilidad (requisitos obligatorios):

- [x] **Deploy en red compatible con Arbitrum** → Arbitrum Sepolia (testnet) o Arbitrum One (mainnet).
- [x] **≥ 1 smart contract desplegado y funcional** → `PointLedger.sol` (registro de puntos) y (opcional) `RewardRedemption.sol`.
- [x] **MVP funcional** → app móvil Expo + panel admin ya construidos (Firebase conectado).
- [x] **Documentación antes de la fecha límite** → planes + deliverables que se completan en la sección 8.
- [x] **Uso real de blockchain** → justificado en la sección 1: los puntos ***solo*** son creíbles para patrocinadores/ONGs si son auditables e inmutables en cadena. El `txHash` se persiste junto a cada reporte verificado.

> ⚠️ **Cuidado con el "uso superficial"**: la regla penaliza agregar blockchain solo por cumplir. En nuestro caso es central: la verificación de reportes PRECISA del registro on-chain para que el sistema de recompensas sea auditable. El pitch debe enfatizar esto.

**Sobre los Bounties:**

| Bounty | Stack | Relevancia para OceanEyes |
|--------|-------|---------------------------|
| **Basic** | Scaffold-ETH (Solidity) | El stack que usa el equipo. Si queremos optar por un bounty, migrar el contrato a un repo con Scaffold-ETH equivale al "Basic". |
| **Intermediate** | Scaffold-Stylus (Rust) | Requeriría reescribir el contrato en Rust (Stylus). No recomendado si el equipo domina Solidity. |
| **Advanced** | Scaffold-Stylus + IA | No aplica ahora (necesita Stylus + IA adicional). |

**Decisión**: apuntar a **premios generales** con contrato en Solidity (Hardhat/Foundry). Si sobra tiempo, NO reescribir en Rust; priorizar los entregables de la sección 8.

---

## 6. Plan de Ejecución por Fases (con checklists)

> Enfoque "vertical primero": lograr el contrato funcional + tx on-chain al DÍA 1 de integración, luego pulir el resto.

### Fase 0 — Preparación (medio día)
- [ ] Crear wallet dev (MetaMask) y fondear con ETH de Sepolia desde el faucet oficial de Arbitrum.
- [ ] Instalar fundas de trabajo: `ethers` (app) + `hardhat` (contrato).
- [ ] Definir **ruta técnica**: integrar desde el **panel admin (web)** porque ya existe `verifyReport()`. La wallet del admin vive en la web, no en el móvil (simplifica MetaMask).
- [ ] Guardar `PRIVATE_KEY` del admin y `CONTRACT_ADDRESS` en `.env` (nunca en el repo).

### Fase 1 — Contrato y deploy (día 1-2)
- [ ] Crear proyecto Hardhat (`contracts/PointLedger.sol`, `RewardRedemption.sol`).
- [ ] Compilar y testear localmente (`npx hardhat test`) — corregir el map de categorías.
- [ ] Desplegar en **Arbitrum Sepolia** con script `deploy.js` (network config con RPC `https://sepolia-rollup.arbitrum.io/rpc`, chainId `421614`).
- [ ] **Verificar el contrato en Arbiscan** (plugin `@nomicfoundation/hardhat-verify`).
- [ ] Rellenar sección 8.4 con dirección + enlace Arbiscan.

### Fase 2 — Integración ethers en `verifyReport()` (día 2-3)
- [ ] `src/mobile/shared/blockchain/config.ts` (chain + RPC + explorer).
- [ ] `src/mobile/shared/blockchain/ledger.ts`: `awardPointsOnChain()` + ABI.
- [ ] En `verifyReport()` (reports.ts): tras la transacción atómica de Firestore, si `report.userId` tiene `walletAddress`, llamar al contrato y guardar `txHash` en el reporte y en `pointTransactions`.
- [ ] **Fallback**: si no hay wallet/red, el reporte se verifica igual en Firestore pero se marca `txHash: null` (no debe romper el flujo).
- [ ] Conectar wallet del admin (MetaMask en web) en el panel → `admin-shell` añade un botón "Conectar wallet".

### Fase 3 — Captura de wallet + UI de puntos (día 3-4)
- [ ] Registrar `walletAddress` en el perfil del usuario (al registrarse / en el tab Perfil).
- [ ] Mostrar balance on-chain y link a Arbiscan por transacción (`txHash`) en la app y en el admin.
- [ ] Mostrar en el dashboard del admin el nº de reportes con `txHash` (progreso de integración blockchain).

### Fase 4 — Pulido y entregables (día 4-5)
- [ ] Completar **todos** los entregables de la sección 8.
- [ ] Revisar que el repo tiene todos los commits con fecha posterior al KickOff (31/07 4:00 p.m.).
- [ ] Eliminar cualquier dato sensible del historial del repo.

---

## 7. Repartición de Tareas (4 integrantes)

| Integrante | Responsabilidad |
|-----------|----------------|
| **Dominid** | Firestore, admin panel, dashboard, charts + integración ethers en `verifyReport()` |
| **Compañero** | Smart contracts Solidity, Hardhat, deploy + verificación en Arbiscan, entregar ABI |
| **Dev 3** | App móvil (reportes UI, cámara, geolocalización), captura de `walletAddress` en Perfil |
| **Dev 4** | Landing page, video pitch, pitch deck PDF, diagrama de arquitectura, documentación |

---

## 8. Entregables para la Hackathon (checklist de seguimiento)

### 8.1 Medios
- [ ] **Video Pitch (2-3 min)**: problema → solución → valor de Arbitrum (énfasis §5) → demo rápida.
- [ ] **Pitch Deck (PDF)**: slides con arquitectura y justificación de Arbitrum.
- [ ] **Video Demo**: flujo reportar → verificar → tx visible en Arbiscan.

### 8.2 Links
- [ ] **Demo URL** → panel admin desplegado (Vercel/Cloudflare Pages) + app Expo (EAS/APK).
- [ ] **Repositorio público** → `github.com/DominidM/OceanEyesAPP`.
- [ ] **Diagrama de arquitectura** → Excalidraw/Mermaid mostrando App ↔ Firestore ↔ Panel Admin ↔ PointLedger (Arbitrum).

### 8.3 Bloqueo de dependencias (rellenar al final)
- [ ] `ethers` instalado en `package.json`.
- [ ] Contrato verificado y lista para mostrar.

### 8.4 Datos del contrato (RELLENAR tras el deploy)
- **Contrato**: `PointLedger.sol`
- **Red**: Arbitrum Sepolia (chainId `421614`)
- **Dirección**: `0x...`
- **Arbiscan**: `https://sepolia.arbiscan.io/address/0x...`
- **txHash de prueba**: `0x...`

### 8.5 Archivo de resumen para jurado
Crear `docs/DELIVERABLES.md` con todo lo anterior (dirección de contratos, red, Arbiscan, links de demo, video y arquitectura) en un solo lugar.
