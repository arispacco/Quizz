/**
 * Moteur de duel — state machine pure (choosing → playing → round_result → finished).
 * Orchestre les modes Échange et Enchère via des transitions immuables sur `Duel`.
 * @module game/engine
 */
import type { Duel, GameMode, Question, RoundState } from '@/models';
import {
  createEnchereState,
  foldBid,
  isBidValid,
  isEnchereTimeExpired,
  placeBid,
  resolveEnchere,
  tickEnchere,
} from './enchere';
import {
  buzzExchange,
  createExchangeState,
  isExchangeTimeExpired,
  submitExchangeAnswer,
  tickExchange,
} from './exchange';

/** Initialise un tour avec rôles chooser/questioner selon le numéro (tour 3 = mode auto). */
export function createInitialRound(
  roundNumber: 1 | 2 | 3,
  playerAId: string,
  playerBId: string,
  playedModes: GameMode[] = [],
): RoundState {
  if (roundNumber === 1) {
    return {
      roundNumber: 1,
      chooserId: playerAId,
      questionerId: playerBId,
      playedModes,
    };
  }
  if (roundNumber === 2) {
    return {
      roundNumber: 2,
      chooserId: playerBId,
      questionerId: playerAId,
      playedModes,
    };
  }

  const autoMode = pickRound3Mode(playedModes);
  return {
    roundNumber: 3,
    chooserId: 'system',
    questionerId: Math.random() > 0.5 ? playerAId : playerBId,
    mode: autoMode,
    playedModes,
  };
}

/** Sélectionne le mode du tour 3 : celui non encore joué, ou tiebreaker si les deux l'ont été. */
export function pickRound3Mode(
  playedModes: GameMode[],
  tiebreaker: () => GameMode = () => (Math.random() > 0.5 ? 'echange' : 'enchere'),
): GameMode {
  const hasEchange = playedModes.includes('echange');
  const hasEnchere = playedModes.includes('enchere');
  if (hasEchange && !hasEnchere) return 'enchere';
  if (hasEnchere && !hasEchange) return 'echange';
  return tiebreaker();
}

/** Indique si le tour 3 a été auto-assigné par le système (chooserId === 'system'). */
export function isRound3AutoMode(round: RoundState): boolean {
  return round.roundNumber === 3 && round.chooserId === 'system' && round.mode !== undefined;
}

/** Crée un duel vide en statut `choosing`, tour 1, scores à zéro. */
export function createDuel(
  id: string,
  matchId: string,
  playerAId: string,
  playerBId: string,
): Duel {
  return {
    id,
    matchId,
    playerAId,
    playerBId,
    status: 'choosing',
    roundWins: { [playerAId]: 0, [playerBId]: 0 },
    currentRound: createInitialRound(1, playerAId, playerBId),
  };
}

/** Valide mode + thème + question, passe en `playing` et initialise exchange ou enchere. */
export function confirmStrategicChoice(
  duel: Duel,
  mode: GameMode,
  theme: string,
  question: Question,
  exchangeTimeSeconds = 30,
): Duel {
  const playedModes = [...duel.currentRound.playedModes, mode];
  return {
    ...duel,
    status: 'playing',
    currentRound: {
      ...duel.currentRound,
      mode,
      theme,
      questionId: question.id,
      questionText: question.intitule,
      playedModes,
    },
    exchange:
      mode === 'echange'
        ? createExchangeState(duel.currentRound.chooserId, exchangeTimeSeconds)
        : undefined,
    enchere:
      mode === 'enchere'
        ? createEnchereState(duel.currentRound.chooserId, duel.currentRound.questionerId)
        : undefined,
  };
}

/** Définit le chrono initial du mode Échange (secondes). */
export function startExchangeWithTime(duel: Duel, timeSeconds: number): Duel {
  if (!duel.exchange) return duel;
  return {
    ...duel,
    exchange: { ...duel.exchange, timeRemaining: timeSeconds },
  };
}

/** Enregistre une réponse Échange, alterne le joueur actif et réinitialise le chrono. */
export function handleExchangeAnswer(
  duel: Duel,
  answer: string,
  valid: boolean,
  timeSeconds: number,
): Duel {
  if (!duel.exchange) return duel;
  const { playerAId, playerBId } = duel;
  const active = duel.exchange.activePlayerId;
  const next = active === playerAId ? playerBId : playerAId;
  return {
    ...duel,
    exchange: submitExchangeAnswer(duel.exchange, active, answer, valid, next, timeSeconds),
  };
}

/** Interrompt l'Échange (buzz) et passe la main à l'adversaire sans reset du chrono. */
export function handleExchangeBuzz(duel: Duel): Duel {
  if (!duel.exchange || duel.status !== 'playing') return duel;
  const next = getOpponentId(duel, duel.exchange.activePlayerId);
  return {
    ...duel,
    exchange: buzzExchange(duel.exchange, next),
  };
}

/** Décrémente le chrono Échange d'une seconde ; termine le tour si expiré. */
export function tickExchangeTimer(duel: Duel): Duel {
  if (!duel.exchange || duel.status !== 'playing') return duel;
  const exchange = tickExchange(duel.exchange);
  if (!isExchangeTimeExpired(exchange)) {
    return { ...duel, exchange };
  }
  const loser = exchange.activePlayerId;
  const winner = getOpponentId(duel, loser);
  return finishRound({ ...duel, exchange }, winner);
}

/** Termine le tour Échange si chrono expiré (ou `force` pour timeout manuel). */
export function handleExchangeTimeout(duel: Duel, force = false): Duel {
  if (!duel.exchange) return duel;
  if (!force && !isExchangeTimeExpired(duel.exchange)) return duel;
  const loser = duel.exchange.activePlayerId;
  const winner = getOpponentId(duel, loser);
  return finishRound(duel, winner);
}

/** Place une enchère valide (> currentBid) et passe la main à l'adversaire. */
export function handleEnchereBid(duel: Duel, amount: number): Duel {
  if (!duel.enchere) return duel;
  if (!isBidValid(amount, duel.enchere.currentBid)) return duel;
  const active = duel.enchere.activeBidderId;
  const next = active === duel.playerAId ? duel.playerBId : duel.playerAId;
  return {
    ...duel,
    enchere: placeBid(duel.enchere, active, amount, next),
  };
}

/** Pli de l'enchère : si currentBid === 0, l'adversaire gagne directement le tour. */
export function handleEnchereFold(duel: Duel, timeSeconds: number): Duel {
  if (!duel.enchere || duel.enchere.phase !== 'bidding') return duel;
  const folder = duel.enchere.activeBidderId;
  const winner = getOpponentId(duel, folder);
  if (duel.enchere.currentBid === 0) {
    return finishRound(duel, winner);
  }
  return {
    ...duel,
    enchere: foldBid(
      duel.enchere,
      folder,
      winner,
      duel.enchere.currentBid,
      timeSeconds,
    ),
  };
}

/** Ajoute une réponse en phase `answering` de l'Enchère. */
export function handleEnchereAnswer(duel: Duel, answer: string): Duel {
  if (!duel.enchere || duel.enchere.phase !== 'answering') return duel;
  return {
    ...duel,
    enchere: {
      ...duel.enchere,
      answersGiven: [...duel.enchere.answersGiven, answer],
    },
  };
}

/** Décrémente le chrono Enchère d'une seconde ; résout et termine le tour si expiré. */
export function tickEnchereTimer(duel: Duel): Duel {
  if (!duel.enchere || duel.enchere.phase !== 'answering') return duel;
  const enchere = tickEnchere(duel.enchere);
  if (!isEnchereTimeExpired(enchere)) {
    return { ...duel, enchere };
  }
  const winner = resolveEnchere(enchere, duel.playerAId, duel.playerBId);
  return finishRound({ ...duel, enchere }, winner);
}

/** Résout l'Enchère à la fin du chrono (ou `force` pour fin manuelle). */
export function handleEnchereTimeout(duel: Duel, force = false): Duel {
  if (!duel.enchere || duel.enchere.phase !== 'answering') return duel;
  if (!force && !isEnchereTimeExpired(duel.enchere)) return duel;
  const winner = resolveEnchere(duel.enchere, duel.playerAId, duel.playerBId);
  return finishRound(duel, winner);
}

/** Incrémente les victoires de tour ; passe en `finished` si un joueur atteint 2 tours. */
export function finishRound(duel: Duel, winnerId: string): Duel {
  const roundWins = {
    ...duel.roundWins,
    [winnerId]: (duel.roundWins[winnerId] ?? 0) + 1,
  };
  const winsA = roundWins[duel.playerAId] ?? 0;
  const winsB = roundWins[duel.playerBId] ?? 0;

  if (winsA >= 2 || winsB >= 2) {
    const duelWinner = winsA >= 2 ? duel.playerAId : duel.playerBId;
    return {
      ...duel,
      status: 'finished',
      roundWins,
      winnerId: duelWinner,
      currentRound: { ...duel.currentRound, winnerId },
      exchange: undefined,
      enchere: undefined,
    };
  }

  const nextRoundNumber = (duel.currentRound.roundNumber + 1) as 2 | 3;
  const playedModes = duel.currentRound.playedModes;

  return {
    ...duel,
    status: 'round_result',
    roundWins,
    currentRound: {
      ...createInitialRound(nextRoundNumber, duel.playerAId, duel.playerBId, playedModes),
      winnerId,
    },
    exchange: undefined,
    enchere: undefined,
  };
}

/** Depuis `round_result`, relance le tour suivant en statut `choosing`. */
export function startNextRound(duel: Duel): Duel {
  if (duel.status !== 'round_result') return duel;
  const roundNumber = duel.currentRound.roundNumber as 1 | 2 | 3;
  return {
    ...duel,
    status: 'choosing',
    currentRound: createInitialRound(
      roundNumber,
      duel.playerAId,
      duel.playerBId,
      duel.currentRound.playedModes,
    ),
  };
}

/** Retourne l'identifiant de l'adversaire dans le duel. */
export function getOpponentId(duel: Duel, playerId: string): string {
  return playerId === duel.playerAId ? duel.playerBId : duel.playerAId;
}
