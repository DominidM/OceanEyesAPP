import { onAuthStateChanged, type User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { firebaseAuth } from './app';
import { getUserProfile } from './auth';
import type { UserProfile } from './types';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setUser(nextUser);
      setProfile(nextUser ? await getUserProfile(nextUser.uid) : null);
      setLoading(false);
    });
  }, []);

  return <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
