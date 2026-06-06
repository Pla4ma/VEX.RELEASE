import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { createCoachTestSetup } from './coach-test-setup';
import { detectOptimalBreak, detectStudyStuck, detectDistraction } from '../intervention/intervention-detectors-situational';
import type { InterventionContext } from './coach-test-setup';

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

describe('CoachService', () => {
  let coachService: ReturnType<typeof createCoachTestSetup>['coachService'];
  let mockContext: InterventionContext;

  beforeEach(() => {
    const setup = createCoachTestSetup();
    coachService = setup.coachService;
    mockContext = setup.mockContext;
  });

  describe('detectOptimalBreak', () => {
    test('should not suggest break early in session', async () => {
      const result = detectOptimalBreak({
        sessionDuration: 15,
        currentPurityScore: 95,
        focusPattern: 'DEEP',
        timeSinceLastBreak: 10,
      });
      expect(result.shouldBreak).toBe(false);
    });

    test('should suggest break after long work period', async () => {
      const result = detectOptimalBreak({
        sessionDuration: 60,
        currentPurityScore: 70,
        focusPattern: 'MODERATE',
        timeSinceLastBreak: 55,
      });
      expect(result.shouldBreak).toBe(true);
      expect(result.confidence).toBeDefined();
      expect(result.intervention.content).toBeDefined();
      expect(result.recommendedBreakDuration).toBeGreaterThan(0);
    });

    test('should suggest break when focus is declining', async () => {
      const result = detectOptimalBreak({
        sessionDuration: 45,
        currentPurityScore: 50,
        focusPattern: 'FRAGMENTED',
        timeSinceLastBreak: 40,
      });
      expect(result.shouldBreak).toBe(true);
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(result.confidence);
    });

    test('should suggest break at natural completion points', async () => {
      const result = detectOptimalBreak({
        sessionDuration: 50,
        currentPurityScore: 75,
        focusPattern: 'MODERATE',
        timeSinceLastBreak: 52,
      });
      expect(result.shouldBreak).toBe(true);
      expect(result.recommendedBreakDuration).toBeGreaterThan(0);
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
      const lowFocusContext = { ...mockContext, focusQuality: 0.3 };
      const advice = await coachService.getSessionAdvice(lowFocusContext);
      expect(
        advice.recommendations.some((r) => r.type === 'focus_improvement'),
      ).toBe(true);
    });

    test('should include encouragement for good progress', async () => {
      const goodProgressContext = {
        ...mockContext,
        focusQuality: 0.9,
        currentStreak: 5,
        sessionDuration: 2400000,
      };
      const advice =
        await coachService.getSessionAdvice(goodProgressContext);
      expect(
        advice.recommendations.some((r) => r.type === 'encouragement'),
      ).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing context gracefully', async () => {
      const result = detectStudyStuck({
        documentId: 'unknown',
        documentName: 'unknown',
        minutesOnSameSection: 0,
        lastInteractionAt: Date.now(),
      });
      expect(result.detected).toBe(false);
      expect(result.severity).toBe('MILD');
    });

    test('should handle invalid data types', async () => {
      const invalidContext = {
        ...mockContext,
        focusQuality: 'invalid' as unknown as number,
        sessionDuration: 'invalid' as unknown as number,
      };
      const result = detectStudyStuck({
        documentId: 'test',
        documentName: 'test',
        minutesOnSameSection: 0,
        lastInteractionAt: Date.now(),
      });
      expect(result.detected).toBe(false);
    });
  });

  describe('Performance', () => {
    test('should complete detection quickly', async () => {
      const startTime = Date.now();
      detectStudyStuck({
        documentId: 'test',
        documentName: 'test',
        minutesOnSameSection: 0,
        lastInteractionAt: Date.now(),
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);
    });

    test('should handle concurrent requests', async () => {
      const promises = [
        Promise.resolve(detectStudyStuck({
          documentId: 'test',
          documentName: 'test',
          minutesOnSameSection: 0,
          lastInteractionAt: Date.now(),
        })),
        Promise.resolve(detectDistraction({
          sessionId: 'test-session',
          currentPurityScore: 80,
          purityScoreTrend: 'STABLE',
          pausesInLast10Min: 0,
          backgroundSwitches: 0,
        })),
        Promise.resolve(detectOptimalBreak({
          sessionDuration: 30,
          currentPurityScore: 85,
          focusPattern: 'DEEP',
          timeSinceLastBreak: 20,
        })),
      ];
      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      expect(results.every((r) => r !== undefined)).toBe(true);
    });
  });
});
