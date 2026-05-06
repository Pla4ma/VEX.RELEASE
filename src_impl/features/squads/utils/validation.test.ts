/**
 * Squad Validation Tests
 *
 * @phase 4 - Deepening: Validation tests
 */

import {
  validateSquadName,
  validateSquadDescription,
  validateRoleChange,
  validateMemberLimit,
  validateSynergyLevel,
} from './validation';

describe('Squad Validation', () => {
  describe('validateSquadName', () => {
    it('should validate a valid squad name', () => {
      const result = validateSquadName('Awesome Squad');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('Awesome Squad');
    });

    it('should reject empty names', () => {
      const result = validateSquadName('');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Name cannot be empty');
    });

    it('should reject names that are too long', () => {
      const result = validateSquadName('A'.repeat(31));
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('30 characters'))).toBe(true);
    });

    it('should reject profanity', () => {
      const result = validateSquadName('BadWord');
      expect(result.valid).toBe(false);
    });

    it('should trim whitespace', () => {
      const result = validateSquadName('  Awesome Squad  ');
      expect(result.normalized).toBe('Awesome Squad');
    });
  });

  describe('validateSquadDescription', () => {
    it('should validate a valid description', () => {
      const result = validateSquadDescription('We focus together and achieve goals!');
      expect(result.valid).toBe(true);
    });

    it('should reject descriptions that are too long', () => {
      const result = validateSquadDescription('A'.repeat(201));
      expect(result.valid).toBe(false);
    });
  });

  describe('validateRoleChange', () => {
    it('should allow founder to promote to leader', () => {
      const result = validateRoleChange(
        { userId: 'member-1', currentRole: 'MEMBER', targetRole: 'LEADER' },
        { requesterRole: 'FOUNDER', isSelf: false }
      );
      expect(result.valid).toBe(true);
    });

    it('should reject self-demotion from founder', () => {
      const result = validateRoleChange(
        { userId: 'founder-1', currentRole: 'FOUNDER', targetRole: 'LEADER' },
        { requesterRole: 'FOUNDER', isSelf: true }
      );
      expect(result.valid).toBe(false);
    });

    it('should reject member promoting others', () => {
      const result = validateRoleChange(
        { userId: 'member-2', currentRole: 'MEMBER', targetRole: 'LEADER' },
        { requesterRole: 'MEMBER', isSelf: false }
      );
      expect(result.valid).toBe(false);
    });
  });

  describe('validateMemberLimit', () => {
    it('should allow member under limit', () => {
      const result = validateMemberLimit(
        { currentCount: 4, maxMembers: 10 },
        { targetCount: 5 }
      );
      expect(result.valid).toBe(true);
    });

    it('should reject over limit', () => {
      const result = validateMemberLimit(
        { currentCount: 10, maxMembers: 10 },
        { targetCount: 11 }
      );
      expect(result.valid).toBe(false);
    });
  });

  describe('validateSynergyLevel', () => {
    it('should validate normal progression', () => {
      const result = validateSynergyLevel(
        { currentLevel: 5, targetLevel: 6 },
        { xpContributed: 1000, membersCount: 5 }
      );
      expect(result.valid).toBe(true);
    });

    it('should detect impossible jump', () => {
      const result = validateSynergyLevel(
        { currentLevel: 5, targetLevel: 10 },
        { xpContributed: 100, membersCount: 5 }
      );
      expect(result.valid).toBe(false);
    });
  });
});
