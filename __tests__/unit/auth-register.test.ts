/**
 * PU-01 Registro válido
 * PU-02 Contraseña con menos de 8 caracteres
 *
 * Unidad bajo prueba: src/mobile/modules/auth/presentation/viewmodels/login.viewmodel.ts
 */
import { describe, expect, it, jest } from '@jest/globals';
import { LoginViewModel, type LoginDeps } from '@/modules/auth/presentation/viewmodels/login.viewmodel';

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
