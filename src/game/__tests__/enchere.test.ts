import {
  createEnchereState,
  foldBid,
  isBidValid,
  isEnchereTimeExpired,
  placeBid,
  resolveEnchere,
  tickEnchere,
} from '../enchere';

describe('Enchere mode', () => {
  it('rejects invalid bids', () => {
    expect(isBidValid(0, 0)).toBe(false);
    expect(isBidValid(3, 3)).toBe(false);
    expect(isBidValid(4, 3)).toBe(true);
  });

  it('places bids and alternates active bidder', () => {
    let state = createEnchereState('playerA', 'playerB');
    state = placeBid(state, 'playerA', 2, 'playerB');
    expect(state.currentBid).toBe(2);
    expect(state.activeBidderId).toBe('playerB');
  });

  it('enters answering phase on fold with promised count', () => {
    const bidding = placeBid(createEnchereState('playerA', 'playerB'), 'playerA', 5, 'playerB');
    const answering = foldBid(bidding, 'playerB', 'playerA', 5, 60);
    expect(answering.phase).toBe('answering');
    expect(answering.promisedCount).toBe(5);
    expect(answering.winnerId).toBe('playerA');
    expect(answering.timeRemaining).toBe(60);
  });

  it('resolves in favor of bidder when promise is met', () => {
    const state = {
      ...foldBid(createEnchereState('playerA', 'playerB'), 'playerB', 'playerA', 2, 30),
      answersGiven: ['a', 'b'],
    };
    expect(resolveEnchere(state, 'playerA', 'playerB')).toBe('playerA');
  });

  it('resolves in favor of folder when promise is missed', () => {
    const state = {
      ...foldBid(createEnchereState('playerA', 'playerB'), 'playerB', 'playerA', 3, 30),
      answersGiven: ['a'],
    };
    expect(resolveEnchere(state, 'playerA', 'playerB')).toBe('playerB');
  });

  it('ticks only during answering phase', () => {
    const bidding = createEnchereState('playerA', 'playerB');
    expect(tickEnchere(bidding).timeRemaining).toBe(0);

    const answering = foldBid(bidding, 'playerA', 'playerB', 1, 2);
    const ticked = tickEnchere(answering);
    expect(ticked.timeRemaining).toBe(1);
    expect(isEnchereTimeExpired(tickEnchere(ticked))).toBe(true);
  });
});
