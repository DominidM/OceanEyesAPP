# OceanEyes — Implementación Blockchain + IA (Advanced Bounty)

Documento de implementación diferida. Detalla entorno, fases, comandos exactos y checklist de verificación. Ejecutar preferentemente con la PC con Docker a mano.

## 1. Contexto

- **App**: OceanEyes — reportes ciudadanos de incidentes marítimos/ambientales (Expo, ya funcional).
- **Objetivo**: integrar blockchain + IA al MVP, apuntando al **bounty Advanced (Scaffold-Stylus + IA)**.
- **Reglas**: red Arbitrum-compatible, ≥1 smart contract funcional, MVP demo, docs; **no uso superficial de blockchain** (el contrato debe aportar utilidad real).

## 2. Arquitectura

```
┌─ App Expo (móvil, ciudadano) ── viem ──→ Stylus Contracts ──┐
│                                          (Arbitrum Sepolia)  │
│   └─ fetch AI API ──→ Scaffold-Stylus Next.js (AI + admin) ─┘
```

- **Contratos Stylus (Rust→WASM)** en Arbitrum Sepolia:
  - `OceanToken` (ERC-20 `$OCEAN`): recompensas on-chain.
  - `OceanRegistry`: registro inmutable de reportes + reputación de reporteros.
- **Frontend Scaffold-Stylus (Next.js)**: panel de autoridad/demo + AI validator (API route).
- **App Expo (móvil)**: interfaz ciudadana; conecta vía `viem`; llama al AI validator antes de registrar.
- **IA**: OpenRouter (`openai/gpt-4o`).
- **BD/almacenamiento**: Firebase (ver sección 2.1).

### 2.1 Rol de Firebase (BD)

Firebase **no es problema**, con una regla de oro: **la blockchain es la fuente de verdad de lo core** (registro de reportes, reputación, recompensas); Firebase complementa:

- **Firebase Storage** → guarda las imágenes/evidencia. En cadena solo va el `evidenceHash` (keccak de la imagen) → integridad probatoria sin subir datos pesados ni crudos.
- **Firestore** → índice/caché off-chain para lecturas rápidas del dashboard (el contrato sigue siendo la verdad: si difieren, gana la cadena).
- **Cola local** de reportes pendientes (offline) antes del envío on-chain.

⚠️ Si la blockchain solo duplicara lo que ya está en Firebase, el jurado marcaría "uso superficial" → perder utilidad real. El registro/reputación/recompensas viven **en cadena**.

### 2.2 Arquitectura de datos (dónde vive cada dato)

**El criterio del jurado**: blockchain es "uso superficial" si borrar la cadena no cambia nada en la app (p. ej. un hash decorativo que nadie consulta ni verifica). La prueba real: *¿puede un admin con acceso a la BD borrar un reporte, inflar puntos o cambiar un estado sin dejar rastro?* Si puede, la cadena no aporta valor.

| Dato | Dónde | Por qué |
|---|---|---|
| Reporte (id, tipo, estado, timestamp, reporter) | **On-chain** (OceanRegistry) | Core: inmutable, anti-fraude |
| Reputación del reportero | **On-chain** | Nadie la edita, es verificable |
| Balance de `$OCEAN` | **On-chain** (OceanToken) | Token ERC-20 real |
| Imagen de evidencia | **Firebase Storage** | Pesada, no cabe en una tx |
| Hash de la imagen (`evidenceHash`) | **On-chain** | Ancla la imagen a la cadena |
| Hash de la ubicación (`locationHash`) | **On-chain** | Privacidad: coordenadas crudas nunca suben |
| Copia legible para el dashboard | **Firestore** | Lecturas rápidas (UX) — **no es la verdad** |

**Flujo completo de un reporte (quién escribe dónde)**

1. Ciudadano captura la foto → se sube a **Firebase Storage** → se obtiene una URL.
2. La app calcula `keccak256(foto)` → `evidenceHash`.
3. La app llama al **AI validator** (OpenRouter) → confirma que es evidencia real.
4. La app firma una **tx** `createReport(evidenceHash, locationHash, incidentType)` con viem → **aquí nace el reporte, en la cadena**.
5. (Opcional) Firestore indexa una copia del reporte para que el dashboard cargue rápido.
6. La autoridad verifica → **tx** `verifyReport(id)` → en cadena: status=Verified + `reputation++` + `OceanToken.mint()`.
7. El dashboard lee Firestore (rápido) **o** la cadena directamente; Firestore se mantiene sincronizado **escuchando los eventos del contrato**.

Regla: toda acción que **cambia estado** (crear, verificar, resolver, recompensar) es una transacción on-chain. Firebase solo almacena evidencia pesada y sirve lecturas.

**Resolución de conflictos (fuente de verdad)**: la app siempre confía en la cadena.
- Alguien altera Firestore y marca un reporte "verificado" sin tx → al consultar el contrato, el status sigue `Pending`. Firestore es solo una proyección.
- Al revés no se puede: un admin con acceso a Firebase **no puede borrar** un reporte de la cadena (inmutabilidad).

**Resumen**: la cadena es el *libro de contabilidad* (reporte, reputación, recompensa); Firebase es el *sistema de archivos y caché* (imágenes, lecturas rápidas). Firebase nunca es dueño de los puntos — solo puede mostrarlos.

**Anti-patrón a evitar**: `rewards.ts` tiene `POINTS_BALANCE = '1,240'` hardcodeado. Dejarlo así y solo "subir un hash por si acaso" es superficial. Lo correcto: esos 1,240 puntos **son** el saldo real de `OceanToken.balanceOf(cuenta)` leído de la cadena, y canjear/recompensar son tx. Si la demo funciona escribiendo 0 transacciones → es superficial.

## 3. Máquinas y entorno

### Laptop (sin Docker, sin WSL2) — la actual
- **NO compilar cargo-stylus nativo**: MSVC exige Windows SDK (no instalado, sin admin); toolchain GNU falla en `k256/syn/serde_json` (no resuelto).
- Solo Node, Yarn, Expo, Next.js. **Nunca Rust/Docker.**
- Estado ya instalado (2026-08-03): Node v22.12.0 · Yarn 1.22.22 global · rustup toolchains msvc+gnu (1.97.1) · target `wasm32-unknown-unknown` en gnu · MSYS2 `C:\msys64` (gcc 16.1, cmake 4.4.2, nasm 3.02).

### PC (con Docker → implica WSL2)
- Ejecuta **todo** el toolchain Stylus: imagen oficial `offchainlabs/stylus-sdk-rs` (Rust + cargo-stylus + wasm preinstalados) o WSL2 nativo (`rustup` + `cargo install cargo-stylus --locked` + `rustup target add wasm32-unknown-unknown`).
- Docker habilita `cargo stylus check` y `yarn chain` (devnode Nitro local) para testear antes de Sepolia.

### Sincronización
- Git (recomendado). Los artefactos de contrato (WASM, ABI, direcciones) son archivos → commit.

## 4. Fase 0 — Setup en la PC

```bash
git clone <repo> && cd <repo>
npx create-stylus@latest          # crea oceaneyes-stylus/
cd oceaneyes-stylus && yarn install
# packages/nextjs/scaffold.config.ts → targetNetworks: [arbitrumSepolia]
# .env: RPC_URL_SEPOLIA, PRIVATE_KEY_SEPOLIA, ACCOUNT_ADDRESS_SEPOLIA, OPENROUTER_API_KEY
docker pull offchainlabs/stylus-sdk-rs   # o toolchain nativo en WSL2
# opcional, requiere Docker:
yarn chain    # devnode local; luego yarn deploy para probar contratos localmente
```

Requisitos scaffold: Node ≥ 20.18, Yarn v2+, Docker, Foundry/Cast, Solc.

## 5. Fase 1 — Contratos Stylus (Rust)

Estructura: `packages/stylus/contracts/<name>/src/lib.rs`

### 5.1 `OceanToken` (ERC-20)
- Referencia: `docs.arbitrum.io/stylus-by-example/applications/erc20`.
- Storage: balances (map), allowance (map), totalSupply, name/symbol/decimals, owner.
- Métodos: `mint(address,uint256)` **onlyOwner** · `balanceOf` · `transfer` · `approve` · `transferFrom` · `allowance` · `totalSupply` · `decimals` · `symbol` · `name`.
- Eventos: `Transfer`, `Approval`.

### 5.2 `OceanRegistry`
- Struct `Incident`: `id`, `reporter`, `evidenceHash(bytes32)`, `locationHash(bytes32)`, `incidentType(u8)`, `status(u8)`, `timestamp(uint64)`, `reward(uint256)`.
- `status`: 0=Pending · 1=Verified · 2=Resolved · 3=False.
- Storage: incidents (map+contador), reputation (map), authority, token (address).
- Métodos:
  - `createReport(evidenceHash, locationHash, incidentType)` → `reportId` · evento `ReportCreated`.
  - `verifyReport(id)` **onlyAuthority** → status=Verified, `reputation[reporter]++`, cross-contract `OceanToken.mint(reporter, reward)` vía `stylus_sdk::contract::call`.
  - `resolveReport(id)` / `markFalse(id)` **onlyAuthority** (markFalse penaliza reputación).
  - `getReputation(address)` · `getReport(id)` · `getAllReports()`.
- Constructor recibe address de `OceanToken`.
- Eventos: `ReportCreated`, `ReportVerified`, `ReportResolved`, `ReportMarkedFalse`, `ReputationUpdated`.

### 5.3 Build & test (PC)
```bash
cargo build --target wasm32-unknown-unknown --release
cargo stylus check              # requiere Docker
cargo test
cargo stylus export-abi         # JSON ABI para frontends
```

## 6. Fase 2 — AI Validator (Next.js)

`packages/nextjs/app/api/validate-image/route.ts`
- `POST` con imagen base64 (`image/png`).
- Prompt: *"¿Esta imagen muestra evidencia de un incidente marítimo o ambiental? (derrame, contaminación, pesca ilegal, embarcación siniestrada, fauna en peligro, desechos marinos)"*.
- Llamada: `POST https://openrouter.ai/api/v1/chat/completions`, model `openai/gpt-4o`, header `Authorization: Bearer $OPENROUTER_API_KEY`.
- Retorna: `{ isValid, confidence, description, categories[] }`.
- Consumido por: frontend Scaffold-Stylus y app Expo (`handleSend`).

## 7. Fase 3 — Frontend Scaffold-Stylus (Next.js)

`packages/nextjs/app/`:
- **Home**: dashboard de incidentes (tabla: id, tipo, reporter, status, timestamp).
- **Create Report**: subir imagen → AI validation → `createReport` tx.
- **Authority Panel**: `verifyReport`/`resolveReport`/`markFalse` (solo wallet autorizada).
- **Leaderboard**: top reporteros por reputación + balance `OceanToken`.
- RainbowKit para conectar wallet; hooks wagmi generados desde la ABI.
- `yarn build` sin errores.

## 8. Fase 4 — Integración Expo Móvil

- Instalar `viem`. Red `arbitrumSepolia`; **cuenta demo** (financiar con faucet) — sin WalletConnect en MVP.
- Archivos a tocar:
  - `src/mobile/modules/rewards/presentation/data/rewards.ts` → reemplazar `POINTS_BALANCE '1,240'` y `LEVEL_BADGE 'Nivel 3 Pescador'` por `balanceOf(cuenta)` real (con fallback mock offline).
  - `src/mobile/modules/rewards/presentation/components/points-card.tsx` → lectura viem.
  - `src/mobile/modules/rewards/presentation/sections/rewards-section.tsx` → canjear/gastar `$OCEAN` (mock o tx).
  - `src/mobile/modules/reports/presentation/screens/report-create-screen.tsx` → `handleSend`: (1) fetch AI API, (2) si `isValid` → `createReport` viem, (3) éxito: txHash + link Arbiscan + "Tu ID de reportero"; offline → cola local.
  - `src/mobile/modules/reports/presentation/sections/summary-step.tsx` → fila "Registrado en Arbitrum" con txHash.
  - `src/mobile/modules/profile/presentation/sections/profile-section.tsx` → placeholder "Proximamente" → address + nivel (reputación on-chain).
  - `src/mobile/modules/reports/presentation/incident-types.ts` → mapear `incidentType` 0-5 on-chain.
- Verificar: `npx tsc --noEmit`, `eslint`, `npx expo export --platform ios` y `--platform web`.

## 9. Fase 5 — Deploy a Arbitrum Sepolia

### Desde la PC (flujo oficial)
```bash
yarn deploy --network arbitrumSepolia   # o: cargo stylus deploy
```
- **Orden**: `OceanToken` primero, luego `OceanRegistry` (pasa address del token).
- Verificar en Arbiscan: `cargo stylus verify` o `npx hardhat verify`.

### Alternativa desde el laptop (sin cargo-stylus)
- Script Node/viem que envía WASM + constructor calldata al precompile **`ArbDeploy` `0x0000...0072`** (mismo mecanismo interno de cargo-stylus).

### Post-deploy
- Registrar las direcciones en un constants file compartido por los frontends.

## 10. Documentación
- `AGENTS.md`: agregar las reglas del hackathon.
- README del proyecto: justificación de valor de Arbitrum/Stylus (sección 2).

## 11. Verificación final (checklist)
- [ ] Expo: `npx tsc --noEmit` 0 · `eslint` 0 · `expo export --platform ios` 0 · `--platform web` 0
- [ ] Rust (PC): build wasm OK · `cargo stylus check` OK · `cargo test` OK
- [ ] Next.js: `yarn build` 0
- [ ] Deploy Sepolia OK + verificado en Arbiscan
- [ ] Demo: reporte móvil → IA valida → aparece en dashboard → autoridad verifica → reportero gana `$OCEAN`

## 12. Bloqueos / notas conocidas
- `cargo-stylus` no compila nativo en el laptop (sin Docker/WSL2, sin SDK MSVC, GNU falla) → **usar la PC con Docker**.
- `cargo stylus check` y `yarn chain` requieren Docker → solo PC.
- No hay binarios precompilados de cargo-stylus (releases de GitHub vacíos).
- Se necesita `OPENROUTER_API_KEY` (el usuario tiene acceso a OpenRouter).
- La cuenta de deploy necesita test ETH de faucet para gas.
- Si solo se edita en el laptop sin PC a mano, el bloqueo es: **compilar/desplegar contratos**. Todo lo demás (frontend, Expo, AI) se puede avanzar en el laptop.
