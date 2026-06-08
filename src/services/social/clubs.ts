import database from '@react-native-firebase/database';
import { v4 as uuidv4 } from 'uuid';
import type { Club } from '@/models';
import { ensureFirebase } from '@/services/firebase/config';

export async function createClub(
  adminId: string,
  name: string,
  description: string,
  color: string,
  access: Club['access'],
): Promise<Club> {
  const id = uuidv4();
  const now = new Date().toISOString();
  const club: Club = {
    id,
    name,
    description,
    color,
    memberCount: 1,
    access,
    adminIds: [adminId],
    createdAt: now,
  };
  if (ensureFirebase()) {
    await database().ref(`clubs/${id}`).set(club);
    await database().ref(`clubMembers/${id}/${adminId}`).set({ role: 'admin', joinedAt: now });
  }
  return club;
}

export async function joinClub(clubId: string, userId: string): Promise<void> {
  if (!ensureFirebase()) return;
  const now = new Date().toISOString();
  await database().ref(`clubMembers/${clubId}/${userId}`).set({ role: 'member', joinedAt: now });
  await database()
    .ref(`clubs/${clubId}/memberCount`)
    .transaction(count => (count ?? 0) + 1);
}

export async function getClub(clubId: string): Promise<Club | null> {
  if (!ensureFirebase()) return null;
  const snap = await database().ref(`clubs/${clubId}`).once('value');
  return snap.exists() ? ({ id: clubId, ...snap.val() } as Club) : null;
}
