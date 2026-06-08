import { createDuel } from '@/game';

test('app bootstrap modules load', () => {
  const duel = createDuel('test', 'match', 'a', 'b');
  expect(duel.status).toBe('choosing');
});
