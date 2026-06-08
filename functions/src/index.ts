/**
 * Cloud Functions HTTPS callable — génération de questions quiz via Gemini 2.5 Flash.
 * Région europe-west1, authentification Firebase requise, secret GEMINI_API_KEY.
 * @module functions/index
 */
import { initializeApp } from 'firebase-admin/app';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { generateFromAudio, generateFromText, geminiApiKey } from './gemini';

initializeApp();

function requireAuth(authHeader?: string) {
  if (!authHeader) {
    throw new HttpsError('unauthenticated', 'Authentification requise');
  }
}

/** Génère des questions de type listing à partir d'un texte source (≥ 50 car.). */
export const generateQuestions = onCall(
  { secrets: [geminiApiKey], region: 'europe-west1' },
  async request => {
    requireAuth(request.auth?.uid);
    const { text, theme, count } = request.data as {
      text?: string;
      theme?: string;
      count?: number;
    };
    if (!text || text.trim().length < 50) {
      throw new HttpsError('invalid-argument', 'Le texte source doit faire au moins 50 caractères');
    }
    const questions = await generateFromText(text, theme, count ?? 5);
    return {
      questions: questions.map(q => ({
        intitule: q.intitule,
        theme: q.theme,
        difficulty: q.difficulte as 1 | 2 | 3 | 4 | 5,
        reponses: q.reponses,
      })),
    };
  },
);

/** Génère des questions à partir d'un fichier audio (base64 + mimeType). */
export const generateQuestionsFromAudio = onCall(
  { secrets: [geminiApiKey], region: 'europe-west1' },
  async request => {
    requireAuth(request.auth?.uid);
    const { audioBase64, mimeType, theme, count } = request.data as {
      audioBase64?: string;
      mimeType?: string;
      theme?: string;
      count?: number;
    };
    if (!audioBase64 || !mimeType) {
      throw new HttpsError('invalid-argument', 'audioBase64 et mimeType requis');
    }
    const questions = await generateFromAudio(audioBase64, mimeType, theme, count ?? 5);
    return {
      questions: questions.map(q => ({
        intitule: q.intitule,
        theme: q.theme,
        difficulty: q.difficulte as 1 | 2 | 3 | 4 | 5,
        reponses: q.reponses,
      })),
    };
  },
);
