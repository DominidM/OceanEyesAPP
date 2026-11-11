// Sustituye src/mobile/shared/firebase/app.ts de main: Firestore autenticado del emulador.
module.exports = {
  get firestore() { return global.__compat.firestore; },
  get firebaseAuth() { return global.__compat.auth; },
  get storage() { return global.__compat.storage; },
};
