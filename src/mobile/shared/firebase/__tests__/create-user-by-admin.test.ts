/* eslint-disable import/first -- jest.mock debe declararse antes de importar los módulos simulados */
/**
 * createUserByAdmin usa una instancia SECUNDARIA de Firebase:
 *  - la cuenta nueva se crea e inicia en la instancia 'secondary', nunca en la principal,
 *    así la sesión del admin (correo o Google) no se pierde;
 *  - el perfil se escribe con el Firestore de la instancia secundaria (sesión de la cuenta nueva);
 *  - al terminar se cierra la sesión de la instancia secundaria, también si algo falla;
 *  - no se guardan contraseñas del admin (ya no existe rememberAdminSession).
 *
 * Unidad bajo prueba: src/mobile/shared/firebase/auth.ts.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type FakeApp = { name: string; options: unknown };
type FakeAuth = { app: FakeApp; currentUser: { uid: string } | null };

const mockApps: FakeApp[] = [];
const mockAuths = new Map<string, FakeAuth>();
const mockPrimaryAuth: FakeAuth = { app: { name: '[DEFAULT]', options: {} }, currentUser: { uid: 'admin-uid' } };
const mockCalls = {
  initializeApp: jest.fn(),
  createUser: jest.fn(),
  signOut: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  setDoc: jest.fn(),
};
const mockState = { failSetDoc: false, nextUid: 0 };

jest.mock('firebase/app', () => ({
  getApps: () => mockApps,
  initializeApp: (options: unknown, name: string) => {
    mockCalls.initializeApp(options, name);
    const app = { name, options };
    mockApps.push(app);
    return app;
  },
}));

jest.mock('firebase/auth', () => {
  const getAuth = (app: FakeApp) => {
    if (!mockAuths.has(app.name)) mockAuths.set(app.name, { app, currentUser: null });
    return mockAuths.get(app.name)!;
  };
  return {
    EmailAuthProvider: { credential: jest.fn() },
    GoogleAuthProvider: Object.assign(jest.fn(), { credential: jest.fn() }),
    getAuth,
    createUserWithEmailAndPassword: async (auth: FakeAuth, email: string, password: string) => {
      mockCalls.createUser(auth.app.name, email, password);
      mockState.nextUid += 1;
      auth.currentUser = { uid: `new-${mockState.nextUid}` };
      return { user: auth.currentUser };
    },
    updateProfile: async () => undefined,
    signOut: async (auth: FakeAuth) => {
      mockCalls.signOut(auth.app.name);
      auth.currentUser = null;
    },
    signInWithEmailAndPassword: (...args: unknown[]) => mockCalls.signInWithEmailAndPassword(...args),
    linkWithCredential: jest.fn(),
    reauthenticateWithCredential: jest.fn(),
    signInAnonymously: jest.fn(),
    signInWithCredential: jest.fn(),
    signInWithPopup: jest.fn(),
    updatePassword: jest.fn(),
  };
});

jest.mock('firebase/firestore', () => ({
  getFirestore: (app: FakeApp) => ({ app: app.name }),
  doc: (db: { app: string }, ...segments: string[]) => ({ db: db.app, path: segments.join('/') }),
  setDoc: async (ref: { db: string; path: string }, data: Record<string, unknown>) => {
    mockCalls.setDoc(ref.db, ref.path, data);
    if (mockState.failSetDoc) throw Object.assign(new Error('denied'), { code: 'permission-denied' });
  },
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: () => 'ts',
}));

jest.mock('@/shared/firebase/app', () => ({
  get firebaseAuth() {
    return mockPrimaryAuth;
  },
  firestore: { app: '[DEFAULT]' },
}));
jest.mock('@/shared/firebase/bans', () => ({ banUser: jest.fn(), unbanUser: jest.fn() }));

import * as auth from '../auth';
import { firebaseConfig } from '../config';

const input = {
  email: 'nuevo@oceaneyes.test',
  password: 'Segura123!',
  displayName: 'Nuevo',
  profileType: 'citizen' as const,
  role: 'municipal' as const,
};

beforeEach(() => {
  Object.values(mockCalls).forEach((fn) => fn.mockClear());
  mockState.failSetDoc = false;
  mockPrimaryAuth.currentUser = { uid: 'admin-uid' };
});

describe('createUserByAdmin con instancia secundaria', () => {
  it('crea la cuenta y el perfil en la instancia secundaria y conserva la sesión del admin', async () => {
    const uid = await auth.createUserByAdmin(input);

    expect(mockCalls.createUser).toHaveBeenCalledWith('secondary', input.email, input.password);
    expect(mockCalls.setDoc).toHaveBeenCalledWith(
      'secondary',
      `users/${uid}`,
      expect.objectContaining({ role: 'municipal', email: input.email, pointsBalance: 0 }),
    );
    expect(mockCalls.signOut).toHaveBeenCalledWith('secondary');
    expect(mockCalls.signOut).not.toHaveBeenCalledWith('[DEFAULT]');
    expect(mockPrimaryAuth.currentUser).toEqual({ uid: 'admin-uid' });
    expect(mockAuths.get('secondary')!.currentUser).toBeNull();
    expect(mockCalls.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("inicializa la app 'secondary' con la misma config una sola vez y la reutiliza", async () => {
    await auth.createUserByAdmin(input);
    await auth.createUserByAdmin({ ...input, email: 'otro@oceaneyes.test' });

    const secondaryInits = mockApps.filter((app) => app.name === 'secondary');
    expect(secondaryInits).toHaveLength(1);
    expect(secondaryInits[0].options).toBe(firebaseConfig);
    expect(mockApps.some((app) => app.name === '[DEFAULT]')).toBe(false);
  });

  it('cierra la sesión secundaria aunque falle la escritura del perfil', async () => {
    mockState.failSetDoc = true;
    await expect(auth.createUserByAdmin(input)).rejects.toMatchObject({ code: 'permission-denied' });
    expect(mockCalls.signOut).toHaveBeenCalledWith('secondary');
    expect(mockAuths.get('secondary')!.currentUser).toBeNull();
    expect(mockPrimaryAuth.currentUser).toEqual({ uid: 'admin-uid' });
  });

  it('ya no guarda credenciales del admin en memoria', () => {
    expect('rememberAdminSession' in auth).toBe(false);
  });
});
