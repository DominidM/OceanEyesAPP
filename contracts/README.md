# OceanEyes Contracts

Proyecto Hardhat aislado con los smart contracts de OceanEyes para la Hackathon
Ethereum Lima 2026. Red objetivo: **Arbitrum Sepolia**.

## Contratos

| Contrato | Descripción | Estado |
|----------|-------------|--------|
| `contracts/PointLedger.sol` | Registro auditable de puntos otorgados por reportes verificados. No es un token ERC-20. | ✔ Listo (compilado y testeado) |
| `RewardRedemption.sol` | Canjes on-chain. Opcional, fase posterior. | Pendiente |

## Requisitos para Proof-Of-Stake

- Node.js ≥ 18
- npm

## Instalación

```bash
cd contracts
npm install
```

## Configuración

1. Copia `.env.example` a `.env`.
2. Completa `PRIVATE_KEY` solo cuando vayas a desplegar (Fase 2). Nunca commitees el `.env`.

## Comandos

```bash
npm run compile                 # compila los contratos
npm test                        # ejecuta las pruebas
npm run deploy:arbitrumSepolia  # despliega PointLedger (requiere .env)
```

## Red

- **Arbitrum Sepolia** — chainId `421614`
- RPC: `https://sepolia-rollup.arbitrum.io/rpc`
- Explorer: `https://sepolia.arbiscan.io`

## Seguridad de `PointLedger`

- Control de acceso mediante `Ownable` de OpenZeppelin.
- Solo verificadores autorizados por el propietario pueden otorgar puntos (`OnlyVerifier`).
- Idempotencia por `reportId` (previene doble otorgamiento).
- Rechaza `address(0)`, `reportId` vacío y categorías desconocidas.
- No almacena claves privadas. La clave del deployer vive solo en `.env` (ignorado por Git).