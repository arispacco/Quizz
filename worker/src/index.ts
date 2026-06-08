/**
 * Cloudflare Worker — génération de questions quiz via l'API Gemini.
 *
 * Remplace les Cloud Functions Firebase `generateQuestions` et
 * `generateQuestionsFromAudio` afin d'éviter le plan payant Blaze.
 * Firebase reste utilisé comme BaaS gratuit (Auth + Realtime DB + Storage) :
 * l'authentification est vérifiée ici en validant l'ID token Firebase.
 *
 * Routes :
 *   POST /generateQuestions          { text, theme?, count? }
 *   POST /generateQuestionsFromAudio { audioBase64, mimeType, theme?, count? }
 *
 * Réponse (identique aux anciennes Cloud Functions) :
 *   { questions: [{ intitule, theme, difficulty, reponses }] }
 */
import { decodeProtectedHeader, importX509, jwtVerify } from 'jose';

export interface Env {
  /** Doit correspondre à l'ID du projet Firebase (voir .firebaserc). */
  FIREBASE_PROJECT_ID: string;
  /** Clé API Gemini — définie via `wrangler secret put GEMINI_API_KEY`. */
  GEMINI_API_KEY: string;
}

const MODEL = 'gemini-2.5-flash';

const X509_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

/** Schéma JSON structuré attendu de Gemini (types REST en MAJUSCULES). */
const QUESTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          intitule: { type: 'STRING' },
          theme: { type: 'STRING' },
          difficulte: { type: 'NUMBER' },
          reponses: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['intitule', 'theme', 'difficulte', 'reponses'],
      },
    },
  },
  required: ['questions'],
} as const;

interface GeneratedQuestion {
  intitule: string;
  theme: string;
  difficulte: number;
  reponses: string[];
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// --- Vérification de l'ID token Firebase --------------------------------

let certsCache: { certs: Record<string, string>; expiresAt: number } | null = null;

async function fetchSecureTokenCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certsCache && certsCache.expiresAt > now) {
    return certsCache.certs;
  }
  const res = await fetch(X509_URL);
  if (!res.ok) {
    throw new Error('Impossible de récupérer les clés publiques Firebase');
  }
  const certs = (await res.json()) as Record<string, string>;

  // Respecte le max-age du Cache-Control pour limiter les appels réseau.
  let maxAge = 3600;
  const cacheControl = res.headers.get('cache-control');
  if (cacheControl) {
    const match = /max-age=(\d+)/.exec(cacheControl);
    if (match) {
      maxAge = parseInt(match[1], 10);
    }
  }
  certsCache = { certs, expiresAt: now + maxAge * 1000 };
  return certs;
}

async function verifyFirebaseToken(token: string, projectId: string): Promise<void> {
  const header = decodeProtectedHeader(token);
  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('En-tête de token invalide');
  }
  const certs = await fetchSecureTokenCerts();
  const cert = certs[header.kid];
  if (!cert) {
    throw new Error('Clé de signature inconnue');
  }
  const publicKey = await importX509(cert, 'RS256');
  await jwtVerify(token, publicKey, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    // jwtVerify valide automatiquement exp / iat / nbf.
  });
}

async function requireAuth(request: Request, env: Env): Promise<void> {
  if (!env.FIREBASE_PROJECT_ID) {
    throw new HttpError(500, 'FIREBASE_PROJECT_ID non configuré sur le Worker');
  }
  const authHeader = request.headers.get('Authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!match) {
    throw new HttpError(401, 'Authentification requise');
  }
  try {
    await verifyFirebaseToken(match[1], env.FIREBASE_PROJECT_ID);
  } catch (e) {
    throw new HttpError(401, e instanceof Error ? e.message : 'Token invalide');
  }
}

// --- Appel Gemini -------------------------------------------------------

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

async function callGemini(env: Env, parts: GeminiPart[]): Promise<GeneratedQuestion[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: QUESTION_SCHEMA,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new HttpError(502, `Erreur Gemini (${res.status}): ${detail.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{"questions":[]}';
  const parsed = JSON.parse(text) as { questions?: GeneratedQuestion[] };
  return parsed.questions ?? [];
}

function toResponseShape(questions: GeneratedQuestion[]) {
  return {
    questions: questions.map(q => ({
      intitule: q.intitule,
      theme: q.theme,
      difficulty: q.difficulte,
      reponses: q.reponses,
    })),
  };
}

// --- Handlers de route --------------------------------------------------

async function handleGenerateQuestions(request: Request, env: Env): Promise<Response> {
  const { text, theme, count } = (await request.json()) as {
    text?: string;
    theme?: string;
    count?: number;
  };
  if (!text || text.trim().length < 50) {
    throw new HttpError(400, 'Le texte source doit faire au moins 50 caractères');
  }
  const n = count ?? 5;
  const prompt = `À partir du contenu suivant, génère exactement ${n} questions de quiz de type LISTING (plusieurs réponses possibles).
Chaque question doit avoir un intitulé clair, un thème, une difficulté de 1 à 5, et une liste de réponses valides.
${theme ? `Thème principal: ${theme}` : ''}

CONTENU:
${text.slice(0, 30000)}`;

  const questions = await callGemini(env, [{ text: prompt }]);
  return json(toResponseShape(questions));
}

async function handleGenerateQuestionsFromAudio(request: Request, env: Env): Promise<Response> {
  const { audioBase64, mimeType, theme, count } = (await request.json()) as {
    audioBase64?: string;
    mimeType?: string;
    theme?: string;
    count?: number;
  };
  if (!audioBase64 || !mimeType) {
    throw new HttpError(400, 'audioBase64 et mimeType requis');
  }
  const n = count ?? 5;
  const prompt = `Écoute cet audio et génère ${n} questions de quiz de type LISTING avec réponses multiples.
${theme ? `Thème: ${theme}` : ''}`;

  const questions = await callGemini(env, [
    { text: prompt },
    { inlineData: { mimeType, data: audioBase64 } },
  ]);
  return json(toResponseShape(questions));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const { pathname } = new URL(request.url);

    try {
      if (request.method !== 'POST') {
        throw new HttpError(405, 'Méthode non autorisée');
      }

      await requireAuth(request, env);

      switch (pathname) {
        case '/generateQuestions':
          return await handleGenerateQuestions(request, env);
        case '/generateQuestionsFromAudio':
          return await handleGenerateQuestionsFromAudio(request, env);
        default:
          throw new HttpError(404, 'Route introuvable');
      }
    } catch (e) {
      if (e instanceof HttpError) {
        return json({ error: e.message }, e.status);
      }
      const message = e instanceof Error ? e.message : 'Erreur interne';
      return json({ error: message }, 500);
    }
  },
};
