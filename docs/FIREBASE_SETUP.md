# Firebase Setup

OceanEyes remains on Expo 54 and uses the Firebase JS SDK. React Native Firebase is intentionally not used because it requires custom native code and a development build.

## Project setup

1. Create a Firebase project.
2. Register a Web app in Firebase Project Settings.
3. Enable Email/Password in Authentication > Sign-in method.
4. Create a Firestore database in Native mode.
5. Create a Storage bucket.
6. Copy `.env.example` to `.env.local` and fill it with the Web app configuration (`EXPO_PUBLIC_FIREBASE_*`).

The Firebase web configuration is not a secret. Never commit service-account JSON, Admin SDK credentials, or blockchain private keys.

## Admin access

The admin panel (`/admin/login`) logs in with a standard Firebase user whose role is stored in the user doc. The seed function `seedAdminAndTestData()` (see `docs/STATUS.md`) creates the admin and sets `role: 'admin'`.

Note: `firestore.rules` currently checks the custom claim `token.admin == true`. If you rely on those rules, either grant that claim via the Firebase Admin SDK or adjust the rules to authorize `resource.data.role == 'admin'`. Do not let the mobile app assign its own role.

## Local emulators

Install the Firebase CLI, then run:

```bash
firebase emulators:start
```

The project contains rules and indexes for Firestore and Storage. Emulator wiring to the app can be added for local development once the Firebase project ID is available.

## Current data model

The app uses these collections (see `src/mobile/shared/firebase/types.ts`):

- `users/{uid}`: profile, role, profile type and point balance.
- `reports/{reportId}`: public-safe report content, status, `txHash` (blockchain).
- `pointTransactions/{transactionId}`: immutable point movements.
- `rewards/{rewardId}`: active reward catalog.
- `redemptions/{redemptionId}`: redemption requests.

Note: `firestore.rules` also declares optional subcollections (`reports/{reportId}/private/reporter`, `reports/{reportId}/statusHistory/{historyId}`) and a legacy collection name `rewardRedemptions`. The current app writes flat `reports` docs and uses the collection **`redemptions`**, not `rewardRedemptions`. If you use those rules, rename `rewardRedemptions` → `redemptions` so the app's reactivity/security matches.

Anonymous reports still require Firebase login. Authentication prevents abuse while `isAnonymous` controls whether the identity is exposed in the report workflow.