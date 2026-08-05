# ⚠️ DEPRECADO — OceanEyes Implementación Stylus (Rust)

> **Este documento ya NO refleja la decisión del equipo. Se conserva solo como historial.**

## Decisión vigente

El equipo apuntará a los **premios generales** con contratos en **Solidity** (Hardhat/Foundry)
y **ethers.js**, no al bounty Advanced con Scaffold-Stylus (Rust).

Ver el plan activo:

- **`docs/ARBITRUM_PLAN.md`** — contrato `PointLedger.sol`, fases de implementación y entregables.
- **`docs/ARBITRUM_README.md`** — brief autónomo para un modelo de IA.

## Motivo

- `cargo-stylus` no compila en la laptop del equipo (sin Docker/WSL2, sin SDK MSVC).
- El stack actual del equipo es **Solidity/TypeScript**; reescribir en Rust (Stylus) añade
  riesgo sin beneficio para los premios generales.
- Se prioriza el MVP + integración funcional en Arbitrum Sepolia sobre el bounty Advanced.

## Qué contenía este archivo

Una propuesta diferida para el **bounty Advanced (Scaffold-Stylus + IA)**: contratos
`OceanToken` (ERC-20) y `OceanRegistry` en Rust/WASM, AI validator vía OpenRouter y
frontend Scaffold-Stylus (Next.js). No fue implementada.