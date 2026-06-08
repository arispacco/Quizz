import database from '@react-native-firebase/database';
import { v4 as uuidv4 } from 'uuid';
import type { ConnectionMode, GameFormat, Match, MatchSettings } from '@/models';
import { createMatch, subscribeToMatch, updateMatch } from '@/services/firebase/database';
import { isFirebaseReady } from '@/services/firebase/config';

export interface MatchmakingRequest {
  hostId: string;
  hostPseudo: string;
  format: GameFormat;
  connectionMode: ConnectionMode;
  settings: Partial<MatchSettings>;
}

export async function createOnlineMatch(request: MatchmakingRequest): Promise<Match> {
  const now = new Date().toISOString();
  const matchId = uuidv4();
  const match: Match = {
    id: matchId,
    hostId: request.hostId,
    status: 'lobby',
    settings: {
      format: request.format,
      connectionMode: request.connectionMode,
      teamCount: 2,
      playersPerTeam: request.format === 'face_to_face' ? 1 : 3,
      themePhases: [
        { phase: 'groups', theme: 'Culture Générale', multiplier: 1 },
        { phase: 'final', theme: 'Culture Générale', multiplier: 2 },
      ],
      exchangeTimeSeconds: 30,
      enchereTimeSeconds: 60,
      spectatorsAllowed: true,
      packIds: ['pack-default-1'],
      tournamentFormat: 'groups_then_elimination',
      ...request.settings,
    },
    teams: [],
    players: [
      {
        id: request.hostId,
        pseudo: request.hostPseudo,
        tokens: 0,
        duelsWon: 0,
        value: 0,
      },
    ],
    spectatorLink: `lejeu://spectate/${matchId}`,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseReady()) {
    await createMatch(match);
  }
  return match;
}

export async function joinMatch(matchId: string, playerId: string, pseudo: string): Promise<void> {
  if (!isFirebaseReady()) return;
  return new Promise((resolve, reject) => {
    const unsub = subscribeToMatch(matchId, match => {
      if (!match) {
        unsub();
        reject(new Error('Match introuvable'));
        return;
      }
      const exists = match.players.some(p => p.id === playerId);
      if (!exists) {
        void updateMatch(matchId, {
          players: [
            ...match.players,
            { id: playerId, pseudo, tokens: 0, duelsWon: 0, value: 0 },
          ],
          updatedAt: new Date().toISOString(),
        });
      }
      unsub();
      resolve();
    });
  });
}

export async function startMatch(matchId: string): Promise<void> {
  if (!isFirebaseReady()) return;
  
  const snap = await database().ref(`matches/${matchId}`).once('value');
  const match = { id: matchId, ...snap.val() } as Match;
  
  const patch: Partial<Match> = {
    status: 'in_progress',
    updatedAt: new Date().toISOString(),
  };

  if (match.settings.format === 'tournoi') {
    const bracket = generateBracket(matchId, match.teams, match.settings.tournamentFormat || 'single_elimination');
    await createBracket(bracket);
    patch.bracketId = bracket.id;
  }

  await updateMatch(matchId, patch);
}
