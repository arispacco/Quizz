import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { UserProfile } from '@/models';
import {
  mapAuthUserToProfile,
  onAuthStateChanged,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  resetPassword,
  type AuthUser,
} from '@/services/firebase/auth';
import { upsertUserProfile } from '@/services/firebase/database';
import { isFirebaseReady } from '@/services/firebase/config';

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, pseudo: string) => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_PROFILE: UserProfile = {
  id: 'demo-user',
  pseudo: 'Joueur Démo',
  email: 'demo@lejeu.app',
  xp: 120,
  xpLevel: 3,
  elo: 1250,
  wins: 12,
  losses: 8,
  followersCount: 5,
  followingCount: 3,
  friendsCount: 2,
  preferredThemes: ['Culture Générale'],
  currentValue: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseReady());

  useEffect(() => {
    if (!isFirebaseReady()) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(async authUser => {
      setUser(authUser);
      if (authUser) {
        setProfile(mapAuthUserToProfile(authUser));
        setIsDemoMode(false);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile: isDemoMode ? DEMO_PROFILE : profile,
      loading,
      isDemoMode,
      signIn: async (email, password) => {
        await signInWithEmail(email, password);
      },
      signUp: async (email, password, pseudo) => {
        const cred = await signUpWithEmail(email, password, pseudo);
        const newProfile = mapAuthUserToProfile(cred.user);
        newProfile.pseudo = pseudo;
        if (isFirebaseReady()) {
          await upsertUserProfile(newProfile);
        }
      },
      sendReset: async email => {
        await resetPassword(email);
      },
      logout: async () => {
        if (isDemoMode) {
          setIsDemoMode(false);
          setProfile(null);
          return;
        }
        await signOut();
      },
      enterDemoMode: () => {
        setIsDemoMode(true);
        setProfile(DEMO_PROFILE);
        setUser(null);
      },
    }),
    [user, profile, loading, isDemoMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
