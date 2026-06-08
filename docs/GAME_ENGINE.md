# Game Engine — Le Jeu

Documentation du moteur de jeu situé dans `src/game/`. Toute la logique est **purement fonctionnelle** : pas de React, pas d'I/O. Les fonctions prennent un état et retournent un nouvel état immuable.

---

## Concepts fondamentaux

### Duel

Un duel oppose deux joueurs (`playerAId`, `playerBId`) en **3 tours maximum**. Le premier à remporter **2 tours** gagne le duel.

### State machine du duel (`DuelStatus`)

```
choosing → playing → round_result → choosing (tour suivant)
                  ↘ finished (2 victoires)
```

| Statut | Description |
|--------|-------------|
| `choosing` | Le `chooserId` sélectionne mode + thème + question. |
| `playing` | Mode actif (Échange ou Enchère) en cours. |
| `round_result` | Tour terminé, en attente de `startNextRound`. |
| `finished` | Duel terminé, `winnerId` défini. |

### Tours (`RoundState`)

| Tour | Choix (`chooserId`) | Questionneur (`questionerId`) | Mode |
|------|---------------------|-------------------------------|------|
| 1 | Joueur A | Joueur B | Choisi par A |
| 2 | Joueur B | Joueur A | Choisi par B |
| 3 | Système (`system`) | Aléatoire | Mode non encore joué |

Le round 3 appelle `pickRound3Mode(playedModes)` : si un seul mode a été joué, l'autre est imposé ; sinon tirage aléatoire.

### Modes de jeu

- **Échange** (`echange`) : alternance de réponses sous chrono individuel.
- **Enchère** (`enchere`) : phase d'enchères puis phase de réponses multiples.

---

## Module `engine.ts`

Orchestrateur principal. Importe les sous-modules `exchange` et `enchere`.

### `createInitialRound`

```typescript
function createInitialRound(
  roundNumber: 1 | 2 | 3,
  playerAId: string,
  playerBId: string,
  playedModes?: GameMode[],
): RoundState
```

**Paramètres :**
- `roundNumber` — Numéro du tour (1, 2 ou 3).
- `playerAId`, `playerBId` — Identifiants des joueurs.
- `playedModes` — Modes déjà joués dans le duel (pour le tour 3).

**Retour :** `RoundState` initialisé avec rôles chooser/questioner.

**Exemple :**
```typescript
const round = createInitialRound(1, 'playerA', 'playerB');
// { roundNumber: 1, chooserId: 'playerA', questionerId: 'playerB', playedModes: [] }
```

---

### `pickRound3Mode`

```typescript
function pickRound3Mode(
  playedModes: GameMode[],
  tiebreaker?: () => GameMode,
): GameMode
```

**Paramètres :**
- `playedModes` — Historique des modes joués.
- `tiebreaker` — Fonction optionnelle si les deux modes ont été joués (défaut : aléatoire).

**Retour :** `'echange'` ou `'enchere'`.

**Exemple :**
```typescript
pickRound3Mode(['echange']); // 'enchere'
pickRound3Mode([], () => 'echange'); // déterministe pour les tests
```

---

### `isRound3AutoMode`

```typescript
function isRound3AutoMode(round: RoundState): boolean
```

Retourne `true` si le tour 3 a été auto-assigné (`chooserId === 'system'` et `mode` défini).

---

### `createDuel`

```typescript
function createDuel(
  id: string,
  matchId: string,
  playerAId: string,
  playerBId: string,
): Duel
```

**Retour :** Duel en statut `choosing`, scores à 0, tour 1.

**Exemple :**
```typescript
const duel = createDuel('d1', 'match-1', 'alice', 'bob');
```

---

### `confirmStrategicChoice`

```typescript
function confirmStrategicChoice(
  duel: Duel,
  mode: GameMode,
  theme: string,
  question: Question,
  exchangeTimeSeconds?: number,
): Duel
```

**Paramètres :**
- `duel` — État actuel (doit être en `choosing`).
- `mode` — `'echange'` ou `'enchere'`.
- `theme` — Thème choisi.
- `question` — Question sélectionnée (intitulé stocké dans `questionText`).

**Retour :** Duel en `playing` avec sous-état `exchange` ou `enchere` initialisé.

**Exemple :**
```typescript
let duel = createDuel('d1', 'm1', 'playerA', 'playerB');
duel = confirmStrategicChoice(duel, 'echange', 'Informatique', question);
// duel.status === 'playing', duel.exchange défini
```

---

### `startExchangeWithTime`

```typescript
function startExchangeWithTime(duel: Duel, timeSeconds: number): Duel
```

Définit le chrono initial du mode Échange.

**Exemple :**
```typescript
duel = startExchangeWithTime(duel, 30);
```

---

### `handleExchangeAnswer`

```typescript
function handleExchangeAnswer(
  duel: Duel,
  answer: string,
  valid: boolean,
  timeSeconds: number,
): Duel
```

Enregistre une réponse, passe au joueur suivant, réinitialise le chrono.

**Exemple :**
```typescript
duel = handleExchangeAnswer(duel, 'banane', true, 30);
```

---

### `handleExchangeBuzz`

```typescript
function handleExchangeBuzz(duel: Duel): Duel
```

Interruption (buzz) : passe la main à l'adversaire sans réinitialiser le chrono.

---

### `tickExchangeTimer`

```typescript
function tickExchangeTimer(duel: Duel): Duel
```

Décrémente le chrono d'une seconde. Si expiré, termine le tour automatiquement.

---

### `handleExchangeTimeout`

```typescript
function handleExchangeTimeout(duel: Duel, force?: boolean): Duel
```

Termine le tour si chrono expiré, ou immédiatement si `force === true`.

---

### `handleEnchereBid`

```typescript
function handleEnchereBid(duel: Duel, amount: number): Duel
```

Place une enchère si `isBidValid(amount, currentBid)`. Passe l'enchère à l'adversaire.

**Exemple :**
```typescript
duel = handleEnchereBid(duel, 5); // currentBid = 5
```

---

### `handleEnchereFold`

```typescript
function handleEnchereFold(duel: Duel, timeSeconds: number): Duel
```

Le joueur actif se couche. Si `currentBid === 0`, l'adversaire gagne directement le tour. Sinon, phase `answering` avec `promisedCount = currentBid`.

**Exemple :**
```typescript
duel = handleEnchereFold(duel, 60);
// phase: 'answering', promisedCount = dernière enchère
```

---

### `handleEnchereAnswer`

```typescript
function handleEnchereAnswer(duel: Duel, answer: string): Duel
```

Ajoute une réponse à `answersGiven` (phase `answering` uniquement).

---

### `tickEnchereTimer`

```typescript
function tickEnchereTimer(duel: Duel): Duel
```

Décrémente le chrono Enchère d'une seconde en phase `answering`. Résout et termine le tour si expiré.

---

### `handleEnchereTimeout`

```typescript
function handleEnchereTimeout(duel: Duel, force?: boolean): Duel
```

Résout l'enchère via `resolveEnchere` et termine le tour (immédiat si `force === true`).

---

### `finishRound`

```typescript
function finishRound(duel: Duel, winnerId: string): Duel
```

Incrémente `roundWins[winnerId]`. Si un joueur atteint 2 victoires → `finished`. Sinon → `round_result` avec préparation du tour suivant.

**Exemple :**
```typescript
duel = finishRound(duel, 'playerA');
```

---

### `startNextRound`

```typescript
function startNextRound(duel: Duel): Duel
```

Depuis `round_result`, repasse en `choosing` avec le round suivant.

---

### `getOpponentId`

```typescript
function getOpponentId(duel: Duel, playerId: string): string
```

Retourne l'ID de l'adversaire.

---

## Module `exchange.ts`

### `createExchangeState`

```typescript
function createExchangeState(activePlayerId: string, timeSeconds: number): ExchangeState
```

**Retour :** `{ activePlayerId, answers: [], timeRemaining, buzzed: false }`

---

### `tickExchange`

```typescript
function tickExchange(state: ExchangeState): ExchangeState
```

Décrémente `timeRemaining` de 1 (minimum 0).

---

### `buzzExchange`

```typescript
function buzzExchange(state: ExchangeState, nextPlayerId: string): ExchangeState
```

Interruption (buzz) : change le joueur actif, conserve le temps, `buzzed: true`.

---

### `submitExchangeAnswer`

```typescript
function submitExchangeAnswer(
  state: ExchangeState,
  playerId: string,
  answer: string,
  valid: boolean,
  nextPlayerId: string,
  resetTime: number,
): ExchangeState
```

Ajoute une entrée `{ playerId, answer, valid }`, passe au joueur suivant, reset chrono.

---

### `passExchangeTurn`

```typescript
function passExchangeTurn(
  state: ExchangeState,
  loserId: string,
  winnerId: string,
): { state: ExchangeState; winnerId: string }
```

Utilitaire pour abandon explicite d'un tour.

---

### `isExchangeTimeExpired`

```typescript
function isExchangeTimeExpired(state: ExchangeState): boolean
```

Retourne `true` si `timeRemaining <= 0`.

---

## Module `enchere.ts`

### `createEnchereState`

```typescript
function createEnchereState(firstBidderId: string, _secondPlayerId: string): EnchereState
```

Initialise la phase `bidding` avec `currentBid: 0`, `activeBidderId: firstBidderId`.

---

### `placeBid`

```typescript
function placeBid(
  state: EnchereState,
  playerId: string,
  amount: number,
  nextBidderId: string,
): EnchereState
```

Ajoute un `Bid` non plié, met à jour `currentBid`, passe au prochain enchérisseur.

---

### `foldBid`

```typescript
function foldBid(
  state: EnchereState,
  playerId: string,
  winnerId: string,
  promisedCount: number,
  timeSeconds: number,
): EnchereState
```

Enregistre un bid plié (`folded: true`), passe en phase `answering`.

---

### `submitEnchereAnswer`

```typescript
function submitEnchereAnswer(state: EnchereState, answer: string): EnchereState
```

Ajoute une réponse à `answersGiven`.

---

### `tickEnchere`

```typescript
function tickEnchere(state: EnchereState): EnchereState
```

Décrémente le chrono en phase `answering` uniquement.

---

### `isEnchereTimeExpired`

```typescript
function isEnchereTimeExpired(state: EnchereState): boolean
```

Retourne `true` si `timeRemaining <= 0` en phase `answering`.

---

### `resolveEnchere`

```typescript
function resolveEnchere(
  state: EnchereState,
  playerAId: string,
  playerBId: string,
): string
```

**Logique :** Si `answersGiven.length >= promisedCount` → gagnant de l'enchère (`winnerId`). Sinon → le joueur qui s'est couché gagne le tour.

---

### `isBidValid`

```typescript
function isBidValid(amount: number, currentBid: number): boolean
```

Retourne `true` si `amount > currentBid && amount > 0`.

---

## Module `scoring.ts`

### `getThemeMultiplier`

```typescript
function getThemeMultiplier(
  questionTheme: string,
  phaseTheme: string,
  themePhases: ThemePhase[],
): number
```

Calcule le multiplicateur selon la hiérarchie des thèmes de phase. Thème identique → `1`. Thème plus spécifique qu'une phase parente → multiplicateur de la phase parente. Sinon → multiplicateur de la phase la plus large.

---

### `normalizeTheme`

```typescript
function normalizeTheme(theme: string): string
```

Trim + lowercase pour comparaison.

---

### `calculateAnswerPoints`

```typescript
function calculateAnswerPoints(
  basePoints: number,
  questionTheme: string,
  currentPhaseTheme: string,
  themePhases: ThemePhase[],
): number
```

`basePoints * getThemeMultiplier(...)`.

**Exemple :**
```typescript
const pts = calculateAnswerPoints(1, 'Programmation C', 'Informatique', phases);
```

---

### `PHASE_MULTIPLIERS`

```typescript
const PHASE_MULTIPLIERS: Record<string, number> = {
  groups: 1,
  quarters: 1.5,
  semis: 2,
  final: 3,
};
```

Multiplicateurs de **valeur joueur** selon la phase du tournoi.

---

### `getPlayerValue`

```typescript
function getPlayerValue(duelsWon: number, phase: keyof typeof PHASE_MULTIPLIERS): number
```

`duelsWon * PHASE_MULTIPLIERS[phase]`.

---

## Module `tokens.ts`

### `TOKEN_REWARDS`

| Clé | Valeur | Description |
|-----|--------|-------------|
| `roundWin` | 1 | Victoire d'un tour |
| `duelWinGroups` | 1 | Victoire duel en poules |
| `duelWinQuarters` | 2 | Victoire duel en quarts |
| `duelWinSemis` | 3 | Victoire duel en demies |
| `duelWinFinal` | 5 | Victoire duel en finale |
| `highBidWin` | 1 | Bonus enchère élevée |
| `broaderThemeWin` | 1 | Bonus thème plus large |

### `TOKEN_COSTS`

| Phase | Coût |
|-------|------|
| `quarters` | 2 |
| `semis` | 4 |
| `final` | 6 |

### `getDuelWinBonus`

```typescript
function getDuelWinBonus(phase: TournamentPhase): number
```

Jetons gagnés pour une victoire de duel selon la phase.

---

### `getPhaseAccessCost`

```typescript
function getPhaseAccessCost(phase: TournamentPhase): number
```

Coût en jetons pour accéder à une phase éliminatoire.

---

### `canAffordPhase`

```typescript
function canAffordPhase(tokens: number, phase: TournamentPhase): boolean
```

Vérifie si le joueur a assez de jetons.

---

## Flux complet (exemple)

```typescript
import {
  createDuel,
  confirmStrategicChoice,
  startExchangeWithTime,
  handleExchangeAnswer,
  finishRound,
  startNextRound,
} from '@/game';

const question = { id: 'q1', intitule: 'Citez des fruits jaunes', theme: 'Alimentation', ... };

let duel = createDuel('d1', 'm1', 'alice', 'bob');
duel = confirmStrategicChoice(duel, 'echange', 'Alimentation', question);
duel = startExchangeWithTime(duel, 30);
duel = handleExchangeAnswer(duel, 'banane', true, 30);
// ... timeout ou réponse invalide ...
duel = finishRound(duel, 'alice');
duel = startNextRound(duel); // tour 2, bob choisit
```

---

## Tests

Exécuter : `npm run test:game`

Fichiers : `src/game/__tests__/engine.test.ts`, `scoring.test.ts`.
