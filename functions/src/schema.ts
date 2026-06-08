import { z } from 'zod';

export const questionSchema = z.object({
  intitule: z.string().describe('Question de type listing'),
  theme: z.string(),
  difficulte: z.number().min(1).max(5),
  reponses: z.array(z.string()).min(1),
});

export const generateResponseSchema = z.object({
  questions: z.array(questionSchema),
});

export type GeneratedQuestion = z.infer<typeof questionSchema>;
