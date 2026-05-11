/**
 * CompletionEngine Tests
 *
 * Phase 19.1 - Test completion vs abandonment flows.
 *
 * Tests:
 * - Success completion
 * - Partial completion
 * - Abandon handling
 * - Failure recovery
 */

import { CompletionEngine } from './CompletionEngine';
import { ScoringEngine } from './ScoringEngine';
import type { SessionState, FocusQualityMetrics } from '../types';

describe('CompletionEngine', () => {
  let scoringEngine: ScoringEngine;
  let completionEngine: CompletionEngine;

  const createMockSession = (overrides: Partial<SessionState> = {}): SessionState => ({
    id: 'test-session',
    userId: 'test-user',
    status: 'ACTIVE',
    phase: 'FOCUS',
    config: {
      duration: 1500,
      breakDuration: 300,
      longBreakDuration: 900,
      intervals: 4,
      longBreakInterval: 4,
      soundEnabled: false,
      vibrationEnabled: false,
      dndEnabled: false,
      strictMode: false,
      autoStartBreaks: false,
      autoStartPomodoros: false,
    },
    currentInterval: 1,
    totalIntervals: 4,
    elapsedTime: 1500,
    remainingTime: 0,
    effectiveTime: 1500,
    completionPercentage: 100,
    interruptions: 0,
    pauses: 0,
    startTime: Date.now() - 1500000,
    ...overrides,
  } as SessionState);

  const createMockMetrics = (overrides: Partial<FocusQualityMetrics> = {}): FocusQualityMetrics => ({
    sessionId: 'test-session',
    timeInDeepFocus: 1200,
    timeInShallowFocus: 200,
    timeDistracted: 100,
    focusSegments: [],
    consistencyScore: 85,
    depthScore: 90,
    recoveryScore: 80,
    overallScore: 85,
    calculatedAt: Date.now(),
    ...overrides,
  });

  beforeEach(() => {
    scoringEngine = new ScoringEngine();
    completionEngine = new CompletionEngine(scoringEngine);
  });

  describe('completeSession', () => {
    it('should complete session successfully', () => {
      const session = createMockSession();
      const metrics = createMockMetrics();

      const result = completionEngine.completeSession(session, metrics, 5);

      expect(result.success).toBe(true);
      expect(result.status).toBe('COMPLETED');
      expect(result.streakMaintained).toBe(true);
    });

    it('should set session status to COMPLETED', () => {
      const session = createMockSession();
      const metrics = createMockMetrics();

      completionEngine.completeSession(session, metrics, 5);

      expect(session.status).toBe('COMPLETED');
    });

    it('should set completedAt timestamp', () => {
      const session = createMockSession();
      const metrics = createMockMetrics();

      completionEngine.completeSession(session, metrics, 5);

      expect(session.completedAt).toBeDefined();
      expect(session.completedAt).toBeGreaterThan(0);
    });

    it('should set completion percentage to 100', () => {
      const session = createMockSession();
      const metrics = createMockMetrics();

      completionEngine.completeSession(session, metrics, 5);

      expect(session.completionPercentage).toBe(100);
    });

    it('should include focus quality in session', () => {
      const session = createMockSession();
      const metrics = createMockMetrics({ overallScore: 92 });

      completionEngine.completeSession(session, metrics, 5);

      expect(session.focusQuality).toBe(92);
    });

    it('should calculate and store score', () => {
      const session = createMockSession();
      const metrics = createMockMetrics();

      completionEngine.completeSession(session, metrics, 5);

      expect(session.baseScore).toBeGreaterThan(0);
    });

    it('should create session summary', () => {
      const session = createMockSession();
      const metrics = createMockMetrics();

      const result = completionEngine.completeSession(session, metrics, 5);

      expect(result.summary).toBeDefined();
      expect(result.summary.sessionId).toBe('test-session');
      expect(result.summary.totalScore).toBeGreaterThan(0);
    });

    it('should include reflection in summary when provided', () => {
      const session = createMockSession();
      const metrics = createMockMetrics();
      const reflection = 'Great focus session today!';

      const result = completionEngine.completeSession(
        session,
        metrics,
        5,
        reflection
      );

      expect(result.summary.reflection).toBe(reflection);
    });

    it('should include mood in summary when provided', () => {
      const session = createMockSession();
      const metrics = createMockMetrics();

      const result = completionEngine.completeSession(
        session,
        metrics,
        5,
        undefined,
        'GREAT'
      );

      expect(result.summary.mood).toBe('GREAT');
    });

    it('should include tasks completed in summary when provided', () => {
      const session = createMockSession();
      const metrics = createMockMetrics();

      const result = completionEngine.completeSession(
        session,
        metrics,
        5,
        undefined,
        undefined,
        3
      );

      expect(result.summary.tasksCompleted).toBe(3);
    });

    it('should indicate rewards are granted', () => {
      const session = createMockSession();
      const metrics = createMockMetrics();

      const result = completionEngine.completeSession(session, metrics, 5);

      expect(result.rewardsGranted).toBe(true);
    });
  });

  describe('abandonSession', () => {
    it('should handle session abandonment', () => {
      const session = createMockSession({ completionPercentage: 30 });

      const result = completionEngine.abandonSession(session, 5);

      expect(result.sessionId).toBe('test-session');
      expect(result.canRecover).toBeDefined();
    });

    it('should set session status to ABANDONED', () => {
      const session = createMockSession();

      completionEngine.abandonSession(session, 5);

      expect(session.status).toBe('ABANDONED');
    });

    it('should set endedAt timestamp', () => {
      const session = createMockSession();

      completionEngine.abandonSession(session, 5);

      expect(session.endedAt).toBeDefined();
      expect(session.endedAt).toBeGreaterThan(0);
    });

    it('should calculate damage for abandonment', () => {
      const session = createMockSession();

      const result = completionEngine.abandonSession(session, 5);

      expect(result.damage).toBeDefined();
      expect(result.damage.baseDamage).toBeGreaterThan(0);
    });

    it('should indicate streak is broken on abandon', () => {
      const session = createMockSession();

      const result = completionEngine.abandonSession(session, 5);

      expect(result.streakBroken).toBe(true);
    });

    it('should provide partial credit based on completion percentage', () => {
      const highCompletion = createMockSession({ completionPercentage: 80 });
      const lowCompletion = createMockSession({ completionPercentage: 20 });

      const highResult = completionEngine.abandonSession(highCompletion, 5);
      const lowResult = completionEngine.abandonSession(lowCompletion, 5);

      expect(highResult.partialCredit).toBe(true);
      expect(lowResult.partialCredit).toBe(false);
    });

    it('should allow recovery for high completion percentages', () => {
      const session = createMockSession({ completionPercentage: 75 });

      const result = completionEngine.abandonSession(session, 5);

      expect(result.canRecover).toBe(true);
    });

    it('should not allow recovery for low completion percentages', () => {
      const session = createMockSession({ completionPercentage: 25 });

      const result = completionEngine.abandonSession(session, 5);

      expect(result.canRecover).toBe(false);
    });
  });

  describe('handlePartialCompletion', () => {
    it('should handle partial completion', () => {
      const session = createMockSession({ completionPercentage: 70 });
      const metrics = createMockMetrics();

      const result = completionEngine.handlePartialCompletion(session, metrics, 5);

      expect(result.success).toBe(true);
      expect(result.status).toBe('PARTIAL');
    });

    it('should set session status to PARTIAL', () => {
      const session = createMockSession({ completionPercentage: 70 });
      const metrics = createMockMetrics();

      completionEngine.handlePartialCompletion(session, metrics, 5);

      expect(session.status).toBe('PARTIAL');
    });

    it('should grant partial rewards', () => {
      const session = createMockSession({ completionPercentage: 70 });
      const metrics = createMockMetrics();

      const result = completionEngine.handlePartialCompletion(session, metrics, 5);

      expect(result.rewardsGranted).toBe(true);
    });

    it('should maintain streak for partial completion above threshold', () => {
      const session = createMockSession({ completionPercentage: 70 });
      const metrics = createMockMetrics();

      const result = completionEngine.handlePartialCompletion(session, metrics, 5);

      expect(result.streakMaintained).toBe(true);
    });
  });

  describe('attemptRecovery', () => {
    it('should attempt to recover abandoned session', () => {
      const session = createMockSession({
        status: 'ABANDONED',
        completionPercentage: 75,
      });

      const result = completionEngine.attemptRecovery(session, 5);

      expect(result.success).toBe(true);
    });

    it('should change status to RECOVERED on success', () => {
      const session = createMockSession({
        status: 'ABANDONED',
        completionPercentage: 75,
      });

      completionEngine.attemptRecovery(session, 5);

      expect(session.status).toBe('RECOVERED');
    });

    it('should fail recovery for low completion percentages', () => {
      const session = createMockSession({
        status: 'ABANDONED',
        completionPercentage: 30,
      });

      const result = completionEngine.attemptRecovery(session, 5);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should fail recovery for already completed sessions', () => {
      const session = createMockSession({
        status: 'COMPLETED',
        completionPercentage: 100,
      });

      const result = completionEngine.attemptRecovery(session, 5);

      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle zero completion percentage', () => {
      const session = createMockSession({ completionPercentage: 0 });

      const abandonResult = completionEngine.abandonSession(session, 5);
      expect(abandonResult.partialCredit).toBe(false);
      expect(abandonResult.canRecover).toBe(false);
    });

    it('should handle session with many pauses', () => {
      const session = createMockSession({ pauses: 20 });
      const metrics = createMockMetrics();

      const result = completionEngine.completeSession(session, metrics, 5);

      expect(result.success).toBe(true);
    });

    it('should handle session with many interruptions', () => {
      const session = createMockSession({ interruptions: 15 });
      const metrics = createMockMetrics();

      const result = completionEngine.completeSession(session, metrics, 5);

      expect(result.success).toBe(true);
    });

    it('should handle very short sessions', () => {
      const session = createMockSession({
        config: { ...createMockSession().config, duration: 60 },
        completionPercentage: 100,
      });
      const metrics = createMockMetrics();

      const result = completionEngine.completeSession(session, metrics, 5);

      expect(result.success).toBe(true);
    });

    it('should handle very long sessions', () => {
      const session = createMockSession({
        config: { ...createMockSession().config, duration: 7200 },
        completionPercentage: 100,
      });
      const metrics = createMockMetrics();

      const result = completionEngine.completeSession(session, metrics, 5);

      expect(result.success).toBe(true);
    });
  });
});
