# OceanEyes — Documentación del Proyecto

> **Vigilancia ciudadana del mar.** Protege el océano, reporta en segundos.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | **Expo (React Native)** | SDK 54 |
| Router | **Expo Router** (file-based) | v6 |
| UI | React Native + React Native Web | 0.81.5 / 0.21.0 |
| Lenguaje | **TypeScript** | 5.9.x |
| Iconos | expo-symbols (iOS) / @expo/vector-icons MaterialIcons (Android) | |
| Fuentes | Inter + Playfair Display (Google Fonts via expo-font) | |
| Animaciones | react-native-reanimated | ~4.1.1 |
| Cámara | expo-camera | ~17.0.10 |
| Geolocalización | expo-location | ~19.0.8 |
| Mapas | react-native-maps | 1.20.1 |
| Audio | expo-audio | ~1.1.1 |
| Linting | ESLint + eslint-config-expo | |

---

## Arquitectura de Archivos

```
src/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx         # Root layout: ThemeProvider + Stack
│   ├── index.tsx           # Landing (web) o redirect → /mobile
│   ├── mobile/
│   │   ├── _layout.tsx     # Splash + font loading + Stack
│   │   ├── index.tsx       # → HomeScreen
│   │   └── report.tsx      # → ReportCreateScreen
│   └── admin/
│       ├── _layout.tsx     # Web-only guard
│       ├── index.tsx       # → DashboardScreen
│       ├── login.tsx       # → AdminLoginScreen
│       └── reports.tsx     # → ReportsScreen
│
├── mobile/                 # App móvil principal (@/*)
│   ├── constants/theme.ts
│   ├── hooks/useAppFonts.ts
│   ├── components/         # Splash overlay (platform-specific)
│   ├── shared/
│   │   ├── components/     # AppSymbol, BottomTabBar, PhoneFrame, SectionHeader
│   │   ├── config/main-tabs.ts
│   │   └── utils/shadows.ts
│   └── modules/
│       ├── home/           # Tab Inicio
│       ├── reports/        # Tab Reportes + flujo de creación
│       ├── rewards/        # Tab Recompensas
│       └── profile/        # Tab Perfil (placeholder)
│
├── admin/                  # Panel administrativo web (@admin/*)
│   ├── shared/components/admin-shell.tsx
│   └── modules/
│       ├── auth/           # Login
│       ├── dashboard/      # KPIs + reportes recientes
│       └── reports/        # Gestión de reportes (placeholder)
│
└── landing/                # Landing page web (@landing/*)
    └── presentation/
        ├── screens/landing-screen.tsx
        ├── sections/       # Hero, Features, Download, Footer
        └── components/     # NavBar, SectionHeader
```

### Aliases de Path (tsconfig.json)

| Alias | Resuelve a |
|-------|-----------|
| `@/*` | `./src/mobile/*` |
| `@landing/*` | `./src/landing/*` |
| `@admin/*` | `./src/admin/*` |
| `@/assets/*` | `./assets/*` |

---

## Flujo de Navegación

```
/                       → Web: LandingScreen  |  Native: redirect → /mobile
/mobile                 → HomeScreen (tabs: inicio/reportes/recompensas/perfil)
/mobile/report          → ReportCreateScreen (wizard de 5 pasos)
/admin                  → DashboardScreen (KPIs + reportes recientes)
/admin/login            → AdminLoginScreen
/admin/reports          → ReportsScreen (placeholder)
```

---

## Sistema de Tabs (App Móvil)

4 tabs internos gestionados por `useState<MainTabKey>` en HomeScreen:

| Tab | Clave | Ícono iOS (SF Symbol) | Ícono Android (Material) |
|-----|-------|----------------------|--------------------------|
| Inicio | `inicio` | `house.fill` | `home` |
| Reportes | `reportes` | `doc.text.fill` | `article` |
| Recompensas | `recompensas` | `gift.fill` | `redeem` |
| Perfil | `perfil` | `person.fill` | `person` |

FAB central (acción principal): entre `reportes` y `recompensas` — icono `plus` / `add`.

---

## Tema y Diseño

### Colores de Marca (`src/mobile/constants/theme.ts`)

| Token | Color | Uso |
|-------|-------|-----|
| `primary` | `#134E5E` | Acciones principales, fondo de tarjetas destacadas |
| `secondary` | `#98B9B1` | Acciones secundarias, elementos decorativos |
| `tertiary` | `#EFEBE3` | Fondo principal de la app |
| `neutral` | `#2C2C2C` | Texto principal |

### Sistema de Sombras (`src/mobile/shared/utils/shadows.ts`)

Sombras cross-platform con `Platform.select`:

| Preset | iOS (shadow*) | Android (elevation) | Uso |
|--------|-------------|---------------------|-----|
| `subtle` | 0/1/0.05/2 | 1 | Tarjetas pequeñas, chips |
| `medium` | 0/4/0.1/6 | 4 | Botones |
| `card` | 0/10/0.1/15 | 5 | Action cards |
| `lift` | 0/25/0.25/50 | 10 | Phone frame, bottom nav |
| `fab` | 0/10/0.1/15 | 6 | FAB button |

### Fuentes

- **Headlines**: Playfair Display (serif)
- **Body / Labels**: Inter (sans-serif)
- Cargadas vía `useAppFonts()` con `@expo-google-fonts`
- Web: Google Fonts CSS import en `src/global.css`

---

## Flujo de Reportes (Wizard)

El wizard de creación de reportes tiene 5 pasos secuenciales:

1. **DNI Step** — Ingreso de DNI + consentimiento de datos
2. **Capture Step** — Captura de foto/video con cámara
3. **Location Step** — Geolocalización con mapa interactivo
4. **Incident Step** — Selección de tipo de incidente + grabación de audio
5. **Summary Step** — Resumen final y envío

Tipos de incidente definidos en `incident-types.ts`:
- Derrame (`spill`)
- Contaminación (`pollution`)
- Pesca ilegal (`fishing`)
- Embarcación sospechosa (`vessel`)
- Fauna en peligro (`wildlife`)
- Residuos (`debris`)

---

## Comandos Disponibles

```bash
npm start          # Inicia Metro Bundler (QR + web)
npm run android    # Android (emulador o dispositivo USB)
npm run ios        # iOS (simulador)
npm run web        # Navegador
npm run lint       # ESLint (eslint-config-expo)
npm run reset-project  # Reinicia a template Expo limpio
```

---

## Configuración de ESLint

Archivo `eslint.config.js` — usa `expoConfig` de `eslint-config-expo` con soporte para TypeScript y React.

---

## Consideraciones Técnicas

- **Safe Area**: Se usa `useSafeAreaInsets()` de `react-native-safe-area-context` en todos los componentes que lo requieren. No se usa `SafeAreaView`.
- **Iconos**: `AppSymbol` en `src/mobile/shared/components/app-symbol.tsx` abstrae SF Symbols (iOS) y MaterialIcons (Android/Web).
- **Sombras**: Centralizadas en `src/mobile/shared/utils/shadows.ts` para mantener consistencia cross-platform.
- **Fuentes en Android**: Se cargan con `useAppFonts()` antes de renderizar. El `_layout.tsx` de mobile espera a que estén listas.
- **Maps**: Implementación con platform-specific files (`.native.tsx` / `.web.tsx`) para manejar diferencias entre `react-native-maps` (native) y `react-native-web-maps` (web).
- **PhoneFrame**: Contenedor centrado con `maxWidth: 430` que simula un teléfono en web y se adapta en mobile.
- **Edge-to-Edge**: Diseño sin SafeAreaView superior — cada componente maneja sus propios insets.
