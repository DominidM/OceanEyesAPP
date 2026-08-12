import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { firebaseConfig, isFirebaseConfigured } from './config';
import { createFirebaseAuth } from './auth-persistence';

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

export const firebaseAuth = isFirebaseConfigured() ? createFirebaseAuth(firebaseApp) : null;

export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    const msg = e.message ?? '';
    if (msg.includes('Database is closing') || msg.includes('Database is hidden')) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
}
