import {
  confirmStrategicChoice,
  createDuel,
  createInitialRound,
  finishRound,
  handleEnchereBid,
  handleEnchereFold,
  handleEnchereTimeout,
  handleExchangeBuzz,
  handleExchangeTimeout,
  isRound3AutoMode,
  pickRound3Mode,
  startNextRound,
  tickEnchereTimer,
  tickExchangeTimer,
} from '../engine';
import type { Question } from '@/models';

const question: Question = {
  id: 'q1',
  intitule: 'Citez des fruits jaunes',
  theme: 'Alimentation',
  difficulty: 2,
  reponses: ['banane', 'citron', 'ananas'],
  createdAt: new Date().toISOString(),
};

describe('Game engine', () => {
  it('creates a duel in choosing state', () => {
    const duel = createDuel('d1', 'm1', 'playerA', 'playerB');
    expect(duel.status).toBe('choosing');
    expect(duel.currentRound.roundNumber).toBe(1);
    expect(duel.currentRound.chooserId).toBe('playerA');
  });

  it('confirms strategic choice and starts exchange', () => {
    let duel = createDuel('d1', 'm1', 'playerA', 'playerB');
    duel = confirmStrategicChoice(duel, 'echange', 'Alimentation', question);
    expect(duel.status).toBe('playing');
    expect(duel.exchange).toBeDefined();
    expect(duel.currentRound.mode).toBe('echange');
  });

  it('finishes duel when player wins 2 rounds', () => {
    let duel = createDuel('d1', 'm1', 'playerA', 'playerB');
    duel = finishRound(duel, 'playerA');
    expect(duel.status).toBe('round_result');
    duel = finishRound({ ...duel, status: 'playing' }, 'playerA');
    expect(duel.status).toBe('finished');
    expect(duel.winnerId).toBe('playerA');
  });

  it('picks unplayed mode for round 3', () => {
    expect(pickRound3Mode(['echange'])).toBe('enchere');
    expect(pickRound3Mode(['enchere'])).toBe('echange');
  });

  it('handles enchere bidding flow', () => {
    let duel = createDuel('d1', 'm1', 'playerA', 'playerB');
    duel = confirmStrategicChoice(duel, 'enchere', 'Alimentation', question);
    duel = handleEnchereBid(duel, 3);
    expect(duel.enchere?.currentBid).toBe(3);
    duel = handleEnchereFold(duel, 60);
    expect(duel.enchere?.phase).toBe('answering');
    expect(duel.enchere?.promisedCount).toBe(3);
  });

  it('ends duel at 2-0 without a third round', () => {
    let duel = createDuel('d1', 'm1', 'playerA', 'playerB');
    duel = finishRound(duel, 'playerA');
    duel = finishRound({ ...duel, status: 'playing' }, 'playerA');
    expect(duel.status).toBe('finished');
    expect(duel.winnerId).toBe('playerA');
    expect(duel.roundWins.playerA).toBe(2);
  });

  it('reaches round 3 at 1-1 with system auto mode', () => {
    let duel = createDuel('d1', 'm1', 'playerA', 'playerB');
    duel = finishRound(duel, 'playerA');
    duel = finishRound({ ...duel, status: 'playing' }, 'playerB');
    expect(duel.status).toBe('round_result');
    expect(duel.currentRound.roundNumber).toBe(3);
    expect(duel.currentRound.mode).toBeDefined();
    expect(isRound3AutoMode(duel.currentRound)).toBe(true);

    duel = startNextRound(duel);
    expect(duel.status).toBe('choosing');
    expect(duel.currentRound.roundNumber).toBe(3);
    expect(duel.currentRound.mode).toBeDefined();
  });

  it('picks tiebreaker mode deterministically when both modes were played', () => {
    expect(pickRound3Mode(['echange', 'enchere'], () => 'echange')).toBe('echange');
    expect(pickRound3Mode(['echange', 'enchere'], () => 'enchere')).toBe('enchere');
  });

  it('creates round 3 with unplayed mode only', () => {
    const round = createInitialRound(3, 'playerA', 'playerB', ['echange']);
    expect(round.mode).toBe('enchere');
    expect(round.chooserId).toBe('system');
  });

  it('finishes exchange round on timer expiry', () => {
    let duel = confirmStrategicChoice(createDuel('d1', 'm1', 'playerA', 'playerB'), 'echange', 'Alimentation', question, 2);
    duel = tickExchangeTimer(duel);
    duel = tickExchangeTimer(duel);
    expect(duel.status).toBe('round_result');
    expect(duel.currentRound.winnerId).toBe('playerB');
  });

  it('does not finish exchange before timer expires unless forced', () => {
    let duel = confirmStrategicChoice(createDuel('d1', 'm1', 'playerA', 'playerB'), 'echange', 'Alimentation', question, 5);
    const unchanged = handleExchangeTimeout(duel);
    expect(unchanged.exchange?.timeRemaining).toBe(5);
    const forced = handleExchangeTimeout(duel, true);
    expect(forced.status).toBe('round_result');
  });

  it('buzzes exchange to opponent', () => {
    let duel = confirmStrategicChoice(createDuel('d1', 'm1', 'playerA', 'playerB'), 'echange', 'Alimentation', question);
    duel = handleExchangeBuzz(duel);
    expect(duel.exchange?.activePlayerId).toBe('playerB');
    expect(duel.exchange?.buzzed).toBe(true);
  });

  it('finishes round when enchere fold happens at zero bid', () => {
    let duel = confirmStrategicChoice(createDuel('d1', 'm1', 'playerA', 'playerB'), 'enchere', 'Alimentation', question);
    duel = handleEnchereFold(duel, 60);
    expect(duel.status).toBe('round_result');
    expect(duel.currentRound.winnerId).toBe('playerB');
  });

  it('resolves enchere after answering timeout', () => {
    let duel = confirmStrategicChoice(createDuel('d1', 'm1', 'playerA', 'playerB'), 'enchere', 'Alimentation', question);
    duel = handleEnchereBid(duel, 2);
    duel = handleEnchereFold(duel, 1);
    duel = tickEnchereTimer(duel);
    expect(duel.status).toBe('round_result');
    expect(duel.currentRound.winnerId).toBe('playerB');
  });

  it('uses custom exchange time from settings', () => {
    const duel = confirmStrategicChoice(createDuel('d1', 'm1', 'playerA', 'playerB'), 'echange', 'Alimentation', question, 45);
    expect(duel.exchange?.timeRemaining).toBe(45);
  });

  it('resolves enchere manually when forced after timeout', () => {
    let duel = confirmStrategicChoice(createDuel('d1', 'm1', 'playerA', 'playerB'), 'enchere', 'Alimentation', question);
    duel = handleEnchereBid(duel, 1);
    duel = handleEnchereFold(duel, 0);
    duel = handleEnchereTimeout(duel, true);
    expect(duel.status).toBe('round_result');
  });
});
