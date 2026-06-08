import type { TournamentPhase } from '@/models';

export const TOKEN_REWARDS = {
  roundWin: 1,
  duelWinGroups: 1,
  duelWinQuarters: 2,
  duelWinSemis: 3,
  duelWinFinal: 5,
  highBidWin: 1,
  broaderThemeWin: 1,
} as const;

export const TOKEN_COSTS = {
  quarters: 2,
  semis: 4,
  final: 6,
} as const;

export function getDuelWinBonus(phase: TournamentPhase): number {
  switch (phase) {
    case 'groups':
      return TOKEN_REWARDS.duelWinGroups;
    case 'quarters':
      return TOKEN_REWARDS.duelWinQuarters;
    case 'semis':
      return TOKEN_REWARDS.duelWinSemis;
    case 'final':
      return TOKEN_REWARDS.duelWinFinal;
    default:
      return 0;
  }
}

export function getPhaseAccessCost(phase: TournamentPhase): number {
  switch (phase) {
    case 'quarters':
      return TOKEN_COSTS.quarters;
    case 'semis':
      return TOKEN_COSTS.semis;
    case 'final':
      return TOKEN_COSTS.final;
    default:
      return 0;
  }
}

export function canAffordPhase(tokens: number, phase: TournamentPhase): boolean {
  return tokens >= getPhaseAccessCost(phase);
}
