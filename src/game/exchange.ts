import type { ExchangeState } from '@/models';

export function createExchangeState(activePlayerId: string, timeSeconds: number): ExchangeState {
  return {
    activePlayerId,
    answers: [],
    timeRemaining: timeSeconds,
    buzzed: false,
  };
}

export function tickExchange(state: ExchangeState): ExchangeState {
  return {
    ...state,
    timeRemaining: Math.max(0, state.timeRemaining - 1),
  };
}

export function buzzExchange(state: ExchangeState, nextPlayerId: string): ExchangeState {
  return {
    ...state,
    activePlayerId: nextPlayerId,
    timeRemaining: state.timeRemaining,
    buzzed: true,
  };
}

export function submitExchangeAnswer(
  state: ExchangeState,
  playerId: string,
  answer: string,
  valid: boolean,
  nextPlayerId: string,
  resetTime: number,
): ExchangeState {
  return {
    activePlayerId: nextPlayerId,
    answers: [...state.answers, { playerId, answer, valid }],
    timeRemaining: resetTime,
    buzzed: false,
  };
}

export function passExchangeTurn(
  state: ExchangeState,
  loserId: string,
  winnerId: string,
): { state: ExchangeState; winnerId: string } {
  return {
    state: { ...state, activePlayerId: loserId },
    winnerId,
  };
}

export function isExchangeTimeExpired(state: ExchangeState): boolean {
  return state.timeRemaining <= 0;
}
