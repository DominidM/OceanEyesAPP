# OceanEyes

> **Vigilancia ciudadana del mar.** Protege el océano, reporta en segundos.

App para la **Hackathon Ethereum Lima 2026**: pescadores y ciudadanos reportan pesca ilegal,
basura marina o variación del mar; los reportes verificados otorgan puntos de recompensa
auditables en **Arbitrum**.

## Stack

- **Expo (React Native)** SDK 54 · Expo Router v6 · TypeScript 5.9
- **Firebase** (Auth + Firestore + Storage) — backend y datos
- **Arbitrum Sepolia** — registro on-chain de puntos (pendiente, ver docs)

## Requisitos

- Node.js ≥ 20 (projecto usa `npm`)
- Cuenta Firebase con `.env.local` (ver `.env.example`)

## Comandos

```bash
npm install         # instalar dependencias
npm start           # Metro Bundler (QR + web)
npm run android     # Android
npm run ios         # iOS
npm run web         # http://localhost:8081
npm run lint        # ESLint
```

## Rutas principales

| Ruta | Plataforma | Vista |
|------|-----------|-------|
| `/` | Web / Native | Landing page (web) o redirect → `/mobile` |
| `/mobile` | Mobile | HomeScreen (4 tabs) |
| `/mobile/report` | Mobile | Wizard de reporte |
| `/admin` | Web | Dashboard admin |

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [`docs/PROJECT.md`](docs/PROJECT.md) | Visión general del proyecto |
| [`docs/STATUS.md`](docs/STATUS.md) | Estado actual + esquema Firestore |
| [`docs/ARBITRUM_PLAN.md`](docs/ARBITRUM_PLAN.md) | Plan de integración Arbitrum |
| [`docs/ARBITRUM_README.md`](docs/ARBITRUM_README.md) | Brief para IA (blockchain) |
| [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md) | Setup de Firebase |