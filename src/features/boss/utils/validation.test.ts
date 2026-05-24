/**
 * Boss Validation Tests
 *
 * @phase 11 - Deepening: Validation tests
 */

import {
  validateBossAttack,
  BossDifficultySchema,
  BossAttackSchema,
  type BossAttack,
} from './validation';

describe('Boss Validation', () => {
  describe('validateBossAttack', () => {
    it('should validate normal attack', () => {
      const attack: BossAttack = {
        playerId: 'user-1',
        damage: 150,
        timestamp: Date.now(),
        attackType: 'NORMAL',
        sessionDuration: 1500,
      };

      const result = validateBossAttack(attack, {
        id: 'boss-1',
        difficulty: 'MEDIUM',
        maxHealth: 1000,
        expectedDps: 0.5,
      }, {
        avgDamage: 150,
        avgSessionDuration: 1500,
        previousAttacks: [],
      });

      expect(result.valid).toBe(true);
      expect(result.suspicious).toBe(false);
    });

    it('should detect suspicious damage rate', () => {
      const attack: BossAttack = {
        playerId: 'user-1',
        damage: 5000,
        timestamp: Date.now(),
        attackType: 'CRITICAL',
        sessionDuration: 60,
      };

      const result = validateBossAttack(attack, {
        id: 'boss-1',
        difficulty: 'HARD',
        maxHealth: 1000,
        expectedDps: 0.5,
      }, {
        avgDamage: 200,
        avgSessionDuration: 1500,
        previousAttacks: [],
      });

      expect(result.suspicious).toBe(true);
    });

    it('should reject negative damage', () => {
      const attack: BossAttack = {
        playerId: 'user-1',
        damage: -100,
        timestamp: Date.now(),
        attackType: 'NORMAL',
        sessionDuration: 1500,
      };

      const result = validateBossAttack(attack, {
        id: 'boss-1',
        difficulty: 'EASY',
        maxHealth: 1000,
        expectedDps: 0.3,
      }, {
        avgDamage: 100,
        avgSessionDuration: 1500,
        previousAttacks: [],
      });

      expect(result.valid).toBe(false);
    });
  });

  describe('BossDifficultySchema', () => {
    it('should validate valid difficulties', () => {
      expect(BossDifficultySchema.parse('EASY')).toBe('EASY');
      expect(BossDifficultySchema.parse('MEDIUM')).toBe('MEDIUM');
      expect(BossDifficultySchema.parse('HARD')).toBe('HARD');
      expect(BossDifficultySchema.parse('NIGHTMARE')).toBe('NIGHTMARE');
    });

    it('should reject invalid difficulty', () => {
      expect(() => BossDifficultySchema.parse('IMPOSSIBLE')).toThrow();
    });
  });

  describe('BossAttackSchema', () => {
    it('should validate valid attack', () => {
      const data: BossAttack = {
        playerId: 'user-1',
        damage: 150,
        timestamp: Date.now(),
        attackType: 'NORMAL',
        sessionDuration: 1500,
      };
      expect(BossAttackSchema.parse(data)).toEqual(data);
    });

    it('should reject negative damage', () => {
      expect(() => BossAttackSchema.parse({
        playerId: 'user-1',
        damage: -10,
        timestamp: Date.now(),
        attackType: 'NORMAL',
        sessionDuration: 1500,
      })).toThrow();
    });
  });
});
