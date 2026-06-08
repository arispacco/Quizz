/**
 * Persistance locale SQLite (op-sqlite) : packs, questions, historique de parties.
 * Base `lejeu.db` — schéma défini dans `@/models` (`SQLITE_SCHEMA`).
 * @module services/db/sqlite
 */
import { open, type DB } from '@op-engineering/op-sqlite';
import { SQLITE_SCHEMA, type MatchHistoryEntry, type Pack, type Question } from '@/models';

const DB_NAME = 'lejeu.db';
let db: DB = open({ name: DB_NAME });

/** Crée les tables packs, questions, match_history et local_stats si absentes. */
export async function initDatabase(): Promise<void> {
  await db.execute(SQLITE_SCHEMA);
}

function rowToPack(row: Record<string, unknown>): Pack {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    mainTheme: String(row.main_theme),
    coverColor: String(row.cover_color),
    authorId: String(row.author_id),
    authorPseudo: String(row.author_pseudo),
    visibility: row.visibility as Pack['visibility'],
    questionCount: Number(row.question_count),
    averageDifficulty: Number(row.average_difficulty),
    rating: Number(row.rating),
    downloaded: Boolean(row.downloaded),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function rowToQuestion(row: Record<string, unknown>): Question {
  return {
    id: String(row.id),
    intitule: String(row.intitule),
    theme: String(row.theme),
    difficulty: Number(row.difficulty) as Question['difficulty'],
    reponses: JSON.parse(String(row.reponses)) as string[],
    audioUrl: row.audio_url ? String(row.audio_url) : undefined,
    createdAt: String(row.created_at),
  };
}

function getRows(result: Awaited<ReturnType<DB['execute']>>): Record<string, unknown>[] {
  const rows = result.rows as { _array?: Record<string, unknown>[] } | Record<string, unknown>[];
  if (Array.isArray(rows)) return rows;
  return rows?._array ?? [];
}

/** Upsert un pack et remplace toutes ses questions (transaction DELETE + INSERT). */
export async function savePack(pack: Pack, questions: Question[]): Promise<void> {
  await db.execute(
    `INSERT OR REPLACE INTO packs
     (id, name, description, main_theme, cover_color, author_id, author_pseudo, visibility,
      question_count, average_difficulty, rating, downloaded, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pack.id,
      pack.name,
      pack.description,
      pack.mainTheme,
      pack.coverColor,
      pack.authorId,
      pack.authorPseudo,
      pack.visibility,
      questions.length,
      pack.averageDifficulty,
      pack.rating,
      pack.downloaded ? 1 : 0,
      pack.createdAt,
      pack.updatedAt,
    ],
  );

  await db.execute('DELETE FROM questions WHERE pack_id = ?', [pack.id]);
  for (const q of questions) {
    await db.execute(
      `INSERT INTO questions (id, pack_id, intitule, theme, difficulty, reponses, audio_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        q.id,
        pack.id,
        q.intitule,
        q.theme,
        q.difficulty,
        JSON.stringify(q.reponses),
        q.audioUrl ?? null,
        q.createdAt,
      ],
    );
  }
}

/** Liste tous les packs locaux, triés par date de mise à jour décroissante. */
export async function getAllPacks(): Promise<Pack[]> {
  const result = await db.execute('SELECT * FROM packs ORDER BY updated_at DESC');
  return getRows(result).map(rowToPack);
}

/** Récupère un pack par ID, ou `null` s'il n'existe pas localement. */
export async function getPackById(packId: string): Promise<Pack | null> {
  const result = await db.execute('SELECT * FROM packs WHERE id = ?', [packId]);
  const row = getRows(result)[0];
  return row ? rowToPack(row) : null;
}

/** Retourne toutes les questions associées à un pack. */
export async function getPackQuestions(packId: string): Promise<Question[]> {
  const result = await db.execute('SELECT * FROM questions WHERE pack_id = ?', [packId]);
  return getRows(result).map(rowToQuestion);
}

/** Supprime un pack et ses questions (CASCADE). */
export async function deletePack(packId: string): Promise<void> {
  await db.execute('DELETE FROM packs WHERE id = ?', [packId]);
}

/** Enregistre une entrée dans l'historique local des parties. */
export async function saveMatchHistory(entry: MatchHistoryEntry): Promise<void> {
  await db.execute(
    `INSERT INTO match_history (id, format, connection_mode, opponent_pseudo, result, score, played_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.format,
      entry.connectionMode,
      entry.opponentPseudo,
      entry.result,
      entry.score,
      entry.playedAt,
    ],
  );
}

/** Retourne les 50 dernières parties jouées (tri par date décroissante). */
export async function getMatchHistory(): Promise<MatchHistoryEntry[]> {
  const result = await db.execute('SELECT * FROM match_history ORDER BY played_at DESC LIMIT 50');
  return getRows(result).map(row => ({
    id: String(row.id),
    format: row.format as MatchHistoryEntry['format'],
    connectionMode: row.connection_mode as MatchHistoryEntry['connectionMode'],
    opponentPseudo: String(row.opponent_pseudo),
    result: row.result as MatchHistoryEntry['result'],
    score: String(row.score),
    playedAt: String(row.played_at),
  }));
}

/** Stocke une paire clé/valeur dans la table `local_stats`. */
export async function setLocalStat(key: string, value: string): Promise<void> {
  await db.execute('INSERT OR REPLACE INTO local_stats (key, value) VALUES (?, ?)', [key, value]);
}

/** Lit une stat locale par clé, ou `null` si absente. */
export async function getLocalStat(key: string): Promise<string | null> {
  const result = await db.execute('SELECT value FROM local_stats WHERE key = ?', [key]);
  const row = getRows(result)[0];
  return row ? String(row.value) : null;
}
