/**
 * PU-01 Registro válido
 * PU-02 Contraseña con menos de 8 caracteres (registro, vinculación y gateway municipal)
 *
 * Unidad bajo prueba: src/mobile/modules/auth/presentation/viewmodels/login.viewmodel.ts
 */
import { describe, expect, it, jest } from '@jest/globals';
import { LoginViewModel, type LoginDeps } from '@/modules/auth/presentation/viewmodels/login.viewmodel';
import { handleAuthSignup } from '@shared/gateway/municipal-signup';

function makeDeps(overrides: Partial<LoginDeps> = {}): LoginDeps {
  return {
    isFirebaseConfigured: () => true,
    isGoogleSignInAvailable: () => false,
    canLinkAccount: () => false,
    loginWithEmail: jest.fn(async () => ({ uid: 'u1' }) as never),
    registerUser: jest.fn(async () => ({ uid: 'u1' }) as never),
    linkAccountWithEmail: jest.fn(async () => ({ uid: 'u1' }) as never),
    linkAccountWithGoogle: jest.fn(async () => null),
    signInAsGuest: jest.fn(async () => undefined),
    signInWithGoogle: jest.fn(async () => null),
    onAuthenticated: jest.fn(),
    ...overrides,
  };
}

function fillForm(vm: LoginViewModel, password: string) {
  vm.setRegistering(true);
  vm.setDisplayName('Pescador Demo');
  vm.setDni('12345678');
  vm.setEmail('  demo@oceaneyes.pe ');
  vm.setPassword(password);
}

describe('PU-01 registro válido', () => {
  it('llama a registerUser con los datos normalizados y navega al home', async () => {
    const deps = makeDeps();
    const vm = new LoginViewModel(deps);
    fillForm(vm, 'Segura123!');

    await vm.submit();

    expect(deps.registerUser).toHaveBeenCalledWith({
      email: 'demo@oceaneyes.pe',
      password: 'Segura123!',
      displayName: 'Pescador Demo',
      profileType: 'citizen',
      dni: '12345678',
    });
    expect(deps.onAuthenticated).toHaveBeenCalledTimes(1);
    expect(vm.getState().error).toBe('');
  });
});

describe('PU-02 contraseña con menos de 8 caracteres', () => {
  it('rechaza la contraseña de 7 caracteres sin llamar a Firebase', async () => {
    const deps = makeDeps();
    const vm = new LoginViewModel(deps);
    fillForm(vm, 'Abc1234');

    await vm.submit();

    expect(deps.registerUser).not.toHaveBeenCalled();
    expect(vm.getState().error).not.toBe('');
  });
});

describe('PU-02 política de contraseña en vinculación y gateway', () => {
  it('rechaza vincular una cuenta invitada con contraseña de 7 caracteres', async () => {
    const deps = makeDeps();
    const vm = new LoginViewModel(deps);
    vm.setDisplayName('Invitado');
    vm.setEmail('inv@oceaneyes.pe');
    vm.setPassword('Abc1234');

    await vm.submitLink();

    expect(deps.linkAccountWithEmail).not.toHaveBeenCalled();
    expect(vm.getState().error).toMatch(/al menos 8 caracteres/);
  });

  it('el gateway /api/auth/signup responde 400 auth/weak-password sin llamar a Identity Toolkit', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');
    const request = new Request('https://x/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: 'muni@oceaneyes.pe', password: 'Abc1234' }),
    });

    const response = await handleAuthSignup(request, { FIREBASE_API_KEY: 'fake' });
    const body = (await response.json()) as { code: string; message: string };

    expect(response.status).toBe(400);
    expect(body.code).toBe('auth/weak-password');
    expect(body.message).toMatch(/al menos 8 caracteres/);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
