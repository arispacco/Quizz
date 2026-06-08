import database from '@react-native-firebase/database';
import { ensureFirebase } from '@/services/firebase/config';

export async function followUser(followerId: string, targetId: string): Promise<void> {
  if (!ensureFirebase()) return;
  const now = new Date().toISOString();
  await database().ref(`follows/${followerId}/${targetId}`).set({ since: now });
}

export async function unfollowUser(followerId: string, targetId: string): Promise<void> {
  if (!ensureFirebase()) return;
  await database().ref(`follows/${followerId}/${targetId}`).remove();
}

export async function isFollowing(followerId: string, targetId: string): Promise<boolean> {
  if (!ensureFirebase()) return false;
  const snap = await database().ref(`follows/${followerId}/${targetId}`).once('value');
  return snap.exists();
}

export async function getFollowers(userId: string): Promise<string[]> {
  if (!ensureFirebase()) return [];
  const snap = await database().ref('follows').orderByChild(userId).once('value');
  if (!snap.exists()) return [];
  const followers: string[] = [];
  snap.forEach(child => {
    if (child.child(userId).exists()) {
      followers.push(child.key!);
    }
    return true;
  });
  return followers;
}
