export type GameMode = 'echange' | 'enchere';
export type GameFormat = 'tournoi' | 'face_to_face' | 'all_team';
export type ConnectionMode = 'online' | 'local' | 'mono_device';
export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'groups_then_elimination';
export type PackVisibility = 'private' | 'public';
export type MatchStatus = 'lobby' | 'in_progress' | 'finished' | 'cancelled';
export type DuelStatus = 'choosing' | 'playing' | 'round_result' | 'finished';
export type EncherePhase = 'bidding' | 'answering';
export type TournamentPhase = 'groups' | 'quarters' | 'semis' | 'final';

export interface UserProfile {
  id: string;
  pseudo: string;
  email: string;
  avatarUrl?: string;
  bannerUrl?: string;
  activeTitle?: string;
  xp: number;
  xpLevel: number;
  elo: number;
  wins: number;
  losses: number;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  preferredThemes: string[];
  currentValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  intitule: string;
  theme: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  reponses: string[];
  audioUrl?: string;
  createdAt: string;
}

export interface Pack {
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

export interface Team {
  id: string;
  name: string;
  color: string;
  playerIds: string[];
  tokens: number;
  eliminated: boolean;
}

export interface PlayerRef {
  id: string;
  pseudo: string;
  avatarUrl?: string;
  teamId?: string;
  tokens: number;
  duelsWon: number;
  value: number;
}

export interface ThemePhase {
  phase: TournamentPhase | 'all';
  theme: string;
  multiplier: number;
}

export interface MatchSettings {
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

export interface Match {
  id: string;
  hostId: string;
  status: MatchStatus;
  settings: MatchSettings;
  teams: Team[];
  players: PlayerRef[];
  roomCode?: string;
  spectatorLink?: string;
  currentDuelId?: string;
  bracketId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  playerId: string;
  amount: number;
  folded: boolean;
  timestamp: string;
}

export interface RoundState {
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

export interface ExchangeState {
  activePlayerId: string;
  answers: { playerId: string; answer: string; valid: boolean }[];
  timeRemaining: number;
  buzzed: boolean;
}

export interface EnchereState {
  phase: EncherePhase;
  bids: Bid[];
  currentBid: number;
  activeBidderId: string;
  winnerId?: string;
  promisedCount: number;
  answersGiven: string[];
  timeRemaining: number;
}

export interface Duel {
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

export interface BracketMatch {
  id: string;
  round: number;
  teamAId?: string;
  teamBId?: string;
  winnerTeamId?: string;
  duelId?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Bracket {
  id: string;
  matchId: string;
  format: TournamentFormat;
  matches: BracketMatch[];
  currentPhase: TournamentPhase;
}

export interface TokenTransaction {
  playerId: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface MercatoPlayer {
  playerId: string;
  pseudo: string;
  value: number;
  formerTeamId: string;
  available: boolean;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userPseudo: string;
  type: 'match_played' | 'pack_published' | 'tournament_joined' | 'friend_added';
  message: string;
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  color: string;
  memberCount: number;
  access: 'open' | 'invite_only';
  adminIds: string[];
  createdAt: string;
}

export interface MatchHistoryEntry {
  id: string;
  format: GameFormat;
  connectionMode: ConnectionMode;
  opponentPseudo: string;
  result: 'win' | 'loss' | 'draw';
  score: string;
  playedAt: string;
}
