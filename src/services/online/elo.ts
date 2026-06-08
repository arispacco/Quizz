const K_FACTOR = 32;

export function calculateElo(
  playerElo: number,
  opponentElo: number,
  result: 'win' | 'loss' | 'draw',
): { newElo: number; delta: number } {
  const expected =
    1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actual = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
  const delta = Math.round(K_FACTOR * (actual - expected));
  return { newElo: playerElo + delta, delta };
}

export function getEloTier(elo: number): string {
  if (elo >= 1800) return 'Maître';
  if (elo >= 1600) return 'Expert';
  if (elo >= 1400) return 'Confirmé';
  if (elo >= 1200) return 'Intermédiaire';
  return 'Débutant';
}
