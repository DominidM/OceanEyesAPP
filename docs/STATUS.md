# OceanEyes — Estado Actual del Proyecto

> Documento generado para la hackathon. Última actualización: 4/8/2026.

---

## 1. Arquitectura General

```
src/
├── app/                       # Expo Router (file-based routing)
│   ├── _layout.tsx             # Root: ThemeProvider + AuthProvider
│   ├── index.tsx               # Web → Landing | Native → /mobile
│   ├── (landing)/              # Landing web: descargas, faq, contacto (+ api/contact+api.ts)
│   ├── mobile/
│   │   ├── _layout.tsx         # Splash + fonts + Stack
│   │   ├── index.tsx           # → HomeScreen (tabs)
│   │   ├── login.tsx           # → MobileLoginScreen
│   │   ├── report.tsx          # → ReportCreateScreen (wizard 5 pasos)
│   │   └── map.tsx             # → MapScreen (mapa en tiempo real)
│   └── admin/
│       ├── _layout.tsx         # Web-only guard + auth
│       ├── index.tsx           # → DashboardScreen
│       ├── login.tsx           # → AdminLoginScreen
│       ├── reports.tsx         # → ReportsScreen (moderación)
│       └── users.tsx           # → UsersScreen (gestión)
│
├── mobile/                     # App móvil (@/*)
│   ├── constants/theme.ts      # Colores, fuentes, espaciado
│   ├── hooks/useAppFonts.ts    # Carga Inter + Playfair Display
│   ├── shared/
│   │   ├── components/         # AppSymbol, BottomTabBar, PhoneFrame, SectionHeader
│   │   ├── config/main-tabs.ts # Tabs: inicio, reportes, recompensas, perfil
│   │   ├── utils/shadows.ts    # Sombras cross-platform
│   │   ├── offline/            # Cola offline: outbox, sync-engine, media, connectivity
│   │   └── firebase/
│   │       ├── config.ts       # Firebase config (env vars)
│   │       ├── app.ts          # Inicialización Firestore, Storage, Auth
│   │       ├── auth.ts         # registerUser, loginWithEmail, logout
│   │       ├── auth-context.tsx # AuthProvider + useAuth hook
│   │       ├── reports.ts      # createReport, getMyReports, getAllReports, verifyReport
│   │       ├── rewards.ts      # getAllRewards, redeemReward, getUserRedemptions
│   │       ├── seed.ts         # seedRewards() + seedAdminAndTestData()
│   │       └── types.ts        # Todos los tipos de Firestore
│   └── modules/
│       ├── auth/               # Login móvil (mobile-login-screen.tsx)
│       ├── home/               # Tab Inicio (HomeScreen, PhoneFrame, ActionCards, mapa)
│       ├── reports/            # Tab Reportes + wizard 5 pasos
│       ├── rewards/            # Tab Recompensas (PointsCard, RewardItem)
│       └── profile/            # Tab Perfil (placeholder)
│
├── admin/                      # Panel web (@admin/*)
│   ├── shared/
│   │   ├── components/admin-shell.tsx  # Sidebar + topbar + breadcrumb + tema + logout
│   │   ├── components/charts/          # BarChart, DonutChart (SVG)
│   │   ├── config/admin-nav.ts         # Nav: Dashboard, Reportes, Usuarios, Recompensas
│   │   ├── theme/                      # context.tsx (light/dark) + colors.ts
│   │   └── ui/index.tsx                # Card, SectionTitle, Badge, Button, KpiStat
│   └── modules/
│       ├── auth/               # AdminLoginScreen
│       ├── dashboard/          # DashboardCharts (Firestore real) + RecentReportsSection
│       ├── reports/            # ReportsScreen (moderación de reportes)
│       └── users/              # UsersScreen (listado paginado)
│
├── landing/                    # Landing page web (@landing/*)
│   └── presentation/
│       ├── screens/landing-screen.tsx
│       └── sections/          # Hero, Features, Download, Footer
│
└── shared/styles/              # CSS global (fuentes, variables)
```

### Aliases de TypeScript

| Alias | Resuelve |
|-------|----------|
| `@/*` | `src/mobile/*` |
| `@admin/*` | `src/admin/*` |
| `@landing/*` | `src/landing/*` |

---

## 2. Rutas

| Ruta | Plataforma | Vista |
|------|-----------|-------|
| `/` | Web | Landing page |
| `/` | Native | Redirect → `/mobile` |
| `/descargas`, `/faq`, `/contacto` | Web | Landing sections |
| `/mobile` | Mobile | HomeScreen (4 tabs) |
| `/mobile/report` | Mobile | Wizard de reporte (5 pasos) |
| `/mobile/login` | Mobile | Login / Registro |
| `/mobile/map` | Mobile | Mapa en tiempo real |
| `/admin` | Web | Dashboard admin |
| `/admin/login` | Web | Login admin |
| `/admin/reports` | Web | Moderación de reportes |
| `/admin/users` | Web | Gestión de usuarios |

---

## 3. Firebase — Base de Datos (Firestore)

Proyecto: **`oceaneyes-5e7b4`** | Región: `southamerica-east1` (São Paulo) | Plan: Spark (gratuito)

### 3.1 Colección: `users`

```
users/{uid}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `role` | `'fisher' \| 'citizen' \| 'admin'` | Rol del usuario |
| `profileType` | `'fisher' \| 'citizen'` | Tipo de perfil |
| `displayName` | `string?` | Nombre visible |
| `email` | `string` | Correo electrónico |
| `phone` | `string?` | Teléfono |
| `walletAddress` | `string?` | Dirección Ethereum (para blockchain) |
| `pointsBalance` | `number` | Puntos disponibles |
| `totalPointsEarned` | `number` | Total histórico de puntos |
| `verifiedReportsCount` | `number` | Reportes verificados |
| `status` | `'active' \| 'suspended'` | Estado de la cuenta |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

### 3.2 Colección: `reports`

```
reports/{reportId}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | `string` | UID del reportante |
| `category` | `'pesca_ilegal' \| 'basura_marina' \| 'variacion_mar'` | Tipo de incidente |
| `title` | `string` | Título del reporte |
| `description` | `string?` | Descripción detallada |
| `isAnonymous` | `boolean` | Reporte anónimo |
| `location` | `{ latitude, longitude, address? }?` | Geolocalización |
| `photoURLs` | `string[]` | URLs de fotos |
| `status` | `'pendiente' \| 'en_revision' \| 'verificado' \| 'descartado'` | Estado |
| `pointsAwarded` | `number` | Puntos otorgados |
| `txHash` | `string?` | Hash de transacción Ethereum |
| `createdAt` | `timestamp` | |
| `submittedAt` | `timestamp` | |
| `reviewedAt` | `timestamp?` | |
| `reviewedBy` | `string?` | Admin UID |
| `rejectionReason` | `string?` | |

### Categorías y puntos

| `category` | Etiqueta | Puntos | Ícono |
|-----------|----------|:---:|-------|
| `pesca_ilegal` | Pesca ilegal | 100 | `fish.fill` / `phishing` |
| `basura_marina` | Basura en el mar u orillas | 50 | `trash.fill` / `delete` |
| `variacion_mar` | Variación del mar | 30 | `water.waves` / `waves` |

### Flujo de estados

```
pendiente → en_revision → verificado   (+100/50/30 pts)
                         → descartado   (sin puntos)
```

### 3.3 Colección: `rewards`

```
rewards/{rewardId}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `title` | `string` | Nombre de la recompensa |
| `description` | `string` | Detalle |
| `pointsCost` | `number` | Puntos necesarios |
| `stock` | `number \| null` | Cantidad (null = ilimitado) |
| `active` | `boolean` | Disponible para canje |
| `sponsor` | `string?` | Patrocinador |
| `imageURL` | `string?` | Imagen |
| `createdAt` | `timestamp` | |

**Recompensas semilla** (`seedRewards()`):

| Recompensa | Puntos | Stock |
|-----------|:---:|:---:|
| Bono de combustible (S/ 50) | 200 | 20 |
| Red de pesca ecológica | 500 | 10 |
| Kit de limpieza costera | 150 | 30 |
| Curso de pesca responsable | 300 | ∞ |
| Boyas inteligentes con GPS | 1000 | 5 |

### 3.4 Colección: `redemptions`

```
redemptions/{redemptionId}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | `string` | |
| `rewardId` | `string` | |
| `pointsSpent` | `number` | Puntos gastados |
| `status` | `'pendiente' \| 'entregado' \| 'cancelado'` | |
| `claimedAt` | `timestamp` | |
| `deliveredAt` | `timestamp?` | |

### 3.5 Colección: `pointTransactions`

```
pointTransactions/{txId}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `userId` | `string` | |
| `type` | `'report_verified' \| 'redemption' \| 'bonus'` | |
| `amount` | `number` | Positivo (ganancia) o negativo (canje) |
| `reportId` | `string?` | |
| `rewardId` | `string?` | |
| `balanceBefore` | `number` | |
| `balanceAfter` | `number` | |
| `txHash` | `string?` | Transacción Ethereum |
| `createdAt` | `timestamp` | |

---

## 4. Funciones Firebase Disponibles

### Auth

```ts
registerUser({ email, password, displayName, profileType })
loginWithEmail(email, password)
logout()
getUserProfile(uid)
updateUserProfile(uid, changes)
```

### Reportes

```ts
createReport(input)           // Crea reporte (pendiente)
getMyReports()                // Reportes del usuario autenticado
getAllReports()               // Todos los reportes (admin)
verifyReport(reportId, adminUid)  // Verifica + otorga puntos
updateReportStatus(reportId, status)
```

### Recompensas

```ts
getAllRewards()               // Catálogo activo
getRewardById(rewardId)
createReward(input)
redeemReward(userId, rewardId)  // Canje con transacción atómica
getUserRedemptions(userId)
getUserPointTransactions(userId)
```

### Semilla

```ts
seedRewards()  // Inserta 5 recompensas iniciales
```

---

## 5. Componentes del Admin (Web)

| Componente | Ruta | Estado |
|-----------|------|--------|
| `AdminLoginScreen` | `/admin/login` | Funcional (login con Firebase) |
| `AdminShell` | Layout | Sidebar + topbar + breadcrumb + tema light/dark + logout |
| `DashboardScreen` | `/admin` | **Conectado a Firestore** (KPIs, BarChart por categoría, Donut por estado) |
| `RecentReportsSection` | `/admin` | Reportes recientes paginados (5 + "Cargar más") |
| `ReportsScreen` | `/admin/reports` | Conectado a Firestore (lectura + verificación/descartar) |
| `UsersScreen` | `/admin/users` | Listado de usuarios paginado (10) |

### Pendiente en Admin
- [ ] Sección Recompensas (CRUD del catálogo, nav muestra "Pronto")
- [ ] Gestión de canjes (aprobar/entregar redemptions)
- [ ] Botón "Conectar wallet" (MetaMask) en el AdminShell (blockchain)

---

## 6. Pendiente para Blockchain

> Plan detallado y pasos en `docs/ARBITRUM_PLAN.md`.

- [ ] Smart contract `PointLedger.sol` deployado en **Arbitrum Sepolia** (testnet)
- [ ] Instalar `ethers` (decisión: ethers v6, no wagmi/viem)
- [ ] Conectar wallet del admin (MetaMask en web)
- [ ] Guardar `walletAddress` en perfil de usuario
- [ ] Llamar `awardPoints()` en `verifyReport()` y registrar `txHash` en `reports` + `pointTransactions`
- [ ] Verificar contrato en Arbiscan

---

## 7. Comandos

```bash
npm start          # Metro Bundler (QR + web)
npm run android    # Android
npm run ios        # iOS
npm run web        # http://localhost:8081
npm run lint       # ESLint
```
