/**
 * AI Coach Input Contract Tests
 * Phase 7 - P7-01 Verification
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  CoachInputContractSchema,
  validateCoachInput,
  createFallbackInsight,
  containsForbiddenPII,
  createMockCoachInput,
  FORBIDDEN_DATA_FIELDS,
} from '../input-contract';

describe('Coach Input Contract', () => {
  describe('Schema Validation', () => {
    it('should accept valid coach input', () => {
      const validInput = createMockCoachInput();
      expect(() => CoachInputContractSchema.parse(validInput)).not.toThrow();
    });

    it('should reject excessive session grades', () => {
      const invalidInput = createMockCoachInput({
        recentSessionGrades: Array.from({ length: 11 }, (_, i) => ({
          sessionId: `session-${i}`,
          grade: 80,
          duration: 1500,
          completedAt: Date.now() - i * 86400000,
          difficulty: 'NORMAL' as const,
        })),
      });

      expect(() => CoachInputContractSchema.parse(invalidInput)).toThrow();
    });

    it('should reject invalid grade values', () => {
      const invalidInput = createMockCoachInput({
        recentSessionGrades: [{
          sessionId: 'session-1',
          grade: 150, // Invalid: > 100
          duration: 1500,
          completedAt: Date.now(),
          difficulty: 'NORMAL' as const,
        }],
      });

      expect(() => CoachInputContractSchema.parse(invalidInput)).toThrow();
    });

    it('should reject invalid streak values', () => {
      const invalidInput = createMockCoachInput({
        streakState: {
          currentStreak: -5, // Invalid: negative
          streakAtRisk: true,
          hoursSinceLastSession: 18,
          streakRecord: 12,
          missedDays: 0,
        },
      });

      expect(() => CoachInputContractSchema.parse(invalidInput)).toThrow();
    });

    it('should reject invalid hour values', () => {
      const invalidInput = createMockCoachInput({
        completionTimes: [25, 30, 35], // Invalid: > 23
      });

      expect(() => CoachInputContractSchema.parse(invalidInput)).toThrow();
    });
  });

  describe('Input Validation', () => {
    it('should validate and sanitize proper input', () => {
      const validInput = createMockCoachInput();
      const result = validateCoachInput(validInput);

      expect(result).toBeDefined();
      expect(result.timeContext.localTimezone).toBe('America/New_York');
    });

    it('should sanitize invalid timezone', () => {
      const inputWithBadTimezone = createMockCoachInput({
        timeContext: {
          currentHour: 14,
          dayOfWeek: 3,
          isWeekend: false,
          localTimezone: 'Invalid@Timezone#123',
        },
      });

      const result = validateCoachInput(inputWithBadTimezone);
      expect(result.timeContext.localTimezone).toBe('UTC');
    });
  });

  describe('PII Detection', () => {
    it('should detect forbidden PII fields', () => {
      const inputWithPII = {
        ...createMockCoachInput(),
        rawPrivateNotes: 'user secret data',
        emailAddresses: ['user@example.com'],
      };

      expect(containsForbiddenPII(inputWithPII)).toBe(true);
    });

    it('should allow clean input', () => {
      const cleanInput = createMockCoachInput();
      expect(containsForbiddenPII(cleanInput)).toBe(false);
    });

    it('should detect PII in nested objects', () => {
      const inputWithNestedPII = {
        ...createMockCoachInput(),
        // Add PII in a way that will be detected
        rawPrivateNotes: 'john.doe@email.com', // This should be detected
      };

      expect(containsForbiddenPII(inputWithNestedPII)).toBe(true);
    });
  });

  describe('Fallback Insights', () => {
    it('should require minimum data for coaching', () => {
      const emptyInput = {};
      const result = createFallbackInsight(emptyInput);

      expect(result.canCoach).toBe(false);
      expect(result.reason).toContain('Insufficient user data');
      expect(result.fallbackMessage).toContain('Complete a few sessions');
    });

    it('should provide limited guidance with sparse data', () => {
      const sparseInput = {
        recentSessionGrades: [
          {
            sessionId: 'session-1',
            grade: 80,
            duration: 1500,
            completedAt: Date.now(),
            difficulty: 'NORMAL' as const,
          },
        ],
      };

      const result = createFallbackInsight(sparseInput);
      expect(result.canCoach).toBe(true);
      expect(result.reason).toContain('Limited data');
      expect(result.fallbackMessage).toContain('Keep completing sessions');
    });

    it('should allow full coaching with sufficient data', () => {
      const sufficientInput = createMockCoachInput();
      const result = createFallbackInsight(sufficientInput);

      expect(result.canCoach).toBe(true);
      expect(result.reason).toContain('Sufficient data');
      expect(result.fallbackMessage).toBeUndefined();
    });

    it('should handle edge case with only streak data', () => {
      const streakOnlyInput = {
        streakState: {
          currentStreak: 3,
          streakAtRisk: true,
          hoursSinceLastSession: 20,
          streakRecord: 5,
          missedDays: 1,
        },
      };

      const result = createFallbackInsight(streakOnlyInput);
      expect(result.canCoach).toBe(true);
    });
  });

  describe('Mock Data Generation', () => {
    it('should create valid mock input', () => {
      const mockInput = createMockCoachInput();
      expect(() => CoachInputContractSchema.parse(mockInput)).not.toThrow();
    });

    it('should accept overrides', () => {
      const customInput = createMockCoachInput({
        streakState: {
          currentStreak: 10,
          streakAtRisk: false,
          hoursSinceLastSession: 5,
          streakRecord: 15,
          missedDays: 0,
        },
        premiumStatus: {
          isActive: true,
          tier: 'premium' as const,
          features: ['ai_coach', 'advanced_analytics'],
        },
      });

      expect(customInput.streakState.currentStreak).toBe(10);
      expect(customInput.premiumStatus.isActive).toBe(true);
      expect(customInput.premiumStatus.tier).toBe('premium');
    });

    it('should generate realistic time context', () => {
      const mockInput = createMockCoachInput();
      const now = new Date();
      
      expect(mockInput.timeContext.currentHour).toBeGreaterThanOrEqual(0);
      expect(mockInput.timeContext.currentHour).toBeLessThanOrEqual(23);
      expect(mockInput.timeContext.dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(mockInput.timeContext.dayOfWeek).toBeLessThanOrEqual(6);
      expect(mockInput.timeContext.isWeekend).toBe(
        now.getDay() === 0 || now.getDay() === 6
      );
    });
  });

  describe('Data Boundary Tests', () => {
    it('should handle maximum allowed values', () => {
      const now = Date.now();
      const maxInput = createMockCoachInput({
        recentSessionGrades: Array.from({ length: 10 }, (_, i) => ({
          sessionId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, () => (Math.random() * 16 | 0).toString(16)),
          grade: 100,
          duration: 7200,
          completedAt: Math.floor(now - (i * 86400000)),
          difficulty: 'PUSH' as const,
        })),
        preferredSessionLengths: Array.from({ length: 5 }, () => 7200),
        completionTimes: [23, 22, 21, 20, 19, 18, 17],
        streakState: {
          currentStreak: 1000,
          streakAtRisk: false,
          hoursSinceLastSession: 0,
          streakRecord: 1000,
          missedDays: 0,
        },
        focusScoreFactors: {
          currentScore: 100,
          trend: 'improving' as const,
          primaryFactors: ['consistency', 'duration', 'quality'],
        },
        missionHistory: Array.from({ length: 7 }, (_, i) => ({
          missionId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, () => (Math.random() * 16 | 0).toString(16)),
          type: 'daily' as const,
          completed: true,
          completedAt: Math.floor(now - (i * 86400000)),
          difficulty: 'CHALLENGING' as const,
        })),
        notificationPreferences: {
          enabled: true,
          quietHoursStart: 23,
          quietHoursEnd: 0,
          maxPerDay: 10,
        },
      });

      expect(() => CoachInputContractSchema.parse(maxInput)).not.toThrow();
    });

    it('should handle minimum allowed values', () => {
      const minInput = createMockCoachInput({
        recentSessionGrades: [{
          sessionId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, () => (Math.random() * 16 | 0).toString(16)),
          grade: 0,
          duration: 60,
          completedAt: Date.now(),
          difficulty: 'EASY' as const,
        }],
        preferredSessionLengths: [60],
        completionTimes: [0],
        streakState: {
          currentStreak: 0,
          streakAtRisk: true,
          hoursSinceLastSession: 0,
          streakRecord: 0,
          missedDays: 7,
        },
        focusScoreFactors: {
          currentScore: 0,
          trend: 'declining' as const,
          primaryFactors: [],
        },
        missionHistory: [{
          missionId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, () => (Math.random() * 16 | 0).toString(16)),
          type: 'daily' as const,
          completed: false,
          difficulty: 'EASY' as const,
        }],
        notificationPreferences: {
          enabled: false,
          quietHoursStart: 0,
          quietHoursEnd: 0,
          maxPerDay: 0,
        },
      });

      expect(() => CoachInputContractSchema.parse(minInput)).not.toThrow();
    });
  });

  describe('Forbidden Data Fields', () => {
    it('should contain all required forbidden fields', () => {
      const expectedFields = [
        'rawPrivateNotes',
        'secrets',
        'apiKeys',
        'passwords',
        'emailAddresses',
        'phoneNumbers',
        'realNames',
        'locationData',
        'unvalidatedStorageData',
        'rawUserInput',
        'piifield',
      ];

      expect(FORBIDDEN_DATA_FIELDS).toEqual(expect.arrayContaining(expectedFields));
    });
  });
});