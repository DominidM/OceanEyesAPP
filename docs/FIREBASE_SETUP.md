# Firebase Setup

OceanEyes remains on Expo 54 and uses the Firebase JS SDK. React Native Firebase is intentionally not used because it requires custom native code and a development build.

## Project setup

1. Create a Firebase project.
2. Register a Web app in Firebase Project Settings.
3. Enable Email/Password in Authentication > Sign-in method.
4. Create a Firestore database in Native mode.
5. Create a Storage bucket.
6. Copy `.env.example` to `.env.local` and fill it with the Web app configuration.

The Firebase web configuration is not a secret. Never commit service-account JSON, Admin SDK credentials, or blockchain private keys.

## Admin access

The Firestore rules expect the admin custom claim:

```json
{ "admin": true }
```

Set that claim from a trusted server or the Firebase Admin SDK. Do not let the mobile app assign its own role.

## Local emulators

Install the Firebase CLI, then run:

```bash
firebase emulators:start
```

The project contains rules and indexes for Firestore and Storage. Emulator wiring to the app can be added for local development once the Firebase project ID is available.

## Current data model

- `users/{uid}`: profile, role, type and point balance.
- `reports/{reportId}`: public-safe report content and status.
- `reports/{reportId}/private/reporter`: protected reporter data.
- `reports/{reportId}/statusHistory/{historyId}`: admin audit trail.
- `pointTransactions/{transactionId}`: immutable point movements.
- `rewards/{rewardId}`: active reward catalog.
- `rewardRedemptions/{redemptionId}`: redemption requests.

Anonymous reports still require Firebase login. Authentication prevents abuse while `isAnonymous` controls whether the identity is exposed in the report workflow.
