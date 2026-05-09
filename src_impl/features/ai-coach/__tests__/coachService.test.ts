/**
 * AI Coach Service Tests
 *
 * Unit tests for AI Coach intervention detection and response logic.
 * Tests study stuck, distraction, and optimal break detection.
 *
 * @phase 1
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { getCoachService } from '../service';
import type { InterventionContext, InterventionResult } from '../types';

// Mock dependencies
jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

describe('CoachService', () => {
  let coachService: ReturnType<typeof getCoachService>;
  let mockContext: InterventionContext;

  beforeEach(() => {
    coachService = getCoachService();
    coachService.setUserId('test-user-id');

    mockContext = {
      sessionId: 'test-session-id',
      userId: 'test-user-id',
      currentPhase: 'WORK',
      sessionDuration: 1800000, // 30 minutes
      focusQuality: 0.8,
      interruptions: [],
      lastActivity: Date.now(),
      documentsStudied: ['doc-1', 'doc-2'],
      currentStreak: 3,
      completedSessions: 10,
    };
  });

  describe('detectStudyStuck', () => {
    test('should not detect stuck when user is making progress', async () => {
      const result = await coachService.detectStudyStuck(mockContext);

      expect(result.detected).toBe(false);
      expect(result.severity).toBe('LOW');
    });

    test('should detect stuck when no progress for long time', async () => {
      const stuckContext = {
        ...mockContext,
        sessionDuration: 3600000, // 1 hour
        focusQuality: 0.3,
        lastActivity: Date.now() - 1800000, // 30 minutes ago
        currentStreak: 0,
      };

      const result = await coachService.detectStudyStuck(stuckContext);

      expect(result.detected).toBe(true);
      expect(result.severity).toBe('HIGH');
      expect(result.intervention.type).toBe('study_stuck');
      expect(result.intervention.actions).toContain('summarize_progress');
    });

    test('should detect stuck when focus quality is very low', async () => {
      const lowFocusContext = {
        ...mockContext,
        focusQuality: 0.1,
        sessionDuration: 2400000, // 40 minutes
        interruptions: [
          { type: 'distraction', timestamp: Date.now() - 600000 },
          { type: 'distraction', timestamp: Date.now() - 1200000 },
        ],
      };

      const result = await coachService.detectStudyStuck(lowFocusContext);

      expect(result.detected).toBe(true);
      expect(result.severity).toBe('MEDIUM');
    });

    test('should provide appropriate intervention for stuck state', async () => {
      const stuckContext = {
        ...mockContext,
        focusQuality: 0.2,
        sessionDuration: 3000000, // 50 minutes
      };

      const result = await coachService.detectStudyStuck(stuckContext);

      if (result.detected) {
        expect(result.intervention.message).toContain('stuck');
        expect(result.intervention.actions).toContain('summarize_progress');
        expect(result.intervention.actions).toContain('suggest_break');
      }
    });
  });

  describe('detectDistraction', () => {
    test('should not detect distraction when focus is good', async () => {
      const result = await coachService.detectDistraction(mockContext);

      expect(result.detected).toBe(false);
    });

    test('should detect distraction with multiple interruptions', async () => {
      const distractedContext = {
        ...mockContext,
        interruptions: [
          { type: 'phone_notification', timestamp: Date.now() - 300000 },
          { type: 'phone_notification', timestamp: Date.now() - 600000 },
          { type: 'background_noise', timestamp: Date.now() - 900000 },
        ],
        focusQuality: 0.5,
      };

      const result = await coachService.detectDistraction(distractedContext);

      expect(result.detected).toBe(true);
      expect(result.intervention.type).toBe('distraction_detected');
      expect(result.intervention.actions).toContain('refocus_techniques');
    });

    test('should detect distraction when focus drops suddenly', async () => {
      const droppingFocusContext = {
        ...mockContext,
        focusQuality: 0.3,
        sessionDuration: 1800000,
        lastActivity: Date.now() - 300000, // Recent activity but low focus
      };

      const result = await coachService.detectDistraction(droppingFocusContext);

      expect(result.detected).toBe(true);
      expect(result.severity).toBe('MEDIUM');
    });

    test('should provide refocus strategies for distraction', async () => {
      const distractedContext = {
        ...mockContext,
        interruptions: [{ type: 'social_media', timestamp: Date.now() - 120000 }],
        focusQuality: 0.4,
      };

      const result = await coachService.detectDistraction(distractedContext);

      if (result.detected) {
        expect(result.intervention.message).toContain('distracted');
        expect(result.intervention.actions).toContain('refocus_techniques');
        expect(result.intervention.actions).toContain('minimize_interruptions');
      }
    });
  });

  describe('detectOptimalBreak', () => {
    test('should not suggest break early in session', async () => {
      const earlySessionContext = {
        ...mockContext,
        sessionDuration: 900000, // 15 minutes
        focusQuality: 0.9,
      };

      const result = await coachService.detectOptimalBreak(earlySessionContext);

      expect(result.detected).toBe(false);
    });

    test('should suggest break after long work period', async () => {
      const longWorkContext = {
        ...mockContext,
        sessionDuration: 3600000, // 1 hour
        focusQuality: 0.7,
        currentPhase: 'WORK',
      };

      const result = await coachService.detectOptimalBreak(longWorkContext);

      expect(result.detected).toBe(true);
      expect(result.intervention.type).toBe('optimal_break');
      expect(result.intervention.actions).toContain('take_break');
    });

    test('should suggest break when focus is declining', async () => {
      const decliningFocusContext = {
        ...mockContext,
        sessionDuration: 2700000, // 45 minutes
        focusQuality: 0.4,
        currentStreak: 1, // Breaking streak
      };

      const result = await coachService.detectOptimalBreak(decliningFocusContext);

      expect(result.detected).toBe(true);
      expect(result.severity).toBe('MEDIUM');
    });

    test('should suggest break at natural completion points', async () => {
      const completionContext = {
        ...mockContext,
        sessionDuration: 3000000, // 50 minutes
        focusQuality: 0.8,
        documentsStudied: ['doc-1'], // Completed one document
      };

      const result = await coachService.detectOptimalBreak(completionContext);

      expect(result.detected).toBe(true);
      if (result.detected) {
        expect(result.intervention.actions).toContain('consolidate_learning');
      }
    });
  });

  describe('getSessionAdvice', () => {
    test('should provide advice for active session', async () => {
      const advice = await coachService.getSessionAdvice(mockContext);

      expect(advice).toBeDefined();
      expect(advice.sessionId).toBe(mockContext.sessionId);
      expect(advice.recommendations).toBeDefined();
      expect(Array.isArray(advice.recommendations)).toBe(true);
    });

    test('should include focus improvement tips for low focus', async () => {
      const lowFocusContext = {
        ...mockContext,
        focusQuality: 0.3,
      };

      const advice = await coachService.getSessionAdvice(lowFocusContext);

      expect(advice.recommendations.some((r) => r.type === 'focus_improvement')).toBe(true);
    });

    test('should include encouragement for good progress', async () => {
      const goodProgressContext = {
        ...mockContext,
        focusQuality: 0.9,
        currentStreak: 5,
        sessionDuration: 2400000,
      };

      const advice = await coachService.getSessionAdvice(goodProgressContext);

      expect(advice.recommendations.some((r) => r.type === 'encouragement')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing context gracefully', async () => {
      const result = await coachService.detectStudyStuck({} as InterventionContext);

      expect(result.detected).toBe(false);
      expect(result.severity).toBe('LOW');
    });

    test('should handle invalid data types', async () => {
      const invalidContext = {
        ...mockContext,
        focusQuality: 'invalid' as any,
        sessionDuration: 'invalid' as any,
      };

      const result = await coachService.detectStudyStuck(invalidContext);

      expect(result.detected).toBe(false);
    });
  });

  describe('Performance', () => {
    test('should complete detection quickly', async () => {
      const startTime = Date.now();

      await coachService.detectStudyStuck(mockContext);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    test('should handle concurrent requests', async () => {
      const promises = [coachService.detectStudyStuck(mockContext), coachService.detectDistraction(mockContext), coachService.detectOptimalBreak(mockContext)];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r !== undefined)).toBe(true);
    });
  });
});
