/* eslint-disable import/first -- jest.mock debe declararse antes de importar los módulos simulados */
/**
 * createUserByAdmin usa una instancia SECUNDARIA de Firebase:
 *  - la cuenta nueva se crea e inicia en la instancia 'secondary', nunca en la principal,
 *    así la sesión del admin (correo o Google) no se pierde;
 *  - el perfil se escribe con el Firestore de la instancia secundaria (sesión de la cuenta nueva);
 *  - Ciudadano -> role 'user'/citizen, Pescador -> role 'user'/fisher, Municipal -> 'municipal';
 *  - si escribir el perfil falla, la cuenta recién creada se borra (no quedan cuentas sin perfil);
 *  - al terminar se cierra la sesión de la instancia secundaria, también si algo falla;
 *  - no se guardan contraseñas del admin (ya no existe rememberAdminSession).
 *
 * Unidad bajo prueba: src/mobile/shared/firebase/auth.ts (+ admin-user-profile.ts).
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type FakeApp = { name: string; options: unknown };
type FakeUser = { uid: string };
type FakeAuth = { app: FakeApp; currentUser: FakeUser | null };

const mockApps: FakeApp[] = [];
const mockAuths = new Map<string, FakeAuth>();
const mockAccounts = new Set<string>();
const mockPrimaryAuth: FakeAuth = { app: { name: '[DEFAULT]', options: {} }, currentUser: { uid: 'admin-uid' } };
const mockCalls = {
  initializeApp: jest.fn(),
  createUser: jest.fn(),
  deleteUser: jest.fn(),
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
      mockAccounts.add(auth.currentUser.uid);
      return { user: auth.currentUser };
    },
    deleteUser: async (user: FakeUser) => {
      mockCalls.deleteUser(user.uid);
      mockAccounts.delete(user.uid);
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
  accountType: 'municipal' as const,
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
    expect(mockCalls.deleteUser).not.toHaveBeenCalled();
    expect(mockAccounts.has(uid)).toBe(true);
  });

  it("inicializa la app 'secondary' con la misma config una sola vez y la reutiliza", async () => {
    await auth.createUserByAdmin(input);
    await auth.createUserByAdmin({ ...input, email: 'otro@oceaneyes.test' });

    const secondaryInits = mockApps.filter((app) => app.name === 'secondary');
    expect(secondaryInits).toHaveLength(1);
    expect(secondaryInits[0].options).toBe(firebaseConfig);
    expect(mockApps.some((app) => app.name === '[DEFAULT]')).toBe(false);
  });

  it('ya no guarda credenciales del admin en memoria', () => {
    expect('rememberAdminSession' in auth).toBe(false);
  });
});

describe('createUserByAdmin: tipos de cuenta', () => {
  const cases: ['citizen' | 'fisher' | 'municipal', string, string][] = [
    ['citizen', 'user', 'citizen'],
    ['fisher', 'user', 'fisher'],
    ['municipal', 'municipal', 'citizen'],
  ];
  it.each(cases)('%s -> role %s, profileType %s', async (accountType, role, profileType) => {
    const uid = await auth.createUserByAdmin({ ...input, accountType, dni: '12345678' });

    expect(mockCalls.setDoc).toHaveBeenCalledTimes(1);
    const [, path, data] = mockCalls.setDoc.mock.calls[0] as [string, string, Record<string, unknown>];
    expect(path).toBe(`users/${uid}`);
    expect(data).toEqual({
      role,
      profileType,
      displayName: input.displayName,
      email: input.email,
      dni: '12345678',
      pointsBalance: 0,
      totalPointsEarned: 0,
      verifiedReportsCount: 0,
      status: 'active',
      createdAt: 'ts',
      updatedAt: 'ts',
    });
  });

  it("el panel no puede pedir role 'admin': se rechaza sin crear la cuenta", async () => {
    // @ts-expect-error 'admin' no es un tipo de cuenta creable desde el panel
    const invalid: Parameters<typeof auth.createUserByAdmin>[0] = { ...input, accountType: 'admin' };
    await expect(auth.createUserByAdmin(invalid)).rejects.toThrow('Tipo de cuenta no permitido');
    expect(mockCalls.createUser).not.toHaveBeenCalled();
    expect(mockCalls.setDoc).not.toHaveBeenCalled();
  });
});

describe('createUserByAdmin: si falla el perfil', () => {
  it('borra la cuenta recién creada, propaga el error y cierra la sesión secundaria', async () => {
    mockState.failSetDoc = true;
    const before = new Set(mockAccounts);

    await expect(auth.createUserByAdmin(input)).rejects.toMatchObject({ code: 'permission-denied' });

    const created = `new-${mockState.nextUid}`;
    expect(mockCalls.deleteUser).toHaveBeenCalledWith(created);
    expect(mockAccounts).toEqual(before);
    expect(mockCalls.signOut).toHaveBeenCalledWith('secondary');
    expect(mockAuths.get('secondary')!.currentUser).toBeNull();
    expect(mockPrimaryAuth.currentUser).toEqual({ uid: 'admin-uid' });
  });
});
