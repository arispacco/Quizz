import type { ThemePhase } from '@/models';

/**
 * Calcule le multiplicateur de points selon la hiérarchie des thèmes.
 * Ex: phase "Informatique", question "Programmation C" → 1.5
 *     phase "Culture Générale", question "Programmation C" → 2.0
 */
export function getThemeMultiplier(
  questionTheme: string,
  phaseTheme: string,
  themePhases: ThemePhase[],
): number {
  const normalizedQuestion = normalizeTheme(questionTheme);
  const normalizedPhase = normalizeTheme(phaseTheme);

  if (normalizedQuestion === normalizedPhase) {
    return 1;
  }

  const phaseIndex = themePhases.findIndex(
    t => normalizeTheme(t.theme) === normalizedPhase,
  );
  if (phaseIndex === -1) {
    return 1;
  }

  for (let i = phaseIndex - 1; i >= 0; i--) {
    const parent = normalizeTheme(themePhases[i].theme);
    if (normalizedQuestion.includes(parent) || parent.includes(normalizedQuestion)) {
      return themePhases[i].multiplier;
    }
  }

  const broaderPhase = themePhases[themePhases.length - 1];
  if (broaderPhase && normalizedPhase !== normalizeTheme(broaderPhase.theme)) {
    return broaderPhase.multiplier;
  }

  return 1;
}

export function normalizeTheme(theme: string): string {
  return theme.trim().toLowerCase();
}

export function calculateAnswerPoints(
  basePoints: number,
  questionTheme: string,
  currentPhaseTheme: string,
  themePhases: ThemePhase[],
): number {
  const multiplier = getThemeMultiplier(questionTheme, currentPhaseTheme, themePhases);
  return basePoints * multiplier;
}

export const PHASE_MULTIPLIERS: Record<string, number> = {
  groups: 1,
  quarters: 1.5,
  semis: 2,
  final: 3,
};

export function getPlayerValue(duelsWon: number, phase: keyof typeof PHASE_MULTIPLIERS): number {
  return duelsWon * (PHASE_MULTIPLIERS[phase] ?? 1);
}
