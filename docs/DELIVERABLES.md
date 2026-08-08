# OceanEyes — Entregables para el Jurado (Hackathon Ethereum Lima 2026)

> Resumen ejecutivo de la integración blockchain y vínculos oficiales.
> Última actualización: 7/8/2026.

---

## 1. Smart Contract desplegado

| Dato | Valor |
|------|-------|
| **Contrato** | `PointLedger.sol` — Registro auditable de puntos por reportes verificados |
| **Red** | Arbitrum Sepolia (testnet), chainId `421614` |
| **Dirección** | `0xbA7A9d6cB7581Ef28cD01c77813bA229Cb2B1509` |
| **Arbiscan (contrato)** | https://sepolia.arbiscan.io/address/0xbA7A9d6cB7581Ef28cD01c77813bA229Cb2B1509 |
| **txHash de despliegue** | `0x8af8b4d3093384d077fc47c82eea6121b3390993e7f12aacf4d339ca1cfce18d` |
| **txHash de autorización del verificador** | `0x18c529a5cb88794357338aecbc8ae24fe898df90253dc686239a73a2efabf8ca` |
| **Wallet del owner / verificador autorizado** | `0x3Cba5ABB366cE32dE4a1615348Ad7b7b72835721` |
| **Estado** | ✅ Desplegado y **verificado** en Arbiscan (Etherscan API V2) |

## 2. Funcionalidad on-chain

- Cada vez que el admin **verifica** un reporte ambiental, `verifyReport()`:
  1. Actualiza el estado en Firestore de forma atómica (`verificado` + puntos + `pointTransactions`).
  2. Llama `awardPoints(reporter, reportId, category)` al contrato con la wallet del admin (MetaMask).
  3. Guarda el `txHash` en el reporte y en la transacción de puntos.
- **Categorías → puntos**: `pesca_ilegal` = 100 · `basura_marina` = 50 · `variacion_mar` = 30.
- **Seguridad**: solo verificadores autorizados (`onlyVerifier`), idempotencia por `reportId` (no se puede otorgar dos veces el mismo reporte) y `revokePoints` para corregir reportes falsos conservando el historial inmutable.
- **Auditoría**: cualquier persona puede ver el balance de una wallet y el historial completo en Arbiscan desde la app (enlace "Ver en Arbiscan") o el panel admin ("Ver tx en Arbiscan").

## 3. Evidencia de uso (flujo real probado)

- Reporte verificado en la app → puntos on-chain acreditados al pescador → `txHash` visible en Firestore (`reports.txHash` y `pointTransactions.txHash`) → balance on-chain del pescador actualizado en su Perfil.

## 4. Links y medios (rellenar)

- [ ] **Demo URL (panel admin)**: `<pendiente — Vercel/Cloudflare Pages>`
- [ ] **Demo URL (app)**: `<pendiente — Expo / EAS>`
- [ ] **Repositorio público**: `github.com/DominidM/OceanEyesAPP`
- [ ] **Video pitch (2-3 min)**: `<link>`
- [ ] **Video demo (flujo reportar → verificar → Arbiscan)**: `<link>`
- [ ] **Pitch deck PDF**: `<link>`
- [ ] **Diagrama de arquitectura**: `docs/ARBITRUM_PLAN.md` §3

## 5. Justificación de Arbitrum (resumen)

Los puntos por reportes verificados son el incentivo central del sistema. Registrarlos on-chain en vez de solo en Firestore garantiza:

- **Auditoría pública**: patrocinadores y ONGs verifican las recompensas en Arbiscan.
- **Inmutabilidad**: el historial de puntos no puede alterarse ni borrarse.
- **Identidad descentralizada**: cada pescador vincula su wallet y su reputación queda registrada en cadena.
