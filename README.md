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
---

## English

### About

OceanEyes is a citizen ocean-monitoring app. Fishers and citizens report illegal fishing,
marine litter or changes in sea conditions with photos, audio and GPS location, even while
offline. Municipal staff review the reports from a web dashboard, and verified reports earn
reward points that are recorded on **Arbitrum**. It is built with Expo (React Native) and
Firebase (Auth, Firestore, Storage, Cloud Functions).

### Requirements

- **Node.js** 22 LTS (the version used in CI; ≥ 20 works) and npm
- **Expo SDK 54** (installed through `npm install`; no global Expo CLI needed)
- **Devices:** Android 7.0+ (API 24) or iOS 15.1+
- For the Firestore rules tests: **Firebase CLI** (`npm install -g firebase-tools`) and a
  **Java JDK** (21 recommended), which the emulator needs

### Installation

```bash
git clone https://github.com/DominidM/OceanEyesAPP.git
cd OceanEyesAPP
npm install
cp .env.example .env.local   # fill in your own Firebase web config
npm start                    # Expo dev server (QR code for Expo Go / web)
```

Never commit `.env.local` or service-account keys.

### Running the tests

```bash
npm run lint        # ESLint
npx tsc --noEmit    # type check (run `npx expo customize tsconfig.json` once first on a fresh clone)
npm test            # Jest unit tests
```

Firestore and Storage security rules are tested against the **local emulator** using the
demo project `demo-oceaneyes`, so no real Firebase project or credentials are used:

```bash
npm --prefix __tests__ install
npm run test:rules  # starts the Firestore + Storage emulators and runs the rules tests
```

### License

Released under the [MIT License](LICENSE). Copyright (c) 2026 OceanEyes authors.

### How to cite

If you use OceanEyes in your work, please cite it using the metadata in
[`CITATION.cff`](CITATION.cff) (GitHub shows a "Cite this repository" button). For example:

> Muñoz Eslava, J. D., Capillo Hidalgo, M. A., Candela Isla, M. M., Gabriel Rios, J. D.,
> Anton Rojas, J., Arian Flores, E., Amaya Quiroz, J. P., Parillo Quilca, A. del P.,
> Ore Nuñez, I., & Rodriguez Vargas, V. M. (2026). *OceanEyes* (Version 1.0.0) [Computer software].
> https://github.com/DominidM/OceanEyesAPP
