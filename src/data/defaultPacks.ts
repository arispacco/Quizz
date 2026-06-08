import type { Pack, Question } from '@/models';

const now = new Date().toISOString();

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'dq1',
    intitule: 'Citez des fruits de couleur jaune',
    theme: 'Alimentation',
    difficulty: 2,
    reponses: ['banane', 'citron', 'ananas', 'pomme golden'],
    createdAt: now,
  },
  {
    id: 'dq2',
    intitule: 'Citez des langages de programmation',
    theme: 'Informatique',
    difficulty: 2,
    reponses: ['javascript', 'python', 'java', 'c', 'rust'],
    createdAt: now,
  },
  {
    id: 'dq3',
    intitule: 'Citez des pays d\'Afrique',
    theme: 'Géographie',
    difficulty: 3,
    reponses: ['maroc', 'sénégal', 'nigeria', 'kenya', 'égypte'],
    createdAt: now,
  },
  {
    id: 'dq4',
    intitule: 'Citez des animés isekai',
    theme: 'Culture Générale',
    difficulty: 3,
    reponses: ['re zero', 'overlord', 'konosuba', 'mushoku tensei'],
    createdAt: now,
  },
];

export const DEFAULT_PACKS: Pack[] = [
  {
    id: 'pack-default-1',
    name: 'Culture Générale — Starter',
    description: 'Pack intégré pour démarrer hors ligne',
    mainTheme: 'Culture Générale',
    coverColor: '#7C3AED',
    authorId: 'system',
    authorPseudo: 'Le Jeu',
    visibility: 'public',
    questionCount: DEFAULT_QUESTIONS.length,
    averageDifficulty: 2.5,
    rating: 4.5,
    downloaded: true,
    createdAt: now,
    updatedAt: now,
  },
];
