import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { firebaseAuth, firestore } from './app';
import { getUserProfile } from './auth';
import type { UserProfile } from './types';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => undefined,
});

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!firebaseAuth?.currentUser) {
      setProfile(null);
      return;
    }
    setProfile(await getUserProfile(firebaseAuth.currentUser.uid));
  }, []);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    let profileUnsub: (() => void) | undefined;
    let firstProfileResolved = false;

    const authUnsub = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      profileUnsub?.();
      profileUnsub = undefined;
      setProfile(null);
      firstProfileResolved = false;

      if (!nextUser) {
        setLoading(false);
        return;
      }

      profileUnsub = onSnapshot(
        doc(firestore, 'users', nextUser.uid),
        (snapshot) => {
          setProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : null);
          if (!firstProfileResolved) {
            firstProfileResolved = true;
            setLoading(false);
          }
        },
        () => {
          setProfile(null);
          if (!firstProfileResolved) {
            firstProfileResolved = true;
            setLoading(false);
          }
        },
      );
    });

    return () => {
      profileUnsub?.();
      authUnsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
