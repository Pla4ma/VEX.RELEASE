import { describe, expect, it } from 'vitest';

import { buildGhostRivals } from '../GhostRivalSystem';

describe('GhostRivalSystem', () => {
  it('creates three competitive ghost rivals for cold-start users', () => {
    const rivals = buildGhostRivals({
      userId: '11111111-1111-4111-8111-111111111111',
      level: 5,
      realRivalCount: 0,
      weeklyFocusMinutes: 120,
      sessionsPerWeek: 3,
      avgSessionDuration: 25,
    });

    expect(rivals).toHaveLength(3);
    expect(rivals.map((rival) => rival.profile.name)).toEqual(['Alex K.', 'Jordan M.', 'Sam P.']);
    expect(rivals.every((rival) => rival.isGhost)).toBe(true);
    expect(rivals.every((rival) => rival.weeklyScore.theirs >= 100)).toBe(true);
  });
});
