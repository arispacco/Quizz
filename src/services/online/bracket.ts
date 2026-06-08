import { v4 as uuidv4 } from 'uuid';
import type { Bracket, BracketMatch, Team, TournamentFormat } from '@/models';

export function generateBracket(
  matchId: string,
  teams: Team[],
  format: TournamentFormat,
): Bracket {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const matches: BracketMatch[] = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    matches.push({
      id: uuidv4(),
      round: 1,
      teamAId: shuffled[i]?.id,
      teamBId: shuffled[i + 1]?.id,
      status: 'pending',
    });
  }

  return {
    id: uuidv4(),
    matchId,
    format,
    matches,
    currentPhase: 'groups',
  };
}

export function advanceWinner(bracket: Bracket, matchId: string, winnerTeamId: string): Bracket {
  const matches = bracket.matches.map(m =>
    m.id === matchId
      ? { ...m, winnerTeamId, status: 'completed' as const }
      : m,
  );
  return { ...bracket, matches };
}

export function getActiveMatch(bracket: Bracket): BracketMatch | undefined {
  return bracket.matches.find(m => m.status === 'in_progress') ??
    bracket.matches.find(m => m.status === 'pending');
}
