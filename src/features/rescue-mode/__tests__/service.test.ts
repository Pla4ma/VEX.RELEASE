import {
  createRescuePlan,
  buildRescueCompletionMemory,
  buildRescueCompletionRecord,
  generateRescueReflection,
  isRescueEligible,
} from '../service';
import type { RescuePlan } from '../schemas';

function makePlan(overrides?: Partial<RescuePlan>): RescuePlan {
  return createRescuePlan({
    userId: 'u1',
    lane: 'student',
    reason: 'unclear',
    createdAt: 100,
    ...overrides,
  });
}

describe('rescue mode', () => {
  describe('eligibility', () => {
    it('is hidden on cold Day 0 (no completed sessions, daysSinceOnboarding=0)', () => {
      const result = isRescueEligible({
        userId: 'u1',
        lane: 'student',
        completedSessions: 0,
        daysSinceOnboarding: 0,
        abandonedSessionExists: false,
        missedPlannedSession: false,
        recentDismissals: 0,
        streakAtRisk: false,
        hoursUntilStreakBreak: 24,
        hasActiveSession: false,
        now: 100,
      });
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Day 0');
    });

    it('is visible after abandoned session', () => {
      const result = isRescueEligible({
        userId: 'u1',
        lane: 'student',
        completedSessions: 3,
        daysSinceOnboarding: 2,
        abandonedSessionExists: true,
        missedPlannedSession: false,
        recentDismissals: 0,
        streakAtRisk: false,
        hoursUntilStreakBreak: 24,
        hasActiveSession: false,
        now: 100,
      });
      expect(result.eligible).toBe(true);
      expect(result.trigger).toBe('abandoned_session');
    });

    it('is visible after missed planned session', () => {
      const result = isRescueEligible({
        userId: 'u1',
        lane: 'student',
        completedSessions: 2,
        daysSinceOnboarding: 3,
        abandonedSessionExists: false,
        missedPlannedSession: true,
        recentDismissals: 0,
        streakAtRisk: false,
        hoursUntilStreakBreak: 24,
        hasActiveSession: false,
        now: 100,
      });
      expect(result.eligible).toBe(true);
      expect(result.trigger).toBe('missed_planned');
    });

    it('is hidden when user has an active session', () => {
      const result = isRescueEligible({
        userId: 'u1',
        lane: 'student',
        completedSessions: 5,
        daysSinceOnboarding: 5,
        abandonedSessionExists: true,
        missedPlannedSession: false,
        recentDismissals: 0,
        streakAtRisk: false,
        hoursUntilStreakBreak: 24,
        hasActiveSession: true,
        now: 100,
      });
      expect(result.eligible).toBe(false);
    });

    it('is hidden for successful users with no friction evidence', () => {
      const result = isRescueEligible({
        userId: 'u1',
        lane: 'deep_creative',
        completedSessions: 10,
        daysSinceOnboarding: 5,
        abandonedSessionExists: false,
        missedPlannedSession: false,
        recentDismissals: 0,
        streakAtRisk: false,
        hoursUntilStreakBreak: 24,
        hasActiveSession: false,
        now: 100,
      });
      expect(result.eligible).toBe(false);
    });

    it('is visible when streak is at risk', () => {
      const result = isRescueEligible({
        userId: 'u1',
        lane: 'game_like',
        completedSessions: 4,
        daysSinceOnboarding: 4,
        abandonedSessionExists: false,
        missedPlannedSession: false,
        recentDismissals: 0,
        streakAtRisk: true,
        hoursUntilStreakBreak: 3,
        hasActiveSession: false,
        now: 100,
      });
      expect(result.eligible).toBe(true);
      expect(result.trigger).toBe('streak_risk');
    });

    it('is visible after repeated dismissals', () => {
      const result = isRescueEligible({
        userId: 'u1',
        lane: 'minimal_normal',
        completedSessions: 3,
        daysSinceOnboarding: 2,
        abandonedSessionExists: false,
        missedPlannedSession: false,
        recentDismissals: 3,
        streakAtRisk: false,
        hoursUntilStreakBreak: 24,
        hasActiveSession: false,
        now: 100,
      });
      expect(result.eligible).toBe(true);
      expect(result.trigger).toBe('repeated_dismissals');
    });
  });

  describe('plan creation', () => {
    it('creates a rescue plan with duration 5-12 minutes', () => {
      const plan = makePlan({ lane: 'student', reason: 'unclear' });
      expect(plan.durationSeconds).toBeGreaterThanOrEqual(5 * 60);
      expect(plan.durationSeconds).toBeLessThanOrEqual(12 * 60);
    });

    it('differs copy by lane', () => {
      const student = makePlan({ lane: 'student', reason: 'too_big' });
      const run = makePlan({ lane: 'game_like', reason: 'too_big' });
      const project = makePlan({ lane: 'deep_creative', reason: 'too_big' });
      const clean = makePlan({ lane: 'minimal_normal', reason: 'too_big' });

      expect(student.taskDescription).toContain('notes');
      expect(run.taskDescription).toContain('Recovery');
      expect(project.taskDescription).toContain('project');
      expect(clean.taskDescription).toContain('5 minutes');
    });

    it('assigns correct session mode per lane', () => {
      const lanes = ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const;
      const plans = lanes.map((lane) =>
        createRescuePlan({ userId: 'u1', lane, reason: 'unclear' }),
      );
      expect(plans.map((p) => p.sessionMode)).toEqual([
        'STUDY',
        'SPRINT',
        'CREATIVE',
        'RECOVERY',
      ]);
    });

    it('minimal_normal lane rescue stays discreet (soft friction)', () => {
      const plan = makePlan({ lane: 'minimal_normal', reason: 'distracted' });
      expect(plan.frictionLevel).toBe('soft');
      expect(plan.durationSeconds).toBeLessThanOrEqual(5 * 60);
    });
  });

  describe('completion', () => {
    it('generates memory candidate on completion', () => {
      const plan = makePlan({ lane: 'student', reason: 'unclear' });
      const memory = buildRescueCompletionMemory(plan, 'completed');
      expect(memory.source).toBe('rescue_completion');
      expect(memory.confidence).toBeGreaterThan(0.7);
      expect(memory.text).toContain('successfully');
    });

    it('generates completion record with outcome and recommendation', () => {
      const plan = makePlan({ lane: 'game_like', reason: 'too_big' });
      const record = buildRescueCompletionRecord(plan, 'completed', 600);
      expect(record.outcome).toBe('completed');
      expect(record.worked).toBe(true);
      expect(record.reason).toBe('too_big');
      expect(record.nextRecommendation).toBeTruthy();
      expect(record.durationSeconds).toBe(600);
    });

    it('marks partial completion as worked', () => {
      const plan = makePlan({ lane: 'deep_creative', reason: 'tired' });
      const record = buildRescueCompletionRecord(plan, 'partial', 300);
      expect(record.outcome).toBe('partial');
      expect(record.worked).toBe(true);
    });

    it('marks abandoned as not worked', () => {
      const plan = makePlan({ lane: 'minimal_normal', reason: 'anxious' });
      const record = buildRescueCompletionRecord(plan, 'abandoned', 60);
      expect(record.outcome).toBe('abandoned');
      expect(record.worked).toBe(false);
    });

    it('does not shame user in reflection', () => {
      const plan = makePlan({ lane: 'student', reason: 'anxious' });
      const reflection = generateRescueReflection(plan, 'abandoned');
      expect(reflection).toContain('okay');
      expect(reflection).not.toContain('fail');
      expect(reflection).not.toContain('lose');
      expect(reflection).not.toContain('shame');
    });
  });

  describe('edge cases', () => {
    it('ignores user with completedSessions > 0 but no trigger', () => {
      const result = isRescueEligible({
        userId: 'u1',
        lane: 'student',
        completedSessions: 1,
        daysSinceOnboarding: 1,
        abandonedSessionExists: false,
        missedPlannedSession: false,
        recentDismissals: 0,
        streakAtRisk: false,
        hoursUntilStreakBreak: 24,
        hasActiveSession: false,
        now: 100,
      });
      expect(result.eligible).toBe(false);
    });

    it('hides rescue when streak at risk but hours too high', () => {
      const result = isRescueEligible({
        userId: 'u1',
        lane: 'student',
        completedSessions: 5,
        daysSinceOnboarding: 5,
        abandonedSessionExists: false,
        missedPlannedSession: false,
        recentDismissals: 0,
        streakAtRisk: true,
        hoursUntilStreakBreak: 10,
        hasActiveSession: false,
        now: 100,
      });
      expect(result.eligible).toBe(false);
    });
  });
});
