/**
 * Pruebas contra el Emulador de Firebase (proyecto demo, nunca producción).
 *
 * PU-05 Archivo no permitido / pesado (storage.rules)
 * PU-08 Transición Pendiente → Verificado registra statusHistory (firestore.rules)
 * PU-09 Ciudadano no lee reporte ajeno (firestore.rules)
 * PU-10 Ciudadano no cambia el estado de su reporte (firestore.rules)
 * SEC-01 Ciudadano no puede crear un reporte ya verificado / con puntos
 * SEC-03 Dueño solo edita campos permitidos de su perfil
 * SEC-02 Dueño no puede editar datos de un reporte salvo medios, ni tras la verificación
 *
 * Ejecutar desde __tests__/:  npm run test:rules
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { addDoc, collection, doc, getDoc, getDocs, increment, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

const ROOT = resolve(__dirname, '..', '..');
const WALLET = '0x1111111111111111111111111111111111111111';

let env: RulesTestEnvironment;

function emulatorHost(variable: string, fallbackPort: number) {
  const [host, port] = (process.env[variable] ?? `127.0.0.1:${fallbackPort}`).split(':');
  return { host, port: Number(port) };
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-oceaneyes',
    firestore: {
      rules: readFileSync(resolve(ROOT, 'firestore.rules'), 'utf8'),
      ...emulatorHost('FIRESTORE_EMULATOR_HOST', 8080),
    },
    storage: {
      rules: readFileSync(resolve(ROOT, 'storage.rules'), 'utf8'),
      ...emulatorHost('FIREBASE_STORAGE_EMULATOR_HOST', 9199),
    },
  });
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const baseUser = { pointsBalance: 0, totalPointsEarned: 0, verifiedReportsCount: 0, status: 'active' };
    await setDoc(doc(db, 'users/alice'), { ...baseUser, role: 'user', profileType: 'citizen', walletAddress: WALLET });
    await setDoc(doc(db, 'users/bob'), { ...baseUser, role: 'user', profileType: 'fisher', walletAddress: WALLET });
    await setDoc(doc(db, 'users/carol'), { ...baseUser, role: 'user', profileType: 'citizen', status: 'suspended', walletAddress: WALLET, pointsBalance: 300 });
    await setDoc(doc(db, 'rewards/kit'), { title: 'Kit', pointsCost: 150, stock: 5, active: true });
    await setDoc(doc(db, 'users/admin1'), { ...baseUser, role: 'admin', profileType: 'citizen' });
    await setDoc(doc(db, 'reports/rBob'), {
      userId: 'bob',
      category: 'pesca_ilegal',
      title: 'Pesca ilegal',
      status: 'pendiente',
      pointsAwarded: 0,
      location: { latitude: -12.05, longitude: -77.15 },
      photoURLs: [],
    });
    await setDoc(doc(db, 'reports/rBobVerified'), {
      userId: 'bob',
      category: 'pesca_ilegal',
      title: 'Pesca ilegal',
      status: 'verificado',
      pointsAwarded: 100,
      location: { latitude: -12.05, longitude: -77.15 },
      photoURLs: [],
    });
    await setDoc(doc(db, 'reports/rAlice'), {
      userId: 'alice',
      category: 'basura_marina',
      title: 'Basura',
      status: 'pendiente',
      pointsAwarded: 0,
      photoURLs: [],
    });
  });
});

describe('PU-05 archivo no permitido / pesado (storage.rules)', () => {
  it('permite subir una imagen JPEG pequeña al reporte propio', async () => {
    const storage = env.authenticatedContext('alice').storage();
    await assertSucceeds(
      uploadBytes(ref(storage, 'reports/rAlice/foto.jpg'), new Uint8Array(1024), { contentType: 'image/jpeg' }),
    );
  });

  it('rechaza un PDF (tipo MIME no permitido)', async () => {
    const storage = env.authenticatedContext('alice').storage();
    await assertFails(
      uploadBytes(ref(storage, 'reports/rAlice/doc.pdf'), new Uint8Array(1024), { contentType: 'application/pdf' }),
    );
  });

  it('rechaza una imagen de 51 MB (límite 50 MB)', async () => {
    const storage = env.authenticatedContext('alice').storage();
    await assertFails(
      uploadBytes(ref(storage, 'reports/rAlice/grande.jpg'), new Uint8Array(51 * 1024 * 1024), {
        contentType: 'image/jpeg',
      }),
    );
  });

  it('rechaza subir medios al reporte de otro usuario', async () => {
    const storage = env.authenticatedContext('alice').storage();
    await assertFails(
      uploadBytes(ref(storage, 'reports/rBob/foto.jpg'), new Uint8Array(1024), { contentType: 'image/jpeg' }),
    );
  });
});

describe('PU-08 Pendiente → Verificado registra statusHistory', () => {
  it('el admin actualiza el estado y deja la entrada en statusHistory (secuencia de report-detail-screen.tsx)', async () => {
    const db = env.authenticatedContext('admin1').firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'reports/rBob'), { status: 'verificado', reviewedBy: 'admin1', pointsAwarded: 100 }),
    );
    await assertSucceeds(
      addDoc(collection(db, 'reports/rBob/statusHistory'), {
        fromStatus: 'pendiente',
        toStatus: 'verificado',
        changedBy: 'admin1',
        createdAt: new Date(),
      }),
    );
    const history = await getDocs(collection(db, 'reports/rBob/statusHistory'));
    expect(history.size).toBe(1);
    expect(history.docs[0].data()).toMatchObject({ fromStatus: 'pendiente', toStatus: 'verificado' });
  });

  it('el dueño puede leer el historial pero no escribirlo', async () => {
    const db = env.authenticatedContext('bob').firestore();
    await assertSucceeds(getDocs(collection(db, 'reports/rBob/statusHistory')));
    await assertFails(
      addDoc(collection(db, 'reports/rBob/statusHistory'), { fromStatus: 'pendiente', toStatus: 'verificado' }),
    );
  });
});

describe('PU-09 ciudadano no lee reporte ajeno', () => {
  it('alice no puede leer el reporte pendiente de bob', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(getDoc(doc(db, 'reports/rBob')));
  });

  it('alice sí puede leer su propio reporte', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertSucceeds(getDoc(doc(db, 'reports/rAlice')));
  });
});

describe('PU-10 ciudadano no cambia el estado de su reporte', () => {
  it('bob no puede pasar su reporte de pendiente a verificado', async () => {
    const db = env.authenticatedContext('bob').firestore();
    await assertFails(updateDoc(doc(db, 'reports/rBob'), { status: 'verificado' }));
  });
});

const validReport = {
  userId: 'alice',
  category: 'pesca_ilegal',
  title: 'Pesca ilegal',
  status: 'pendiente',
  pointsAwarded: 0,
  isAnonymous: true,
  location: { latitude: -12.05, longitude: -77.15 },
  photoURLs: [],
};

describe('SEC-01 creación de reportes', () => {
  it('permite crear un reporte pendiente sin puntos', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertSucceeds(setDoc(doc(db, 'reports/rNew'), validReport));
  });

  it('deniega crear un reporte ya verificado', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(setDoc(doc(db, 'reports/rForged'), { ...validReport, status: 'verificado', pointsAwarded: 100 }));
  });

  it('deniega crear un reporte pendiente con puntos', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(setDoc(doc(db, 'reports/rForged2'), { ...validReport, pointsAwarded: 100 }));
  });

  it('deniega crear un reporte con txHash o datos de revisión', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(setDoc(doc(db, 'reports/rForged3'), { ...validReport, txHash: '0xabc' }));
    await assertFails(setDoc(doc(db, 'reports/rForged4'), { ...validReport, reviewedBy: 'alice' }));
    await assertFails(setDoc(doc(db, 'reports/rForged5'), { ...validReport, onChainStatus: 'awarded' }));
  });
});

describe('SEC-02 edición del reporte por su dueño', () => {
  it('permite adjuntar fotos y audio mientras está pendiente', async () => {
    const db = env.authenticatedContext('bob').firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'reports/rBob'), { photoURLs: ['https://x/1.jpg'], audioURL: 'https://x/a.m4a', audioDurationMillis: 1200 }),
    );
  });

  it('deniega cambiar pointsAwarded o location de un reporte pendiente', async () => {
    const db = env.authenticatedContext('bob').firestore();
    await assertFails(updateDoc(doc(db, 'reports/rBob'), { pointsAwarded: 500 }));
    await assertFails(updateDoc(doc(db, 'reports/rBob'), { location: { latitude: 0, longitude: 0 } }));
  });

  it('deniega cambiar pointsAwarded, location o medios tras la verificación', async () => {
    const db = env.authenticatedContext('bob').firestore();
    await assertFails(updateDoc(doc(db, 'reports/rBobVerified'), { pointsAwarded: 500 }));
    await assertFails(updateDoc(doc(db, 'reports/rBobVerified'), { location: { latitude: 0, longitude: 0 } }));
    await assertFails(updateDoc(doc(db, 'reports/rBobVerified'), { photoURLs: ['https://x/otra.jpg'] }));
  });
});

describe('SEC-03 edición del perfil por su dueño', () => {
  it('permite cambiar displayName, phone y walletAddress', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'users/alice'), {
        displayName: 'Alice',
        phone: '999',
        walletAddress: '0x2222222222222222222222222222222222222222',
        updatedAt: new Date(),
      }),
    );
  });

  it('deniega cambiar status, bannedUntil, deviceHash, banReason o role', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(updateDoc(doc(db, 'users/alice'), { status: 'suspended' }));
    await assertFails(updateDoc(doc(db, 'users/alice'), { bannedUntil: null }));
    await assertFails(updateDoc(doc(db, 'users/alice'), { deviceHash: 'otro' }));
    await assertFails(updateDoc(doc(db, 'users/alice'), { banReason: 'x' }));
    await assertFails(updateDoc(doc(db, 'users/alice'), { role: 'admin' }));
  });

  it('deniega que un usuario suspendido se reactive o cambie su wallet', async () => {
    const db = env.authenticatedContext('carol').firestore();
    await assertFails(updateDoc(doc(db, 'users/carol'), { status: 'active' }));
    await assertFails(updateDoc(doc(db, 'users/carol'), { walletAddress: '0x3333333333333333333333333333333333333333' }));
  });

  it('deniega modificar puntos fuera de un canje', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(updateDoc(doc(db, 'users/alice'), { pointsBalance: 1000 }));
    await assertFails(updateDoc(doc(db, 'users/alice'), { totalPointsEarned: 1000 }));
    await assertFails(updateDoc(doc(db, 'users/alice'), { verifiedReportsCount: 9 }));
    await assertFails(updateDoc(doc(db, 'users/carol'), { pointsBalance: 0 }));
  });

  it('permite el débito de puntos ligado a un canje creado en la misma transacción', async () => {
    const db = env.authenticatedContext('carol').firestore();
    const batch = writeBatch(db);
    batch.set(doc(db, 'redemptions/red1'), { userId: 'carol', rewardId: 'kit', pointsSpent: 150, status: 'pendiente' });
    batch.update(doc(db, 'users/carol'), { pointsBalance: increment(-150), lastRedemptionId: 'red1' });
    await assertSucceeds(batch.commit());
  });

  it('deniega un débito que no coincide con el canje', async () => {
    const db = env.authenticatedContext('carol').firestore();
    const batch = writeBatch(db);
    batch.set(doc(db, 'redemptions/red2'), { userId: 'carol', rewardId: 'kit', pointsSpent: 150, status: 'pendiente' });
    batch.update(doc(db, 'users/carol'), { pointsBalance: increment(-10), lastRedemptionId: 'red2' });
    await assertFails(batch.commit());
  });
});
