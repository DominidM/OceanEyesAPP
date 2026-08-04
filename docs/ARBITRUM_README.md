# README para Modelo de IA — Implementación Arbitrum en OceanEyes

> Documento autónomo de contexto para que otro modelo de IA (agente) implemente la integración de Arbitrum en el proyecto OceanEyes. Incluye todo el contexto necesario: estado actual, reglas de la hackathon, código real de los puntos de integración y pasos concretos.

---

## 1. ¿Qué es OceanEyes?

App de **vigilancia ciudadana del mar** para la **Hackathon Ethereum Lima 2026** (kickoff: 31 julio 2026, 4:00 p.m.).

- **App móvil** (Expo/React Native): los pescadores/ciudadanos reportan pesca ilegal, basura marina o variación del mar.
- **Panel admin** (web): modera los reportes. Al verificar uno, **otorga puntos de recompensa** al reportante.
- **Recompensas**: los puntos se canjean por premios (bonos de combustible, kits, etc.).

**Stack**: Expo SDK 54 · React Native 0.81.5 · Expo Router v6 · TypeScript 5.9 · Firebase (Auth + Firestore + Storage).

**Repositorio**: `github.com/DominidM/OceanEyesAPP` (rama `main`).

---

## 2. ¿Por qué Arbitrum? (justificación obligatoria)

Las reglas **penalizan el uso superficial de blockchain** y exigen justificar por qué aporta valor real. Nuestra justificación:

> El sistema de recompensas guarda puntos solo en Firestore (centralizado). Un admin malicioso o un error podría alterar o borrar el historial. Al registrar cada punto en un smart contract en Arbitrum se logra **auditoría pública** (cualquiera lo verifica en Arbiscan), **inmutabilidad** y **transparencia para patrocinadores** (ONGs y municipios pueden auditar que las recompensas se entregaron correctamente).

**Blockchain es central, no decorativo**: la credibilidad del sistema de puntos depende de su registro on-chain. El `txHash` se persiste junto a cada reporte verificado.

**Por qué Arbitrum**: bajo costo de gas (testnet gratis), compatible con Solidity, ecosistema activo. Usamos **Arbitrum Sepolia** (testnet, chainId `421614`).

---

## 3. Reglas relevantes de la hackathon

Requisitos de elegibilidad (premios generales):

1. Deploy en red compatible con Arbitrum (Arbitrum One, Arbitrum Sepolia u otra).
2. Al menos **1 smart contract desplegado y funcional**.
3. **MVP funcional** que demuestre el caso de uso.
4. Toda la documentación solicitada antes de la fecha límite.
5. Equipos de hasta 4 integrantes.

**Uso real de blockchain**: prohibido el uso superficial. Debe demostrarse que la interacción con la red es parte esencial del funcionamiento.

**Elegibilidad**: primer commit desde el 31 de julio 4:00 p.m. Se permite reutilizar proyectos previos si el trabajo durante la hackathon es una mejora sustancial y verificable. El jurado puede pedir evidencia (commits, historial, demos intermedias).

**Bounties (opcionales)**: Basic (Scaffold-ETH/Solidity), Intermediate (Scaffold-Stylus/Rust), Advanced (Stylus + IA).

**Entregables**: Video Pitch (2-3 min), Pitch Deck PDF, Link Demo, Video Demo, Repositorio Público, Datos de cada contrato (dirección, red, enlace Arbiscan), Link Arquitectura (Excalidraw/Figma/Mermaid).

---

## 4. Estado actual del proyecto (importante para no romper nada)

### 4.1 Firestore (proyecto `oceaneyes-5e7b4`, región `southamerica-east1`)

Colecciones: `users`, `reports`, `rewards`, `redemptions`, `pointTransactions`.

**Categorías y puntos** (definidos en `src/mobile/shared/firebase/types.ts`):

| `category` | Puntos |
|-----------|:---:|
| `pesca_ilegal` | 100 |
| `basura_marina` | 50 |
| `variacion_mar` | 30 |

**Flujo de estados de reporte**: `pendiente → en_revision → verificado (+pts) / descartado (0 pts)`.

### 4.2 Campos relacionados con blockchain (ya definidos)

- `users.walletAddress?: string` — dirección Ethereum del usuario.
- `reports.txHash?: string` — hash de la tx on-chain.
- `pointTransactions.txHash?: string` — hash de la tx on-chain.

### 4.3 Punto de integración EXACTO

`verifyReport(reportId, adminUid)` en `src/mobile/shared/firebase/reports.ts`. Código real actual (líneas 131-169):

```ts
export async function verifyReport(reportId: string, adminUid: string): Promise<void> {
  const reportRef = doc(firestore, 'reports', reportId);

  await runTransaction(firestore, async (tx) => {
    const snap = await tx.get(reportRef);
    if (!snap.exists()) throw new Error('Reporte no encontrado.');

    const report = snap.data() as Report;
    const categoryPoints = REPORT_CATEGORIES[report.category]?.points ?? 0;
    const userRef = doc(firestore, 'users', report.userId);
    const userSnap = await tx.get(userRef);
    const user = userSnap.data() as { pointsBalance: number; totalPointsEarned: number; verifiedReportsCount: number };

    tx.update(reportRef, {
      status: 'verificado',
      pointsAwarded: categoryPoints,
      reviewedAt: serverTimestamp(),
      reviewedBy: adminUid,
    });

    const newBalance = (user.pointsBalance ?? 0) + categoryPoints;
    tx.update(userRef, {
      pointsBalance: increment(categoryPoints),
      totalPointsEarned: increment(categoryPoints),
      verifiedReportsCount: increment(1),
    });

    const txRef = doc(collection(firestore, 'pointTransactions'));
    tx.set(txRef, {
      userId: report.userId,
      type: 'report_verified',
      amount: categoryPoints,
      reportId,
      balanceBefore: user.pointsBalance ?? 0,
      balanceAfter: newBalance,
      createdAt: serverTimestamp(),
    });
  });
}
```

**Integración requerida**: después de la transacción atómica de Firestore, si `report.userId` tiene `walletAddress`, llamar `awardPoints()` en el contrato y guardar el `txHash` resultante en `reports` y `pointTransactions`. No debe romper el flujo si no hay wallet (fallback con `txHash: null`).

### 4.4 Dependencias instaladas

- `firebase@^12.17.0` instalado.
- `ethers` **NO instalado** aún.
- Usa `react-native-svg`, `expo-router`, etc. (no relevantes para esta integración).

---

## 5. Smart contracts

### 5.1 `PointLedger.sol` (obligatorio)

Registra puntos por reporte verificado. Ver el código en `docs/ARBITRUM_PLAN.md` §2.1. Funciones clave:

- `awardPoints(address reporter, string memory reportId, string memory category)` — `external`, el `msg.sender` es el verifier (admin).
- `getBalance(address user) external view returns (uint256)`
- `getTransaction(uint256 index) external view returns (Transaction memory)`

Evento: `PointsAwarded(reporter, verifier, points, reportId, timestamp)`.

**Requisito funcional**: no debe permitir doble verificación del mismo `reportId` (agregar `mapping(string => bool) public verifiedReports` con `require(!verifiedReports[reportId], "Ya verificado")`).

### 5.2 `RewardRedemption.sol` (opcional, bonus)

Registra canjes de recompensa. Ver `docs/ARBITRUM_PLAN.md` §2.2.

---

## 6. Pasos de implementación (orden recomendado)

### Paso 1 — Setup del contrato (Hardhat)
```bash
mkdir contracts && cd contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init  # crear proyecto empty
```
Escribir `contracts/PointLedger.sol` y `contracts/RewardRedemption.sol` (basado en el plan). Compilar: `npx hardhat compile`.

Configurar red en `hardhat.config.js`:
```js
networks: {
  arbitrumSepolia: {
    url: 'https://sepolia-rollup.arbitrum.io/rpc',
    chainId: 421614,
    accounts: [process.env.PRIVATE_KEY],
  },
}
```

### Paso 2 — Test local
Escribir tests con `@nomicfoundation/hardhat-toolbox` (awardPoints, getBalance, doble verificación rechazada, categoría inválida rechazada). Ejecutar `npx hardhat test`.

### Paso 3 — Deploy en Arbitrum Sepolia
```bash
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```
Fondear la wallet dev con ETH de Sepolia desde un faucet antes de desplegar.

### Paso 4 — Verificar en Arbiscan
Con plugin `@nomicfoundation/hardhat-verify`:
```bash
npx hardhat verify --network arbitrumSepolia CONTRACT_ADDRESS
```
Guardar dirección + enlace `https://sepolia.arbiscan.io/address/CONTRACT_ADDRESS`.

### Paso 5 — Integrar en la app (ethers v6)
```bash
npm install ethers
```
Crear `src/mobile/shared/blockchain/config.ts`:
```ts
export const ARBITRUM_SEPOLIA = {
  chainId: 421614,
  rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
  explorer: 'https://sepolia.arbiscan.io',
};
export const POINT_LEDGER_ADDRESS = '0x...'; // del deploy
```

Crear `src/mobile/shared/blockchain/ledger.ts` con `awardPointsOnChain()` (usa `ethers.Contract` + signer del admin). El **ABI** lo entrega el compañero tras compilar.

### Paso 6 — Modificar `verifyReport()`
Tras la transacción de Firestore, llamar al contrato si hay `walletAddress`, guardar `txHash` en el reporte y la transacción. Fallback sin wallet.

### Paso 7 — Conectar wallet del admin (web)
En el panel admin (`src/admin/shared/components/admin-shell.tsx`) añadir botón "Conectar wallet" (MetaMask / `window.ethereum` con ethers `BrowserProvider`). En web funciona directo; en móvil usar WalletConnect si se requiere.

### Paso 8 — UI de puntos on-chain
- Tab Perfil (móvil): mostrar `walletAddress` + balance on-chain + link Arbiscan.
- Dashboard admin: contador de reportes con `txHash` (progreso blockchain).

---

## 7. Configuración de red (datos técnicos)

| Propiedad | Valor |
|-----------|-------|
| Red | Arbitrum Sepolia |
| Chain ID | `421614` |
| RPC | `https://sepolia-rollup.arbitrum.io/rpc` |
| Explorer | `https://sepolia.arbiscan.io` |
| Native token | ETH (faucet de Sepolia) |
| Gas | Bajo (testnet gratuita) |

---

## 8. Seguridad y reglas del código

- **NUNCA** commitear `PRIVATE_KEY`. Usar `.env` (gitignored) y `process.env`/`expo-constants` para la app.
- No romper el flujo existente: la verificación en Firestore ya funciona; la llamada on-chain debe ser un refuerzo con fallback seguro.
- No agregar comentarios de más al código; seguir el estilo existente (TypeScript, sin comentarios).
- Correr `npm run lint` tras los cambios.

---

## 9. Entregables de esta tarea (definición de "done")

- [ ] `PointLedger.sol` compilado y con tests pasando.
- [ ] Desplegado en Arbitrum Sepolia, verificado en Arbiscan.
- [ ] Dirección + enlace Arbiscan anotados en `docs/ARBITRUM_PLAN.md` §8.4.
- [ ] `ethers` instalado y `ledger.ts` creado.
- [ ] `verifyReport()` llama al contrato y guarda `txHash`.
- [ ] Admin puede conectar wallet (MetaMask en web).
- [ ] `npm run lint` sin errores.

---

## 10. Referencias internas

- Plan completo (contratos, arquitectura, flujo): `docs/ARBITRUM_PLAN.md`
- Estado del proyecto: `docs/STATUS.md`
- Tipos Firestore: `src/mobile/shared/firebase/types.ts`
- Reportes (punto de integración): `src/mobile/shared/firebase/reports.ts`
- Admin shell: `src/admin/shared/components/admin-shell.tsx`
