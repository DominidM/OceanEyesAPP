import type { User } from 'firebase/auth';

import type { ProfileType } from '@/shared/firebase/types';
import { ViewModel } from '@/shared/viewmodels/view-model';

export type LoginDeps = {
  isFirebaseConfigured: () => boolean;
  isGoogleSignInAvailable: () => boolean;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  registerUser: (input: {
    email: string;
    password: string;
    displayName: string;
    profileType: ProfileType;
    dni?: string;
  }) => Promise<User>;
  signInAsGuest: () => Promise<void>;
  signInWithGoogle: () => Promise<User | null>;
  onAuthenticated: () => void;
};

export type LoginState = {
  registering: boolean;
  displayName: string;
  profileType: ProfileType;
  dni: string;
  email: string;
  password: string;
  error: string;
  busy: boolean;
};

const initialState: LoginState = {
  registering: false,
  displayName: '',
  profileType: 'citizen',
  dni: '',
  email: '',
  password: '',
  error: '',
  busy: false,
};

export class LoginViewModel extends ViewModel<LoginState, LoginDeps> {
  constructor(deps: LoginDeps) {
    super(initialState, deps);
  }

  setRegistering = (registering: boolean) => {
    this.setState({ registering, error: '' });
  };

  toggleRegistering = () => {
    this.setState({ registering: !this.state.registering, error: '' });
  };

  setDisplayName = (displayName: string) => {
    this.setState({ displayName });
  };

  setProfileType = (profileType: ProfileType) => {
    this.setState({ profileType });
  };

  setDni = (value: string) => {
    this.setState({ dni: value.replace(/\D/g, '').slice(0, 8) });
  };

  setEmail = (email: string) => {
    this.setState({ email });
  };

  setPassword = (password: string) => {
    this.setState({ password });
  };

  submit = async () => {
    const { registering, displayName, dni, email, password } = this.state;
    this.setState({ error: '' });
    if (!this.deps.isFirebaseConfigured()) {
      this.setState({ error: 'Firebase aún no está configurado. Completa el archivo .env.local.' });
      return;
    }
    if (registering && !displayName.trim()) {
      this.setState({ error: 'Ingresa tu nombre o alias.' });
      return;
    }
    if (registering && dni && !/^\d{8}$/.test(dni)) {
      this.setState({ error: 'El DNI debe tener 8 dígitos.' });
      return;
    }

    this.setState({ busy: true });
    try {
      if (registering) {
        await this.deps.registerUser({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
          profileType: this.state.profileType,
          dni: dni || undefined,
        });
      } else {
        await this.deps.loginWithEmail(email.trim(), password);
      }
      this.deps.onAuthenticated();
    } catch {
      this.setState({ error: 'No se pudo completar el acceso. Revisa tus datos e inténtalo nuevamente.' });
    } finally {
      this.setState({ busy: false });
    }
  };

  submitAsGuest = async () => {
    // Invitado: se crea una sesión anónima en Firebase (requiere habilitar el sign-in
    // anónimo en Firebase Auth). Si no está configurado o falla, se continúa localmente.
    if (this.deps.isFirebaseConfigured()) {
      try {
        await this.deps.signInAsGuest();
      } catch {
        // Sin sesión anónima: seguimos como invitado local.
      }
    }
    this.deps.onAuthenticated();
  };

  // TEMPORAL: acceso directo al dashboard sin autenticación (solo dev).
  temporaryEnter = () => {
    this.deps.onAuthenticated();
  };

  submitWithGoogle = async () => {
    this.setState({ error: '' });
    if (!this.deps.isFirebaseConfigured()) {
      this.setState({ error: 'Firebase aún no está configurado. Completa el archivo .env.local.' });
      return;
    }
    if (!this.deps.isGoogleSignInAvailable()) {
      this.setState({ error: 'Google Sign-In requiere una development build. Ejecuta npx expo run:android.' });
      return;
    }
    this.setState({ busy: true });
    try {
      const user = await this.deps.signInWithGoogle();
      if (user) this.deps.onAuthenticated();
    } catch (e) {
      this.setState({
        error:
          e instanceof Error && e.message
            ? `Error: ${e.message}`
            : 'No se pudo iniciar sesión con Google. Inténtalo nuevamente.',
      });
    } finally {
      this.setState({ busy: false });
    }
  };
}
