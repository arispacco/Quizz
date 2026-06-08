import database from '@react-native-firebase/database';
import { v4 as uuidv4 } from 'uuid';
import type { ActivityItem } from '@/models';
import { ensureFirebase } from '@/services/firebase/config';

export async function publishActivity(
  item: Omit<ActivityItem, 'id' | 'createdAt'>,
): Promise<void> {
  if (!ensureFirebase()) return;
  const id = uuidv4();
  await database()
    .ref(`activities/${item.userId}/${id}`)
    .set({ ...item, id, createdAt: new Date().toISOString() });
}

export async function getFeed(userIds: string[]): Promise<ActivityItem[]> {
  if (!ensureFirebase() || userIds.length === 0) return [];
  const items: ActivityItem[] = [];
  for (const uid of userIds) {
    const snap = await database().ref(`activities/${uid}`).limitToLast(10).once('value');
    snap.forEach(child => {
      items.push(child.val() as ActivityItem);
      return true;
    });
  }
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
