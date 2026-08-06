import {
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

import { firebaseAuth, firestore } from './app';
import type { ProfileType, UserProfile } from './types';

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

function requireAuth() {
  if (!firebaseAuth) throw new Error('Firebase no está configurado.');
  return firebaseAuth;
}

export function isGoogleSignInAvailable() {
  if (Platform.OS === 'web') return false;
  try {
    return TurboModuleRegistry.get('RNGoogleSignin') != null || NativeModules.RNGoogleSignin != null;
  } catch {
    return false;
  }
}

export async function isAppleSignInAvailable() {
  if (Platform.OS !== 'ios') return false;
  try {
    const AppleAuthentication = await import('expo-apple-authentication');
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

async function loadGoogleSignin() {
  if (!isGoogleSignInAvailable()) {
    throw new Error('Google Sign-In requiere una development build. Ejecuta npx expo run:ios o run:android.');
  }
  try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    return GoogleSignin;
  } catch {
    throw new Error('No se pudo cargar Google Sign-In en esta build.');
  }
}

function configureGoogleSignin(GoogleSignin: typeof import('@react-native-google-signin/google-signin')['GoogleSignin']) {
  const required = Platform.OS === 'android' ? googleWebClientId : googleIosClientId;
  if (!required) {
    throw new Error(
      `Google Sign-In aún no está configurado. Completa ${Platform.OS === 'android' ? 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID' : 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'} en el archivo .env.`,
    );
  }
  GoogleSignin.configure({
    webClientId: googleWebClientId || undefined,
    iosClientId: googleIosClientId || undefined,
    offlineAccess: false,
  });
}

async function ensureUserProfile(user: { uid: string; email: string | null; displayName: string | null }) {
  const reference = doc(firestore, 'users', user.uid);
  const snapshot = await getDoc(reference);
  if (snapshot.exists()) return;
  await setDoc(reference, {
    role: 'user',
    profileType: 'citizen',
    displayName: user.displayName ?? 'Usuario',
    email: user.email,
    dni: null,
    pointsBalance: 0,
    totalPointsEarned: 0,
    verifiedReportsCount: 0,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
  profileType: ProfileType;
  dni?: string;
}) {
  const credential = await createUserWithEmailAndPassword(requireAuth(), input.email, input.password);
  await updateProfile(credential.user, { displayName: input.displayName });

  await setDoc(doc(firestore, 'users', credential.user.uid), {
    role: 'user',
    profileType: input.profileType,
    displayName: input.displayName,
    email: input.email,
    dni: input.dni ?? null,
    pointsBalance: 0,
    totalPointsEarned: 0,
    verifiedReportsCount: 0,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return credential.user;
}

let adminSession: { email: string; password: string } | null = null;

export function rememberAdminSession(email: string, password: string) {
  adminSession = { email, password };
}

export async function createUserByAdmin(input: {
  email: string;
  password: string;
  displayName: string;
  profileType: ProfileType;
  dni?: string;
}) {
  const credential = await createUserWithEmailAndPassword(requireAuth(), input.email, input.password);
  await updateProfile(credential.user, { displayName: input.displayName });

  await setDoc(doc(firestore, 'users', credential.user.uid), {
    role: 'user',
    profileType: input.profileType,
    displayName: input.displayName,
    email: input.email,
    dni: input.dni ?? null,
    pointsBalance: 0,
    totalPointsEarned: 0,
    verifiedReportsCount: 0,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (adminSession) {
    try {
      await signInWithEmailAndPassword(requireAuth(), adminSession.email, adminSession.password);
    } catch {
      // Si falla el re-inicio de sesión, el admin deberá volver a entrar.
    }
  }

  return credential.user.uid;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(requireAuth(), email, password);
  return credential.user;
}

export async function signInAsGuest() {
  await signInAnonymously(requireAuth());
}

export async function signInWithGoogle() {
  if (Platform.OS === 'web') {
    throw new Error('Iniciar sesión con Google solo está disponible en dispositivos móviles.');
  }
  const GoogleSignin = await loadGoogleSignin();
  configureGoogleSignin(GoogleSignin);
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const response = await GoogleSignin.signIn();
  if (response.type === 'cancelled') return null;

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error('No se pudo obtener el token de Google. Revisa las claves EXPO_PUBLIC_GOOGLE_* en el archivo .env.');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const { user } = await signInWithCredential(requireAuth(), credential);
  await ensureUserProfile(user);
  return user;
}

export async function signInWithGoogleIdToken(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const { user } = await signInWithCredential(requireAuth(), credential);
  await ensureUserProfile(user);
  return user;
}

export async function signInWithApple() {
  if (Platform.OS !== 'ios') {
    throw new Error('Iniciar sesión con Apple solo está disponible en iOS.');
  }
  const AppleAuthentication = await import('expo-apple-authentication');

  const apple = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!apple.identityToken) {
    throw new Error('No se pudo obtener el token de Apple. Revisa la configuración de Sign in with Apple.');
  }

  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('fullName');
  const credential = provider.credential({
    idToken: apple.identityToken,
  });

  const { user } = await signInWithCredential(requireAuth(), credential);
  if (apple.fullName?.givenName || apple.fullName?.familyName) {
    const name = [apple.fullName.givenName, apple.fullName.familyName].filter(Boolean).join(' ');
    await updateProfile(user, { displayName: name }).catch(() => {});
  }
  await ensureUserProfile(user);
  return user;
}

export async function logout() {
  await signOut(requireAuth());
  if (Platform.OS !== 'web') {
    try {
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      await GoogleSignin.signOut();
    } catch {
      // El módulo nativo no está disponible en esta build; no bloquea el cierre de sesión.
    }
  }
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(firestore, 'users', uid));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, changes: Partial<Pick<UserProfile, 'displayName' | 'dni' | 'phone' | 'profileType'>>) {
  await updateDoc(doc(firestore, 'users', uid), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const auth = requireAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Inicia sesión para cambiar tu contraseña.');
  }
  const usesPassword = user.providerData.some((provider) => provider.providerId === 'password');
  if (!usesPassword) {
    throw new Error('Tu cuenta no usa contraseña. Inicia sesión con Google o Apple para continuar.');
  }
  await reauthenticateWithCredential(
    user,
    EmailAuthProvider.credential(user.email ?? '', currentPassword),
  );
  await updatePassword(user, newPassword);
}

export async function setUserStatus(
  uid: string,
  status: UserProfile['status'],
  options?: { reason?: string; adminUid?: string },
): Promise<void> {
  await updateDoc(doc(firestore, 'users', uid), {
    status,
    banReason: status === 'suspended' ? options?.reason ?? null : null,
    bannedBy: status === 'suspended' ? options?.adminUid ?? null : null,
    bannedAt: status === 'suspended' ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}
