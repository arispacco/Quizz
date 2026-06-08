import {
  buzzExchange,
  createExchangeState,
  isExchangeTimeExpired,
  submitExchangeAnswer,
  tickExchange,
} from '../exchange';

describe('Exchange mode', () => {
  it('creates state with timer and no buzz', () => {
    const state = createExchangeState('playerA', 30);
    expect(state.timeRemaining).toBe(30);
    expect(state.buzzed).toBe(false);
    expect(state.activePlayerId).toBe('playerA');
  });

  it('ticks down without going below zero', () => {
    const state = tickExchange({ ...createExchangeState('playerA', 1) });
    expect(state.timeRemaining).toBe(0);
    expect(isExchangeTimeExpired(state)).toBe(true);
    expect(tickExchange(state).timeRemaining).toBe(0);
  });

  it('records answers and switches active player', () => {
    const state = submitExchangeAnswer(
      createExchangeState('playerA', 30),
      'playerA',
      'banane',
      true,
      'playerB',
      25,
    );
    expect(state.answers).toHaveLength(1);
    expect(state.activePlayerId).toBe('playerB');
    expect(state.timeRemaining).toBe(25);
    expect(state.buzzed).toBe(false);
  });

  it('buzzes to opponent without resetting timer', () => {
    const base = createExchangeState('playerA', 12);
    const buzzed = buzzExchange(base, 'playerB');
    expect(buzzed.activePlayerId).toBe('playerB');
    expect(buzzed.timeRemaining).toBe(12);
    expect(buzzed.buzzed).toBe(true);
  });
});
