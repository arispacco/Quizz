import type { Bid, EnchereState } from '@/models';

export function createEnchereState(
  firstBidderId: string,
  _secondPlayerId: string,
): EnchereState {
  return {
    phase: 'bidding',
    bids: [],
    currentBid: 0,
    activeBidderId: firstBidderId,
    promisedCount: 0,
    answersGiven: [],
    timeRemaining: 0,
    winnerId: undefined,
  };
}

export function placeBid(
  state: EnchereState,
  playerId: string,
  amount: number,
  nextBidderId: string,
): EnchereState {
  const bid: Bid = {
    playerId,
    amount,
    folded: false,
    timestamp: new Date().toISOString(),
  };
  return {
    ...state,
    bids: [...state.bids, bid],
    currentBid: amount,
    activeBidderId: nextBidderId,
  };
}

export function foldBid(
  state: EnchereState,
  playerId: string,
  winnerId: string,
  promisedCount: number,
  timeSeconds: number,
): EnchereState {
  const foldBidEntry: Bid = {
    playerId,
    amount: state.currentBid,
    folded: true,
    timestamp: new Date().toISOString(),
  };
  return {
    ...state,
    phase: 'answering',
    bids: [...state.bids, foldBidEntry],
    winnerId,
    promisedCount,
    activeBidderId: winnerId,
    timeRemaining: timeSeconds,
    answersGiven: [],
  };
}

export function submitEnchereAnswer(state: EnchereState, answer: string): EnchereState {
  return {
    ...state,
    answersGiven: [...state.answersGiven, answer],
  };
}

export function tickEnchere(state: EnchereState): EnchereState {
  if (state.phase !== 'answering') return state;
  return {
    ...state,
    timeRemaining: Math.max(0, state.timeRemaining - 1),
  };
}

export function resolveEnchere(
  state: EnchereState,
  playerAId: string,
  playerBId: string,
): string {
  const winner = state.winnerId ?? playerAId;
  const folder = winner === playerAId ? playerBId : playerAId;
  const validAnswers = state.answersGiven.length;
  if (validAnswers >= state.promisedCount) {
    return winner;
  }
  return folder;
}

export function isBidValid(amount: number, currentBid: number): boolean {
  return amount > currentBid && amount > 0;
}

export function isEnchereTimeExpired(state: EnchereState): boolean {
  return state.phase === 'answering' && state.timeRemaining <= 0;
}
