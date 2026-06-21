/**
 * Mastery Feature — generateMasteryChallenges (real implementation) Tests
 */

import type { MasteryState, MasteryRank } from '../types';

describe('generateMasteryChallenges (real implementation)', () => {

  const actual = jest.requireActual('../challenge-generator') as {
    generateMasteryChallenges: (techniques: MasteryState['techniques'], rank: MasteryRank) => Array<{ technique: string; difficulty: string; status: string; current: number; completedAt: null }>;
  };

  it('generates 1-2 challenges', () => {
    const techniques = {
      durationMastery: 0,
      purityMastery: 5,
      consistencyMastery: 10,
      comebackMastery: 15,
      bossMastery: 20,
    };
    const challenges = actual.generateMasteryChallenges(techniques, 'APPRENTICE');
    expect(challenges.length).toBeGreaterThanOrEqual(1);
    expect(challenges.length).toBeLessThanOrEqual(2);
  });

  it('focuses on the highest technique', () => {
    const techniques = {
      durationMastery: 0,
      purityMastery: 5,
      consistencyMastery: 10,
      comebackMastery: 15,
      bossMastery: 10,
    };
    const challenges = actual.generateMasteryChallenges(techniques, 'APPRENTICE');
    expect(challenges[0]?.technique).toBe('comebackMastery');
  });

  it('uses EASY difficulty for highest technique level < 5 when EASY template exists', () => {
    // consistencyMastery has an EASY template; make it the highest at level 2
    const techniques = {
      durationMastery: 0,
      purityMastery: 0,
      consistencyMastery: 2,
      comebackMastery: 1,
      bossMastery: 1,
    };
    const challenges = actual.generateMasteryChallenges(techniques, 'APPRENTICE');
    expect(challenges[0]?.difficulty).toBe('EASY');
  });

  it('falls back to first template when no matching difficulty exists', () => {
    // durationMastery has no EASY template — make it the highest at level 2
    const techniques = {
      durationMastery: 2,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    };
    const challenges = actual.generateMasteryChallenges(techniques, 'APPRENTICE');
    expect(challenges[0]?.difficulty).toBe('MEDIUM');
  });

  it('all generated challenges have status ACTIVE and current 0', () => {
    const techniques = {
      durationMastery: 3,
      purityMastery: 10,
      consistencyMastery: 10,
      comebackMastery: 10,
      bossMastery: 10,
    };
    const challenges = actual.generateMasteryChallenges(techniques, 'ADEPT');
    for (const c of challenges) {
      expect(c.status).toBe('ACTIVE');
      expect(c.current).toBe(0);
      expect(c.completedAt).toBeNull();
    }
  });
});
