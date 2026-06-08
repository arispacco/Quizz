import { GoogleGenAI, Type } from '@google/genai';
import { defineSecret } from 'firebase-functions/params';
import type { GeneratedQuestion } from './schema';

export const geminiApiKey = defineSecret('GEMINI_API_KEY');

const MODEL = 'gemini-2.5-flash';

const QUESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          intitule: { type: Type.STRING },
          theme: { type: Type.STRING },
          difficulte: { type: Type.NUMBER },
          reponses: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['intitule', 'theme', 'difficulte', 'reponses'],
      },
    },
  },
  required: ['questions'],
};

function getClient() {
  return new GoogleGenAI({ apiKey: geminiApiKey.value() });
}

export async function generateFromText(
  text: string,
  theme?: string,
  count = 5,
): Promise<GeneratedQuestion[]> {
  const ai = getClient();
  const prompt = `À partir du contenu suivant, génère exactement ${count} questions de quiz de type LISTING (plusieurs réponses possibles).
Chaque question doit avoir un intitulé clair, un thème, une difficulté de 1 à 5, et une liste de réponses valides.
${theme ? `Thème principal: ${theme}` : ''}

CONTENU:
${text.slice(0, 30000)}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: QUESTION_SCHEMA,
    },
  });

  const parsed = JSON.parse(response.text ?? '{"questions":[]}') as {
    questions: GeneratedQuestion[];
  };
  return parsed.questions ?? [];
}

export async function generateFromAudio(
  audioBase64: string,
  mimeType: string,
  theme?: string,
  count = 5,
): Promise<GeneratedQuestion[]> {
  const ai = getClient();
  const prompt = `Écoute cet audio et génère ${count} questions de quiz de type LISTING avec réponses multiples.
${theme ? `Thème: ${theme}` : ''}`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      { text: prompt },
      { inlineData: { mimeType, data: audioBase64 } },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: QUESTION_SCHEMA,
    },
  });

  const parsed = JSON.parse(response.text ?? '{"questions":[]}') as {
    questions: GeneratedQuestion[];
  };
  return parsed.questions ?? [];
}
