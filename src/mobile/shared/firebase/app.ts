import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { firebaseConfig, isFirebaseConfigured } from './config';
import { createFirebaseAuth } from './auth-persistence';

// En esta rama (capstone) la app debe arrancar sin .env. Si Firebase no est�
// configurado, usamos un config de relleno s�lo para no romper la inicializaci�n
// de Firestore/Storage; las llamadas reales quedan desactivadas por
// isFirebaseConfigured() en el resto del c�digo.
const runtimeConfig = isFirebaseConfigured()
  ? firebaseConfig
  : { ...firebaseConfig, projectId: firebaseConfig.projectId || 'oceaneyes-demo' };

export const firebaseApp = getApps()[0] ?? initializeApp(runtimeConfig);

export const firebaseAuth = isFirebaseConfigured() ? createFirebaseAuth(firebaseApp) : null;

export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// En React Native existe `window` pero no `window.addEventListener`, así que hay que
// comprobarlo explícitamente para no romper el arranque en Android/iOS.
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('error', (e) => {
    const msg = e.message ?? '';
    if (msg.includes('Database is closing') || msg.includes('Database is hidden')) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
}
