/* eslint-disable import/first -- jest.mock debe declararse antes de importar los módulos simulados */
/**
 * Login del panel: correo/contraseña y Google pasan por la misma verificación de rol.
 *  - 'admin' entra a /admin y 'municipal' a /admin/municipio.
 *  - 'user' (u otro rol) y cuentas sin perfil se rechazan: logout() y "Acceso denegado".
 *  - El login del panel nunca crea perfiles.
 *  - Errores del popup de Google con mensajes en español.
 *
 * Unidades bajo prueba: src/admin/presentation/screens/admin-login-screen.tsx y admin-login-access.ts.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';

const mockProfiles = new Map<string, { role: string } | null>();
const mockReplace = jest.fn();
const mockLogout = jest.fn(async () => undefined);
const mockLoginWithEmail = jest.fn(async (email: string, _password: string) => ({ uid: email.split('@')[0] }));
const mockSignInWithGoogleWeb = jest.fn(async (): Promise<{ uid: string }> => ({ uid: 'admin' }));
const mockCreateProfile = jest.fn();

jest.mock('@/shared/firebase/auth', () => ({
  getUserProfile: async (uid: string) => mockProfiles.get(uid) ?? null,
  loginWithEmail: (email: string, password: string) => mockLoginWithEmail(email, password),
  logout: () => mockLogout(),
  signInWithGoogleWeb: () => mockSignInWithGoogleWeb(),
  registerUser: (...args: unknown[]) => mockCreateProfile(...args),
  createUserByAdmin: (...args: unknown[]) => mockCreateProfile(...args),
}));
jest.mock('expo-router', () => ({ router: { replace: (route: string) => mockReplace(route), push: jest.fn() } }));
jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('@expo/vector-icons', () => ({ FontAwesome5: () => null }));
jest.mock('@landing/presentation/components/page-transition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/constants/theme', () => ({
  AppFonts: { headline: 'h', body: 'b', label: 'l' },
  BrandColors: { primary: '#000', secondary: '#111', tertiary: '#fff', neutral: '#222' },
  Spacing: { one: 4, two: 8, three: 12, four: 16, five: 24 },
}));

import { AdminLoginScreen } from '../admin-login-screen';

const DENIED = 'Acceso denegado. Esta cuenta no tiene permisos de administrador.';

function render() {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = renderer.create(<AdminLoginScreen />);
  });
  return tree;
}

function pressButton(tree: ReactTestRenderer, label: string) {
  const text = tree.root.findAll((node) => node.type === Text && node.props.children === label)[0];
  let node = text.parent;
  while (node && typeof node.props.onPress !== 'function') node = node.parent;
  return act(async () => {
    await node!.props.onPress();
  });
}

/** Texto del mensaje de error del formulario (estilo `error`, color #B42318). */
function errorText(tree: ReactTestRenderer) {
  const node = tree.root.findAll(
    (candidate) => candidate.type === Text && StyleSheet.flatten(candidate.props.style)?.color === '#B42318',
  )[0];
  return node?.props.children as string | undefined;
}

async function loginWithEmail(tree: ReactTestRenderer, email: string) {
  const [emailInput, passwordInput] = tree.root.findAllByType(TextInput);
  act(() => {
    emailInput.props.onChangeText(email);
    passwordInput.props.onChangeText('secreta123');
  });
  await pressButton(tree, 'Entrar al panel');
}

beforeEach(() => {
  mockProfiles.clear();
  mockProfiles.set('admin', { role: 'admin' });
  mockProfiles.set('muni', { role: 'municipal' });
  mockProfiles.set('citizen', { role: 'user' });
  mockReplace.mockClear();
  mockLogout.mockClear();
  mockLoginWithEmail.mockClear();
  mockSignInWithGoogleWeb.mockReset();
  mockCreateProfile.mockClear();
});

describe('Login del panel: campos vacíos por defecto', () => {
  it('no trae correo ni contraseña precargados', () => {
    const tree = render();
    const [emailInput, passwordInput] = tree.root.findAllByType(TextInput);
    expect(emailInput.props.value).toBe('');
    expect(passwordInput.props.value).toBe('');
  });
});

describe.each([
  ['correo y contraseña', 'email'],
  ['Google', 'google'],
])('Verificación de rol con %s', (_label: string, method: string) => {
  async function login(tree: ReactTestRenderer, uid: string) {
    if (method === 'email') {
      await loginWithEmail(tree, `${uid}@oceaneyes.test`);
    } else {
      mockSignInWithGoogleWeb.mockResolvedValueOnce({ uid });
      await pressButton(tree, 'Continuar con Google');
    }
  }

  it('admin entra a /admin', async () => {
    const tree = render();
    await login(tree, 'admin');
    expect(mockReplace).toHaveBeenCalledWith('/admin');
    expect(mockLogout).not.toHaveBeenCalled();
    expect(errorText(tree)).toBeUndefined();
  });

  it('municipal entra a /admin/municipio', async () => {
    const tree = render();
    await login(tree, 'muni');
    expect(mockReplace).toHaveBeenCalledWith('/admin/municipio');
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("rol 'user' se rechaza: logout() y Acceso denegado", async () => {
    const tree = render();
    await login(tree, 'citizen');
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(errorText(tree)).toBe(DENIED);
  });

  it('cuenta sin perfil se rechaza sin crearle uno', async () => {
    const tree = render();
    await login(tree, 'nuevo');
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(errorText(tree)).toBe(DENIED);
    expect(mockCreateProfile).not.toHaveBeenCalled();
    expect(mockProfiles.has('nuevo')).toBe(false);
  });
});

describe('Errores del popup de Google', () => {
  it.each([
    ['auth/popup-closed-by-user', 'Cerraste la ventana de Google antes de terminar. Vuelve a intentarlo.'],
    [
      'auth/popup-blocked',
      'El navegador bloqueó la ventana de Google. Permite las ventanas emergentes para este sitio y vuelve a intentarlo.',
    ],
  ])('%s muestra un mensaje en español', async (code, message) => {
    mockSignInWithGoogleWeb.mockRejectedValueOnce(Object.assign(new Error(code), { code }));
    const tree = render();
    await pressButton(tree, 'Continuar con Google');
    expect(errorText(tree)).toBe(message);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
