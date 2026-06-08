import type { Pack, Question, UserProfile, Match, Duel } from './types';

/** Schéma Realtime Database — chemins racine */
export const RTDB_PATHS = {
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

export interface RTDBUserNode extends Omit<UserProfile, 'id'> {
  email: string;
}

export interface RTDBPackNode {
  name: string;
  description: string;
  mainTheme: string;
  coverColor: string;
  authorId: string;
  authorPseudo: string;
  visibility: Pack['visibility'];
  questionCount: number;
  averageDifficulty: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface RTDBQuestionNode extends Omit<Question, 'id'> {}

export interface RTDBMatchNode extends Omit<Match, 'id'> {}

export interface RTDBDuelNode extends Omit<Duel, 'id'> {}

/** Schéma SQLite local — tables hors ligne */
export const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS packs (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  main_theme TEXT NOT NULL,
  cover_color TEXT NOT NULL DEFAULT '#7C3AED',
  author_id TEXT NOT NULL,
  author_pseudo TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private',
  question_count INTEGER NOT NULL DEFAULT 0,
  average_difficulty REAL NOT NULL DEFAULT 3,
  rating REAL NOT NULL DEFAULT 0,
  downloaded INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY NOT NULL,
  pack_id TEXT NOT NULL,
  intitule TEXT NOT NULL,
  theme TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 3,
  reponses TEXT NOT NULL,
  audio_url TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS match_history (
  id TEXT PRIMARY KEY NOT NULL,
  format TEXT NOT NULL,
  connection_mode TEXT NOT NULL,
  opponent_pseudo TEXT NOT NULL,
  result TEXT NOT NULL,
  score TEXT NOT NULL,
  played_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS local_stats (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_pack ON questions(pack_id);
`;

export const ASYNC_STORAGE_KEYS = {
  themeMode: '@lejeu/theme_mode',
  userPreferences: '@lejeu/user_preferences',
  onboardingDone: '@lejeu/onboarding_done',
  cachedProfile: '@lejeu/cached_profile',
} as const;
