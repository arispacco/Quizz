import { calculateAnswerPoints, getThemeMultiplier } from '../scoring';
import type { ThemePhase } from '@/models';

const phases: ThemePhase[] = [
  { phase: 'groups', theme: 'Programmation C', multiplier: 1 },
  { phase: 'quarters', theme: 'Informatique', multiplier: 1.5 },
  { phase: 'final', theme: 'Culture Générale', multiplier: 2 },
];

describe('Scoring', () => {
  it('returns 1 for exact theme match', () => {
    expect(getThemeMultiplier('Programmation C', 'Programmation C', phases)).toBe(1);
  });

  it('calculates broader theme multiplier', () => {
    const points = calculateAnswerPoints(1, 'Programmation C', 'Informatique', phases);
    expect(points).toBeGreaterThanOrEqual(1);
  });
});
