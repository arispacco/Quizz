import database from '@react-native-firebase/database';
import { RTDB_PATHS, type Duel, type Match, type UserProfile } from '@/models';
import { ensureFirebase } from './config';

function ref(path: string) {
  ensureFirebase();
  return database().ref(path);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await ref(`users/${userId}`).once('value');
  if (!snap.exists()) return null;
  return { id: userId, ...snap.val() } as UserProfile;
}

export async function upsertUserProfile(profile: UserProfile): Promise<void> {
  const { id, ...data } = profile;
  await ref(`users/${id}`).set(data);
}

export async function searchUsers(pseudoPrefix: string): Promise<UserProfile[]> {
  const snap = await ref('users')
    .orderByChild('pseudo')
    .startAt(pseudoPrefix)
    .endAt(pseudoPrefix + '\uf8ff')
    .limitToFirst(20)
    .once('value');
  
  if (!snap.exists()) return [];
  const users: UserProfile[] = [];
  snap.forEach(child => {
    users.push({ id: child.key!, ...child.val() } as UserProfile);
    return true;
  });
  return users;
}

export async function createMatch(match: Match): Promise<void> {
  const { id, ...data } = match;
  await ref(`matches/${id}`).set(data);
}

export async function updateMatch(matchId: string, patch: Partial<Match>): Promise<void> {
  await ref(`matches/${matchId}`).update(patch);
}

export function subscribeToMatch(matchId: string, cb: (match: Match | null) => void) {
  const listener = ref(`matches/${matchId}`).on('value', snap => {
    cb(snap.exists() ? ({ id: matchId, ...snap.val() } as Match) : null);
  });
  return () => ref(`matches/${matchId}`).off('value', listener);
}

export async function createDuel(duel: Duel): Promise<void> {
  const { id, ...data } = duel;
  await ref(`duels/${id}`).set(data);
}

export async function updateDuel(duelId: string, patch: Partial<Duel>): Promise<void> {
  await ref(`duels/${duelId}`).update(patch);
}

export function subscribeToDuel(duelId: string, cb: (duel: Duel | null) => void) {
  const listener = ref(`duels/${duelId}`).on('value', snap => {
    cb(snap.exists() ? ({ id: duelId, ...snap.val() } as Duel) : null);
  });
  return () => ref(`duels/${duelId}`).off('value', listener);
}

export function subscribeToBracket(bracketId: string, cb: (bracket: any | null) => void) {
  const listener = ref(`brackets/${bracketId}`).on('value', snap => {
    cb(snap.exists() ? ({ id: bracketId, ...snap.val() }) : null);
  });
  return () => ref(`brackets/${bracketId}`).off('value', listener);
}

export async function createBracket(bracket: any): Promise<void> {
  const { id, ...data } = bracket;
  await ref(`brackets/${id}`).set(data);
}

export async function updateBracket(bracketId: string, patch: any): Promise<void> {
  await ref(`brackets/${bracketId}`).update(patch);
}

export async function setPresence(userId: string, online: boolean): Promise<void> {
  await ref(`presence/${userId}`).set({ online, updatedAt: new Date().toISOString() });
}

export { RTDB_PATHS };
