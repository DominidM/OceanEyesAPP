import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { firebaseAuth, firestore } from './app';
import type { ProfileType, UserProfile } from './types';

function requireAuth() {
  if (!firebaseAuth) throw new Error('Firebase no está configurado.');
  return firebaseAuth;
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

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(requireAuth(), email, password);
  return credential.user;
}

export async function signInAsGuest() {
  await signInAnonymously(requireAuth());
}

export async function logout() {
  await signOut(requireAuth());
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
