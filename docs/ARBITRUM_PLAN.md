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

## 5. Entregables para la Hackathon

| Entregable | Detalle |
|-----------|---------|
| **Video Pitch** (2-3 min) | Problema, solución, demo, valor de Arbitrum |
| **Pitch Deck** (PDF) | Slides de presentación |
| **Demo URL** | `http://oceaneyes.app` (Vercel/Cloudflare Pages) |
| **Video Demo** | Grabación mostrando funcionalidades |
| **Repositorio** | `github.com/DominidM/OceanEyesAPP` |
| **Smart Contract** | `0x...` en Arbitrum Sepolia |
| **Arbiscan** | Enlace al contrato verificado |
| **Arquitectura** | Diagrama Excalidraw/Mermaid |

---

## 6. Repartición de Tareas (4 integrantes)

| Integrante | Responsabilidad |
|-----------|----------------|
| **Dominid** | Firestore, admin panel, dashboard, charts |
| **Dev 2** | Smart contract Solidity, deploy en Sepolia, ethers.js |
| **Dev 3** | App móvil (reportes UI, cámara, geolocalización) |
| **Dev 4** | Landing page, video pitch, documentación, diseño |

---

## 7. Próximos Pasos

- [ ] Instalar ethers.js
- [ ] Escribir `PointLedger.sol` y compilar con Hardhat/Foundry
- [ ] Deploy en Arbitrum Sepolia
- [ ] Verificar contrato en Arbiscan
- [ ] Integrar ethers.js en `verifyReport()`
- [ ] Conectar wallet del admin (MetaMask en web)
- [ ] Agregar campo `walletAddress` al registro de usuarios
- [ ] Probar flujo completo: reportar → verificar → tx on-chain
