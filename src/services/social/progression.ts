import { UserProfile } from '@/models';
import { upsertUserProfile } from '@/services/firebase/database';

export const XP_PER_WIN = 100;
export const XP_PER_LOSS = 30;
export const XP_PER_DRAW = 50;
export const XP_BASE_LEVEL = 1000; // XP nécessaire pour le niveau 1

/** Calcule l'XP nécessaire pour atteindre un niveau donné. */
export function getRequiredXPForLevel(level: number): number {
  return Math.floor(XP_BASE_LEVEL * Math.pow(1.1, level - 1));
}

/** Calcule le nouveau niveau et l'XP restante après un gain. */
export function calculateProgression(currentXP: number, currentLevel: number, gain: number): { xp: number, level: number, leveledUp: boolean } {
  let totalXP = currentXP + gain;
  let level = currentLevel;
  let leveledUp = false;

  while (totalXP >= getRequiredXPForLevel(level)) {
    totalXP -= getRequiredXPForLevel(level);
    level++;
    leveledUp = true;
  }

  return { xp: totalXP, level, leveledUp };
}

/** Met à jour le profil utilisateur avec les gains de la partie. */
export async function updateProgressionAfterMatch(profile: UserProfile, result: 'win' | 'loss' | 'draw'): Promise<{ leveledUp: boolean, xpGain: number }> {
  const xpGain = result === 'win' ? XP_PER_WIN : result === 'draw' ? XP_PER_DRAW : XP_PER_LOSS;
  
  const { xp, level, leveledUp } = calculateProgression(profile.xp, profile.xpLevel, xpGain);
  
  const updatedProfile: UserProfile = {
    ...profile,
    xp,
    xpLevel: level,
    wins: result === 'win' ? profile.wins + 1 : profile.wins,
    losses: result === 'loss' ? profile.losses + 1 : profile.losses,
    updatedAt: new Date().toISOString(),
  };

  await upsertUserProfile(updatedProfile);
  return { leveledUp, xpGain };
}
