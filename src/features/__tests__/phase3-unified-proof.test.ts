/**
 * Phase 3F — Unified Architecture Proof (Completion & Notification)
 *
 * Verifies Completion and Notification policies consume LaneProfile correctly.
 */

import {
  decideNudge,
  resolveCompletionExperiencePolicy,
  SessionMode,
  baseLaneProfile,
  completionInput,
} from './phase3-test-helpers';
import type {
  Lane,
  NudgeDecision,
  CompletionExperiencePolicy,
} from './phase3-test-helpers';

describe('Phase 3F — Completion & Notification Proof', () => {
  it('Completion consumes LaneProfile for lane-aware experience', () => {
    const completionPolicies: Record<Lane, CompletionExperiencePolicy> = {
      student: resolveCompletionExperiencePolicy(
        completionInput({
          lane: 'student',
          motivationStyle: 'study_focused',
          primaryGoal: 'STUDY',
          sessionMode: SessionMode.STUDY,
          summary: {
            sessionId: 'arch-student',
            finalScore: 92,
            focusQuality: 88,
          },
        }),
      ),
      game_like: resolveCompletionExperiencePolicy(
        completionInput({
          lane: 'game_like',
          motivationStyle: 'game_like',
          sessionMode: SessionMode.SPRINT,
          consequences: { boss: { damage: 50 } },
          summary: { sessionId: 'arch-run', finalScore: 90, focusQuality: 85 },
        }),
      ),
      deep_creative: resolveCompletionExperiencePolicy(
        completionInput({
          lane: 'deep_creative',
          motivationStyle: 'creator',
          primaryGoal: 'CREATIVE',
          sessionMode: SessionMode.CREATIVE,
          summary: {
            sessionId: 'arch-project',
            finalScore: 88,
            plannedDuration: 1800,
            effectiveDuration: 1800,
          },
        }),
      ),
      minimal_normal: resolveCompletionExperiencePolicy(
        completionInput({
          lane: 'minimal_normal',
          motivationStyle: 'calm',
          sessionMode: SessionMode.LIGHT_FOCUS,
          summary: { sessionId: 'arch-clean', finalScore: 95 },
        }),
      ),
    };

    const payoffs = Object.values(completionPolicies).map(
      (p) => p.adaptivePayoff,
    );
    const uniquePayoffs = new Set(payoffs);
    expect(uniquePayoffs.size).toBeGreaterThanOrEqual(2);

    const animations = Object.values(completionPolicies).map(
      (p) => p.animationLevel,
    );
    expect(animations).toContain('minimal');
    expect(animations).toContain('medium_high');
    expect(animations).toContain('low_medium');

    for (const policy of Object.values(completionPolicies)) {
      expect(policy.heroBeat).toBeDefined();
      expect(policy.hiddenCompletionSurfaces).toBeDefined();
      expect(policy.nextAction).toBeDefined();
    }
  });

  it('NotificationPolicy consumes LaneProfile for budget and type decisions', () => {
    const lanes: Lane[] = [
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ];
    const decisions: Record<Lane, NudgeDecision> = {} as Record<
      Lane,
      NudgeDecision
    >;

    for (const lane of lanes) {
      const profile = baseLaneProfile({ primaryLane: lane });
      decisions[lane] = decideNudge({
        lane,
        laneProfile: profile,
        completedSessions: 5,
        daysSinceOnboarding: 5,
        context: 'weekly_ready',
      });
    }

    for (const lane of lanes) {
      expect(decisions[lane].lane).toBe(lane);
    }

    expect(decisions.minimal_normal.budgetRemaining).toBe(1);
    expect(decisions.student.budgetRemaining).toBe(2);
    expect(decisions.game_like.budgetRemaining).toBe(2);
    expect(decisions.deep_creative.budgetRemaining).toBe(2);
  });
});
