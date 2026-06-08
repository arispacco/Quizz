# API et schémas de données — Le Jeu

Référence des Cloud Functions, chemins Firebase RTDB, schéma SQLite et contrats TypeScript.

---

## Cloud Functions

Région : **europe-west1**. Authentification requise (`request.auth.uid`).

### `generateQuestions`

**Type :** HTTPS Callable (`functions().httpsCallable('generateQuestions')`)

**Entrée :**

```typescript
interface GenerateQuestionsRequest {
  text: string;      // Obligatoire, min. 50 caractères
  theme?: string;    // Thème principal optionnel
  count?: number;    // Défaut : 5
}
```

**Sortie :**

```typescript
interface GenerateQuestionsResponse {
  questions: Array<{
    intitule: string;
    theme: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    reponses: string[];
  }>;
}
```

**Erreurs :**
- `unauthenticated` — Utilisateur non connecté.
- `invalid-argument` — Texte absent ou < 50 caractères.

**Implémentation :** `functions/src/index.ts` → `gemini.generateFromText()` avec modèle `gemini-2.5-flash`, réponse JSON structurée.

**Client mobile :**

```typescript
import { generateQuestionsFromText } from '@/services/ai';

const result = await generateQuestionsFromText({
  text: 'Contenu source...',
  theme: 'Culture Générale',
  count: 5,
});
```

---

### `generateQuestionsFromAudio`

**Type :** HTTPS Callable (`functions().httpsCallable('generateQuestionsFromAudio')`)

**Entrée :**

```typescript
{
  audioBase64: string;  // Audio encodé base64
  mimeType: string;     // ex. 'audio/mp3', 'audio/wav'
  theme?: string;
  count?: number;       // Défaut : 5
}
```

**Sortie :** Identique à `generateQuestions`.

**Erreurs :**
- `unauthenticated`
- `invalid-argument` — `audioBase64` ou `mimeType` manquant.

**Client mobile :**

```typescript
import { generateQuestionsFromAudio } from '@/services/ai';

const result = await generateQuestionsFromAudio(base64Data, 'audio/mp3', 'Histoire');
```

---

### Secret Gemini

```typescript
// functions/src/gemini.ts
export const geminiApiKey = defineSecret('GEMINI_API_KEY');
```

Déployer avec :
```bash
firebase functions:secrets:set GEMINI_API_KEY
npm run functions:deploy
```

---

### Schéma de validation (Functions)

```typescript
// functions/src/schema.ts
const questionSchema = z.object({
  intitule: z.string(),
  theme: z.string(),
  difficulte: z.number().min(1).max(5),
  reponses: z.array(z.string()).min(1),
});

type GeneratedQuestion = z.infer<typeof questionSchema>;
```

Note : le champ côté Gemini est `difficulte` ; mappé vers `difficulty` dans la réponse callable.

---

## Firebase Realtime Database

### Chemins racine (`RTDB_PATHS`)

```typescript
const RTDB_PATHS = {
  users: 'users',
  packs: 'packs',
  matches: 'matches',
  duels: 'duels',
  brackets: 'brackets',
  clubs: 'clubs',
  activities: 'activities',
  presence: 'presence',
  lobby: 'lobby',
} as const;
```

### Chemins additionnels (services)

| Chemin | Usage |
|--------|-------|
| `follows/{followerId}/{targetId}` | Relations de suivi |
| `clubMembers/{clubId}/{userId}` | Adhésion aux clubs |
| `activities/{userId}/{activityId}` | Fil d'activité par utilisateur |

---

### Nœuds RTDB — structures

#### `users/{userId}` → `RTDBUserNode`

```typescript
interface RTDBUserNode extends Omit<UserProfile, 'id'> {
  email: string;
}
```

Champs `UserProfile` : `pseudo`, `email`, `avatarUrl?`, `bannerUrl?`, `activeTitle?`, `xp`, `xpLevel`, `elo`, `wins`, `losses`, `followersCount`, `followingCount`, `friendsCount`, `preferredThemes`, `currentValue`, `createdAt`, `updatedAt`.

**API :** `upsertUserProfile`, `getUserProfile`

---

#### `matches/{matchId}` → `RTDBMatchNode`

```typescript
interface RTDBMatchNode extends Omit<Match, 'id'> {}
```

Champs clés :
- `hostId`, `status` (`lobby` | `in_progress` | `finished` | `cancelled`)
- `settings: MatchSettings`
- `teams: Team[]`, `players: PlayerRef[]`
- `roomCode?`, `spectatorLink?`, `currentDuelId?`, `bracketId?`

**API :** `createMatch`, `updateMatch`, `subscribeToMatch`

---

#### `duels/{duelId}` → `RTDBDuelNode`

```typescript
interface RTDBDuelNode extends Omit<Duel, 'id'> {}
```

**API :** `createDuel`, `updateDuel`, `subscribeToDuel`

---

#### `presence/{userId}`

```typescript
{ online: boolean; updatedAt: string }
```

**API :** `setPresence`

---

#### `packs/{packId}` → `RTDBPackNode`

Métadonnées du pack (sans les questions embarquées ; questions potentiellement en sous-nœud ou Storage).

---

### Subscriptions temps réel

```typescript
// Retourne une fonction de désabonnement
const unsub = subscribeToMatch(matchId, (match) => { ... });
const unsub = subscribeToDuel(duelId, (duel) => { ... });
```

---

## Firebase Storage

| Fonction | Chemin distant | Retour |
|----------|----------------|--------|
| `uploadAudioFile(localPath, remotePath)` | Arbitrary | URL de téléchargement |
| `uploadTextContent(content, remotePath)` | Arbitrary | URL de téléchargement |

---

## SQLite local

Base : `lejeu.db` via `@op-engineering/op-sqlite`.

### Tables

#### `packs`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT PK | Identifiant UUID |
| `name` | TEXT | Nom du pack |
| `description` | TEXT | Description |
| `main_theme` | TEXT | Thème principal |
| `cover_color` | TEXT | Couleur hex (#7C3AED défaut) |
| `author_id` | TEXT | ID auteur |
| `author_pseudo` | TEXT | Pseudo auteur |
| `visibility` | TEXT | `private` \| `public` |
| `question_count` | INTEGER | Nombre de questions |
| `average_difficulty` | REAL | Difficulté moyenne |
| `rating` | REAL | Note communautaire |
| `downloaded` | INTEGER | 0/1 booléen |
| `created_at` | TEXT | ISO 8601 |
| `updated_at` | TEXT | ISO 8601 |

#### `questions`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT PK | Identifiant |
| `pack_id` | TEXT FK | Référence pack |
| `intitule` | TEXT | Énoncé |
| `theme` | TEXT | Thème |
| `difficulty` | INTEGER | 1–5 |
| `reponses` | TEXT | JSON array de strings |
| `audio_url` | TEXT | URL audio optionnelle |
| `created_at` | TEXT | ISO 8601 |

Index : `idx_questions_pack` sur `pack_id`.

#### `match_history`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT PK | Identifiant |
| `format` | TEXT | `tournoi` \| `face_to_face` \| `all_team` |
| `connection_mode` | TEXT | `online` \| `local` \| `mono_device` |
| `opponent_pseudo` | TEXT | Pseudo adversaire |
| `result` | TEXT | `win` \| `loss` \| `draw` |
| `score` | TEXT | Score affiché |
| `played_at` | TEXT | ISO 8601 |

#### `local_stats`

| Colonne | Type | Description |
|---------|------|-------------|
| `key` | TEXT PK | Clé arbitraire |
| `value` | TEXT | Valeur string |

### API SQLite

| Fonction | Description |
|----------|-------------|
| `initDatabase()` | Crée les tables si absentes |
| `savePack(pack, questions)` | Upsert pack + remplace questions |
| `getAllPacks()` | Liste triée par `updated_at DESC` |
| `getPackById(packId)` | Pack ou `null` |
| `getPackQuestions(packId)` | Questions du pack |
| `deletePack(packId)` | Supprime pack (cascade questions) |
| `saveMatchHistory(entry)` | Insère historique |
| `getMatchHistory()` | 50 dernières parties |
| `setLocalStat(key, value)` | Upsert stat locale |
| `getLocalStat(key)` | Lit stat ou `null` |

---

## AsyncStorage (préférences)

```typescript
const ASYNC_STORAGE_KEYS = {
  themeMode: '@lejeu/theme_mode',
  userPreferences: '@lejeu/user_preferences',
  onboardingDone: '@lejeu/onboarding_done',
  cachedProfile: '@lejeu/cached_profile',
} as const;
```

API : `getPreference`, `setPreference`, `removePreference` dans `services/db/preferences.ts`.

---

## Contrats TypeScript — Types métier

### Énumérations

```typescript
type GameMode = 'echange' | 'enchere';
type GameFormat = 'tournoi' | 'face_to_face' | 'all_team';
type ConnectionMode = 'online' | 'local' | 'mono_device';
type TournamentFormat = 'single_elimination' | 'double_elimination' | 'groups_then_elimination';
type PackVisibility = 'private' | 'public';
type MatchStatus = 'lobby' | 'in_progress' | 'finished' | 'cancelled';
type DuelStatus = 'choosing' | 'playing' | 'round_result' | 'finished';
type EncherePhase = 'bidding' | 'answering';
type TournamentPhase = 'groups' | 'quarters' | 'semis' | 'final';
```

### `Question`

```typescript
interface Question {
  id: string;
  intitule: string;
  theme: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  reponses: string[];
  audioUrl?: string;
  createdAt: string;
}
```

### `Pack`

```typescript
interface Pack {
  id: string;
  name: string;
  description: string;
  mainTheme: string;
  coverColor: string;
  authorId: string;
  authorPseudo: string;
  visibility: PackVisibility;
  questionCount: number;
  averageDifficulty: number;
  rating: number;
  downloaded: boolean;
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}
```

### `Match` / `MatchSettings`

```typescript
interface MatchSettings {
  format: GameFormat;
  connectionMode: ConnectionMode;
  tournamentFormat?: TournamentFormat;
  teamCount: number;
  playersPerTeam: number;
  themePhases: ThemePhase[];
  exchangeTimeSeconds: number;
  enchereTimeSeconds: number;
  spectatorsAllowed: boolean;
  packIds: string[];
}

interface ThemePhase {
  phase: TournamentPhase | 'all';
  theme: string;
  multiplier: number;
}
```

### `Duel` et sous-états

```typescript
interface RoundState {
  roundNumber: 1 | 2 | 3;
  chooserId: string;
  questionerId: string;
  mode?: GameMode;
  theme?: string;
  questionId?: string;
  questionText?: string;
  winnerId?: string;
  playedModes: GameMode[];
}

interface ExchangeState {
  activePlayerId: string;
  answers: { playerId: string; answer: string; valid: boolean }[];
  timeRemaining: number;
  buzzed: boolean;
}

interface EnchereState {
  phase: EncherePhase;
  bids: Bid[];
  currentBid: number;
  activeBidderId: string;
  winnerId?: string;
  promisedCount: number;
  answersGiven: string[];
  timeRemaining: number;
}

interface Bid {
  playerId: string;
  amount: number;
  folded: boolean;
  timestamp: string;
}

interface Duel {
  id: string;
  matchId: string;
  playerAId: string;
  playerBId: string;
  status: DuelStatus;
  roundWins: Record<string, number>;
  currentRound: RoundState;
  exchange?: ExchangeState;
  enchere?: EnchereState;
  winnerId?: string;
}
```

### Social et tournoi

```typescript
interface Club { id, name, description, logoUrl?, color, memberCount, access, adminIds, createdAt }
interface ActivityItem { id, userId, userPseudo, type, message, createdAt }
interface MercatoPlayer { playerId, pseudo, value, formerTeamId, available }
interface Bracket { id, matchId, format, matches, currentPhase }
interface BracketMatch { id, round, teamAId?, teamBId?, winnerTeamId?, duelId?, status }
```

---

## Services en ligne (API interne)

### Matchmaking

```typescript
interface MatchmakingRequest {
  hostId: string;
  hostPseudo: string;
  format: GameFormat;
  connectionMode: ConnectionMode;
  settings?: Partial<MatchSettings>;
}

createOnlineMatch(request): Promise<Match>
joinMatch(matchId, playerId, pseudo): Promise<void>
startMatch(matchId): Promise<void>
```

### ELO

```typescript
calculateElo(playerElo, opponentElo, result): { newElo: number; delta: number }
getEloTier(elo): string  // 'Débutant' | 'Intermédiaire' | ...
```

### Bracket

```typescript
generateBracket(matchId, teams, format): Bracket
advanceWinner(bracket, matchId, winnerTeamId): Bracket
getActiveMatch(bracket): BracketMatch | undefined
```
