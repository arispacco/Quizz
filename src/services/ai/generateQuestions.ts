/**
 * Client du backend IA (Cloudflare Worker) pour la génération de questions
 * (texte et audio). Le Worker remplace les anciennes Cloud Functions Firebase.
 * Nécessite Firebase configuré et un utilisateur authentifié (hors mode démo) :
 * l'ID token Firebase est transmis en `Authorization: Bearer <token>`.
 * @module services/ai/generateQuestions
 */
import auth from '@react-native-firebase/auth';
import { AI_BACKEND_URL } from '@/config/ai';
import type { Question } from '@/models';
import { ensureFirebase } from '@/services/firebase';

export interface GenerateQuestionsRequest {
  text: string;
  theme?: string;
  count?: number;
}

export interface GenerateQuestionsResponse {
  questions: Omit<Question, 'id' | 'createdAt'>[];
}

/** POST authentifié vers le Worker IA, avec l'ID token Firebase courant. */
async function postToAiBackend<T>(path: string, body: unknown): Promise<T> {
  if (!ensureFirebase()) {
    throw new Error('Firebase non configuré. Ajoutez vos clés dans .env');
  }
  const user = auth().currentUser;
  if (!user) {
    throw new Error('Authentification requise');
  }
  const token = await user.getIdToken();

  const response = await fetch(`${AI_BACKEND_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `IA indisponible (${response.status})`;
    try {
      const err = (await response.json()) as { error?: string };
      if (err?.error) {
        message = err.error;
      }
    } catch {
      // Corps non JSON : on garde le message par défaut.
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

/** Appelle `/generateQuestions` avec un texte source (min. 50 caractères côté serveur). */
export async function generateQuestionsFromText(
  request: GenerateQuestionsRequest,
): Promise<GenerateQuestionsResponse> {
  return postToAiBackend<GenerateQuestionsResponse>('/generateQuestions', request);
}

/** Appelle `/generateQuestionsFromAudio` avec un fichier audio encodé en base64. */
export async function generateQuestionsFromAudio(
  audioBase64: string,
  mimeType: string,
  theme?: string,
): Promise<GenerateQuestionsResponse> {
  return postToAiBackend<GenerateQuestionsResponse>('/generateQuestionsFromAudio', {
    audioBase64,
    mimeType,
    theme,
  });
}
