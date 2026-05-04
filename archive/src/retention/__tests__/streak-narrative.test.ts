/**
 * Streak Narrative Tests
 * Comprehensive test coverage for retention psychology system
 */

import {
  generateStreakNarrative,
  generateRiskWarning,
  generateBreakRecovery,
  getCurrentBoss,
  getBossForStreakDay,
  STREAK_BOSSES,
} from '../streak-narrative';
import {
  StreakNarrativeInputSchema,
  StreakBossSchema,
  StreakNarrativeSchema,
} from '../streak-narrative-schemas';

describe('Streak Narrative System', () => {
  describe('STREAK_BOSSES', () => {
    it('should have 5 bosses defined', () => {
      expect(STREAK_BOSSES).toHaveLength(5);
    });

    it('should have unique IDs', () => {
      const ids = STREAK_BOSSES.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have non-empty taunts for each boss', () => {
      STREAK_BOSSES.forEach((boss) => {
        expect(boss.taunt.length).toBeGreaterThan(0);
        boss.taunt.forEach((taunt) => {
          expect(taunt).toBeTruthy();
        });
      });
    });

    it('should have valid difficulty levels', () => {
      const validDifficulties = ['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'];
      STREAK_BOSSES.forEach((boss) => {
        expect(validDifficulties).toContain(boss.difficulty);
      });
    });

    it('should have non-overlapping streak ranges', () => {
      for (let i = 0; i < STREAK_BOSSES.length - 1; i++) {
        const current = STREAK_BOSSES[i];
        const next = STREAK_BOSSES[i + 1];
        expect(current.maxStreakFor).toBeLessThan(next.minStreakToUnlock);
      }
    });
  });

  describe('getCurrentBoss', () => {
    it('should return Phantom for day 0', () => {
      const boss = getCurrentBoss(0);
      expect(boss.id).toBe('phantom');
    });

    it('should return Phantom for day 3', () => {
      const boss = getCurrentBoss(3);
      expect(boss.id).toBe('phantom');
    });

    it('should return Kraken for day 7', () => {
      const boss = getCurrentBoss(7);
      expect(boss.id).toBe('kraken');
    });

    it('should return Dragon for day 14', () => {
      const boss = getCurrentBoss(14);
      expect(boss.id).toBe('dragon');
    });

    it('should return Titan for day 30', () => {
      const boss = getCurrentBoss(30);
      expect(boss.id).toBe('titan');
    });

    it('should return Void for day 100', () => {
      const boss = getCurrentBoss(100);
      expect(boss.id).toBe('void');
    });

    it('should return hardest boss for extreme streaks', () => {
      const boss = getCurrentBoss(999);
      expect(boss.id).toBe('void');
    });
  });

  describe('getBossForStreakDay', () => {
    it('should return correct boss for historical day', () => {
      const boss = getBossForStreakDay(7);
      expect(boss?.id).toBe('kraken');
    });

    it('should return null for days outside all ranges', () => {
      const boss = getBossForStreakDay(-1);
      expect(boss).toBeNull();
    });
  });

  describe('generateStreakNarrative', () => {
    it('should generate narrative for new user', () => {
      const narrative = generateStreakNarrative(0, 0, 0);
      expect(narrative.currentChapter).toBe('The Beginning');
      expect(narrative.currentBoss.id).toBe('phantom');
      expect(narrative.personalStory).toContain('journey has just begun');
    });

    it('should generate narrative for streak under 3 days', () => {
      const narrative = generateStreakNarrative(2, 2, 5);
      expect(narrative.currentChapter).toBe('First Victories');
    });

    it('should generate narrative for week warrior', () => {
      const narrative = generateStreakNarrative(7, 7, 10);
      expect(narrative.currentChapter).toBe('The Week Warrior');
      expect(narrative.currentBoss.id).toBe('kraken');
    });

    it('should detect personal best', () => {
      const narrative = generateStreakNarrative(8, 8, 20);
      expect(narrative.personalStory).toContain('personal best');
    });

    it('should detect near record', () => {
      const narrative = generateStreakNarrative(8, 10, 20);
      expect(narrative.personalStory).toContain('close to your record');
    });

    it('should include next milestone teaser', () => {
      const narrative = generateStreakNarrative(2, 2, 5);
      expect(narrative.nextMilestone.teaser).toContain('Day 3');
      expect(narrative.nextMilestone.boss.id).toBe('kraken');
    });

    it('should select random taunt based on streak day', () => {
      const narrative1 = generateStreakNarrative(0, 0, 0);
      const narrative2 = generateStreakNarrative(1, 1, 1);
      // Taunts should be from the same boss but potentially different
      expect(narrative1.currentBoss.taunt).toContain(narrative1.dailyTaunt);
    });
  });

  describe('generateRiskWarning', () => {
    it('should generate LOW urgency warning', () => {
      const warning = generateRiskWarning(7, 18, STREAK_BOSSES[0]);
      expect(warning.urgency).toBe('LOW');
    });

    it('should generate MEDIUM urgency warning', () => {
      const warning = generateRiskWarning(7, 6, STREAK_BOSSES[0]);
      expect(warning.urgency).toBe('MEDIUM');
    });

    it('should generate HIGH urgency warning', () => {
      const warning = generateRiskWarning(7, 1, STREAK_BOSSES[0]);
      expect(warning.urgency).toBe('HIGH');
    });

    it('should generate CRITICAL urgency warning', () => {
      const warning = generateRiskWarning(7, 0.25, STREAK_BOSSES[0]);
      expect(warning.urgency).toBe('CRITICAL');
    });

    it('should include boss name in headline', () => {
      const warning = generateRiskWarning(7, 1, STREAK_BOSSES[1]);
      expect(warning.headline).toContain('Kraken');
    });

    it('should include streak days in story', () => {
      const warning = generateRiskWarning(7, 1, STREAK_BOSSES[0]);
      expect(warning.story).toContain('7');
    });
  });

  describe('generateBreakRecovery', () => {
    it('should generate recovery for broken 7-day streak', () => {
      const recovery = generateBreakRecovery(7, 7, 0);
      expect(recovery.title).toContain('Record Streak Broken');
      expect(recovery.comebackBoss.id).toBe('phantom');
    });

    it('should include comeback token option if available', () => {
      const recovery = generateBreakRecovery(7, 7, 2);
      expect(recovery.comebackQuest).toContain('Comeback Token');
    });

    it('should provide quest without token if none available', () => {
      const recovery = generateBreakRecovery(5, 5, 0);
      expect(recovery.comebackQuest).toContain('Start Day 1');
    });

    it('should include encouraging message', () => {
      const recovery = generateBreakRecovery(10, 10, 0);
      expect(recovery.encouragement).toBeTruthy();
    });
  });
});

describe('Streak Narrative Schemas', () => {
  describe('StreakBossSchema', () => {
    it('should validate valid boss', () => {
      const validBoss = {
        id: 'test',
        name: 'Test Boss',
        title: 'The Tester',
        avatar: 'test.png',
        description: 'A test boss',
        taunt: ['Test taunt'],
        defeatCry: ['Test cry'],
        minStreakToUnlock: 0,
        maxStreakFor: 10,
        difficulty: 'EASY',
      };
      const result = StreakBossSchema.safeParse(validBoss);
      expect(result.success).toBe(true);
    });

    it('should reject boss with invalid difficulty', () => {
      const invalidBoss = {
        id: 'test',
        name: 'Test Boss',
        title: 'The Tester',
        avatar: 'test.png',
        description: 'A test boss',
        taunt: ['Test taunt'],
        defeatCry: ['Test cry'],
        minStreakToUnlock: 0,
        maxStreakFor: 10,
        difficulty: 'INVALID',
      };
      const result = StreakBossSchema.safeParse(invalidBoss);
      expect(result.success).toBe(false);
    });

    it('should reject boss with negative streak values', () => {
      const invalidBoss = {
        id: 'test',
        name: 'Test Boss',
        title: 'The Tester',
        avatar: 'test.png',
        description: 'A test boss',
        taunt: ['Test taunt'],
        defeatCry: ['Test cry'],
        minStreakToUnlock: -1,
        maxStreakFor: 10,
        difficulty: 'EASY',
      };
      const result = StreakBossSchema.safeParse(invalidBoss);
      expect(result.success).toBe(false);
    });
  });

  describe('StreakNarrativeInputSchema', () => {
    it('should validate valid input', () => {
      const validInput = {
        streakDays: 7,
        maxStreak: 10,
        totalSessions: 20,
        hoursSinceLastSession: 2,
        comebackTokens: 1,
      };
      const result = StreakNarrativeInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject negative streak days', () => {
      const invalidInput = {
        streakDays: -1,
        maxStreak: 10,
        totalSessions: 20,
        hoursSinceLastSession: 2,
        comebackTokens: 1,
      };
      const result = StreakNarrativeInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject negative hours', () => {
      const invalidInput = {
        streakDays: 7,
        maxStreak: 10,
        totalSessions: 20,
        hoursSinceLastSession: -1,
        comebackTokens: 1,
      };
      const result = StreakNarrativeInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('StreakNarrativeSchema', () => {
    it('should validate complete narrative', () => {
      const validNarrative = {
        currentBoss: STREAK_BOSSES[0],
        dailyTaunt: 'Test taunt',
        currentChapter: 'Test Chapter',
        nextMilestone: {
          day: 3,
          boss: STREAK_BOSSES[1],
          teaser: 'Next boss coming',
        },
        personalStory: 'Your story here',
      };
      const result = StreakNarrativeSchema.safeParse(validNarrative);
      expect(result.success).toBe(true);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle extremely high streak days gracefully', () => {
    const narrative = generateStreakNarrative(1000, 1000, 5000);
    expect(narrative.currentBoss).toBeDefined();
    expect(narrative.currentChapter).toBe('Immortal Focus');
  });

  it('should handle zero total sessions', () => {
    const narrative = generateStreakNarrative(0, 0, 0);
    expect(narrative.personalStory).toContain('journey has just begun');
  });

  it('should handle streak equal to max streak', () => {
    const narrative = generateStreakNarrative(10, 10, 50);
    expect(narrative.personalStory).toContain('personal best');
  });

  it('should handle broken streak with zero comeback tokens', () => {
    const recovery = generateBreakRecovery(5, 5, 0);
    expect(recovery.comebackQuest).toContain('Start Day 1');
  });

  it('should cycle through taunts based on streak day', () => {
    const boss = STREAK_BOSSES[0];
    const tauntCount = boss.taunt.length;
    
    // Different days should potentially get different taunts
    const narrative0 = generateStreakNarrative(0, 0, 0);
    const narrative1 = generateStreakNarrative(1, 1, 1);
    
    // Both should have valid taunts from the boss
    expect(boss.taunt).toContain(narrative0.dailyTaunt);
    expect(boss.taunt).toContain(narrative1.dailyTaunt);
  });
});
