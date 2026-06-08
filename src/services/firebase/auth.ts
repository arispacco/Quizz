import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import type { UserProfile } from '@/models';
import { ensureFirebase } from './config';

export type AuthUser = FirebaseAuthTypes.User;

export function onAuthStateChanged(callback: (user: AuthUser | null) => void) {
  if (!ensureFirebase()) {
    callback(null);
    return () => {};
  }
  return auth().onAuthStateChanged(callback);
}

export async function signInWithEmail(email: string, password: string) {
  ensureFirebase();
  return auth().signInWithEmailAndPassword(email.trim(), password);
}

export async function signUpWithEmail(email: string, password: string, pseudo: string) {
  ensureFirebase();
  const cred = await auth().createUserWithEmailAndPassword(email.trim(), password);
  await cred.user.updateProfile({ displayName: pseudo });
  return cred;
}

export async function resetPassword(email: string) {
  ensureFirebase();
  return auth().sendPasswordResetEmail(email.trim());
}

export async function signOut() {
  if (!ensureFirebase()) return;
  return auth().signOut();
}

export function getCurrentUser(): AuthUser | null {
  if (!ensureFirebase()) return null;
  return auth().currentUser;
}

export function mapAuthUserToProfile(user: AuthUser): UserProfile {
  const now = new Date().toISOString();
  return {
    id: user.uid,
    pseudo: user.displayName ?? user.email?.split('@')[0] ?? 'Joueur',
    email: user.email ?? '',
    xp: 0,
    xpLevel: 1,
    elo: 1200,
    wins: 0,
    losses: 0,
    followersCount: 0,
    followingCount: 0,
    friendsCount: 0,
    preferredThemes: [],
    currentValue: 0,
    createdAt: now,
    updatedAt: now,
  };
}
