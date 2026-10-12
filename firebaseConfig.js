import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Configuración de Firebase (igual para dev y prod)
const firebaseConfig = {
  apiKey: 'AIzaSyDummyKeyForEmulator',
  authDomain: 'oceaneyes-5e7b4.firebaseapp.com',
  projectId: 'oceaneyes-5e7b4',
  storageBucket: 'oceaneyes-5e7b4.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456'
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener referencias
const auth = getAuth(app);
const db = getFirestore(app);

// CONECTAR A EMULADORES LOCALES (solo en desarrollo)
const EMULATOR_MODE = process.env.NODE_ENV === 'development' || process.env.FIREBASE_EMULATOR_HUB;

if (EMULATOR_MODE) {
  // Detectar si estamos en dispositivo físico o emulador Android
  const isPhysicalDevice = process.env.DEVICE_IP; // Pasar como variable de entorno si es necesario
  const authHost = isPhysicalDevice ? `${isPhysicalDevice}:9099` : 'localhost:9099';
  const firestoreHost = isPhysicalDevice ? `${isPhysicalDevice}:8080` : 'localhost:8080';

  try {
    // Conectar Auth Emulator
    connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
    console.log(`✓ Auth Emulator conectado: ${authHost}`);

    // Conectar Firestore Emulator
    connectFirestoreEmulator(db, isPhysicalDevice ? isPhysicalDevice.split(':')[0] : 'localhost', 8080);
    console.log(`✓ Firestore Emulator conectado: ${firestoreHost}`);
  } catch (error) {
    console.log('⚠️  Emuladores ya conectados o error:', error.message);
  }
}

export { auth, db, app };
