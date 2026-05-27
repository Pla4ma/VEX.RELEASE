/**
 * Phase 3F — Unified Architecture Proof (Feature Verification)
 *
 * Verifies Completion, Notification, and FeatureAvailability all
 * consume LaneProfile correctly, plus full cross-lane proof.
 */

import {
  getLaneMechanicPolicy,
  getLanePresentationPolicy,
  buildLaneSessionBrief,
  decideNudge,
  resolveCompletionExperiencePolicy,
  resolveLaneCopy,
  isRescueEligible,
  createRescuePlan,
  decideHomeSurfaces,
  SessionMode,
  baseLaneProfile,
  completionInput,
} from './phase3-test-helpers';
import type {
  Lane,
  NudgeDecision,
  CompletionExperiencePolicy,
} from './phase3-test-helpers';

describe('Phase 3F — Unified Feature Proof', () => {
  it('Completion consumes LaneProfile for lane-aware experience', () => {
    const completionPolicies: Record<Lane, CompletionExperiencePolicy> = {
      student: resolveCompletionExperiencePolicy(
        completionInput({
          lane: 'student',
          motivationStyle: 'study_focused',
          primaryGoal: 'STUDY',
          sessionMode: SessionMode.STUDY,
          summary: { sessionId: 'arch-student', finalScore: 92, focusQuality: 88 },
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

    const payoffs = Object.values(completionPolicies).map((p) => p.adaptivePayoff);
    const uniquePayoffs = new Set(payoffs);
    expect(uniquePayoffs.size).toBeGreaterThanOrEqual(2);

    const animations = Object.values(completionPolicies).map((p) => p.animationLevel);
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
    const lanes: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];
    const decisions: Record<Lane, NudgeDecision> = {} as Record<Lane, NudgeDecision>;

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

  it('FeatureAvailability: LaneMechanicPolicy blockedMechanics enforces per-lane feature visibility', () => {
    const lanes: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];
    const oldEconomy = ['shop', 'gems', 'wagers', 'economy', 'trading'] as const;

    for (const lane of lanes) {
      const policy = getLaneMechanicPolicy(baseLaneProfile({ primaryLane: lane }));
      const anyBlocked = oldEconomy.some((m) => policy.blockedMechanics.includes(m));
      expect(anyBlocked).toBe(true);
    }

    const cleanPolicy = getLaneMechanicPolicy(baseLaneProfile({ primaryLane: 'minimal_normal' }));
    expect(cleanPolicy.blockedMechanics).toContain('boss_full_cta');
    expect(cleanPolicy.blockedMechanics).toContain('challenge_spam');
    expect(cleanPolicy.blockedMechanics).toContain('xp_first_ui');
    expect(cleanPolicy.blockedMechanics).toContain('economy');

    const runPolicy = getLaneMechanicPolicy(baseLaneProfile({ primaryLane: 'game_like' }));
    expect(runPolicy.blockedMechanics).toContain('paid_saves');
    expect(runPolicy.blockedMechanics).toContain('gems');
    expect(runPolicy.blockedMechanics).toContain('shop');
    expect(runPolicy.blockedMechanics).toContain('trading');
    expect(runPolicy.blockedMechanics).toContain('wagers');
    expect(runPolicy.blockedMechanics).toContain('generic_leaderboards');
  });

  it('same core session loop produces lane-varied outputs without separate engines', () => {
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      const profile = baseLaneProfile({ primaryLane: lane });

      const brief = buildLaneSessionBrief({ laneProfile: profile });
      const policy = getLaneMechanicPolicy(profile);
      const pres = getLanePresentationPolicy({ lane, reducedMotion: false });
      const copy = resolveLaneCopy('DAY_0_NOT_STARTED', profile, 'fallback');

      expect(brief.lane).toBe(lane);
      expect(policy.lane).toBe(lane);
      expect(pres.lane).toBe(lane);
      const publicNameMap: Record<Lane, string> = {
        student: 'study',
        game_like: 'run',
        deep_creative: 'project',
        minimal_normal: 'clean',
      };
      expect(copy.laneStageTheme).toContain(publicNameMap[lane]);
    }

    expect(getLaneMechanicPolicy).toBeDefined();
    expect(getLanePresentationPolicy).toBeDefined();
    expect(buildLaneSessionBrief).toBeDefined();
    expect(resolveLaneCopy).toBeDefined();
    expect(isRescueEligible).toBeDefined();
    expect(createRescuePlan).toBeDefined();
    expect(decideNudge).toBeDefined();
    expect(resolveCompletionExperiencePolicy).toBeDefined();
  });
});
