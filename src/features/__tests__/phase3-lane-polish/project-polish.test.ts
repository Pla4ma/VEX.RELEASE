/**
 * Phase 3E — Project Mode Polish
 */

import { isRescueEligible, createRescuePlan } from '../../rescue-mode/service';
import {
  getLaneMechanicPolicy, decideHomeSurfaces,
  resolveCompletionExperiencePolicy, completionInput,
  buildLaneSessionBrief, resolveLaneCopy,
  baseLaneProfile, baseStats, baseProfile, featureAvailability, SessionMode,
} from './helpers';

describe('Phase 3E — Project Mode Polish', () => {
  const projectProfile = baseLaneProfile({ primaryLane: 'deep_creative' });

  it('Project mode prefers project_thread and continuity_memory mechanics', () => {
    const policy = getLaneMechanicPolicy(projectProfile);

    expect(policy.preferredMechanics).toContain('project_thread');
    expect(policy.preferredMechanics).toContain('continuity_memory');
    expect(policy.preferredMechanics).toContain('next_move');
    expect(policy.preferredMechanics).toContain('flow_window');
  });

  it('Project completion surfaces project_thread and focus_window after 4 sessions', () => {
    const map = decideHomeSurfaces({
      behaviorStats: { ...baseStats, totalCompletedSessions: 4, projectFocusUsageRatio: 0.6 },
      featureAvailability, hasActiveBoss: false,
      hasActiveRecommendation: false, hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: { ...baseProfile, primaryGoal: 'creative' },
      laneProfile: projectProfile,
    });

    expect(map.project_thread).not.toBe('hidden');
    expect(map.focus_window).not.toBe('hidden');
  });

  it('Project session brief shows project continuity language', () => {
    const brief = buildLaneSessionBrief({ lane: 'deep_creative', durationSeconds: 25 * 60 });

    expect(brief.sessionMode).toBe(SessionMode.CREATIVE);
    expect(brief.ctaLabel).toBe('Resume project block');
    expect(brief.body).toContain('Resume the thread');
    expect(brief.title).toBe('Project block ready');
  });

  it('lost-thread rescue works: "unclear" reason gives next-move task', () => {
    const plan = createRescuePlan({
      userId: 'test-user', lane: 'deep_creative',
      laneProfile: projectProfile, reason: 'unclear',
    });

    expect(plan.sessionMode).toBe(SessionMode.CREATIVE);
    expect(plan.taskDescription).toContain('next concrete step');
    expect(plan.durationSeconds).toBe(7 * 60);
    expect(plan.frictionLevel).toBe('none');

    const eligibility = isRescueEligible({
      userId: 'test-user', abandonedSessionExists: true,
      completedSessions: 1, daysSinceOnboarding: 2,
      hasActiveSession: false, hoursUntilStreakBreak: 12,
      lane: 'deep_creative', laneProfile: projectProfile,
      missedPlannedSession: false, recentDismissals: 0,
      streakAtRisk: false, userTooBig: false,
    });

    expect(eligibility.eligible).toBe(true);
    expect(eligibility.trigger).toBe('abandoned_session');
  });

  it('Project Day 0 requires only lightweight setup', () => {
    const copy = resolveLaneCopy('DAY_0_NOT_STARTED', projectProfile, 'fallback');
    expect(copy.laneStageTheme).toBe('first_project_block');
    expect(copy.primaryMessage).toContain('project block');

    const map = decideHomeSurfaces({
      behaviorStats: baseStats, featureAvailability,
      hasActiveBoss: false, hasActiveRecommendation: false,
      hasActiveStudyPlan: false, isFirstSession: false,
      personalizationProfile: { ...baseProfile, primaryGoal: 'creative' },
      laneProfile: projectProfile,
    });
    expect(map.project_thread ?? 'hidden').not.toBe('primary');

    const policy = getLaneMechanicPolicy(projectProfile);
    expect(policy.blockedMechanics).toContain('economy');
    expect(policy.blockedMechanics).toContain('loud_combat_default');
  });

  it('Project completion hides economy and combat surfaces', () => {
    const input = completionInput({
      lane: 'deep_creative', motivationStyle: 'creator',
      primaryGoal: 'CREATIVE', sessionMode: SessionMode.CREATIVE,
      summary: { sessionId: 'project-complete-id', finalScore: 88, plannedDuration: 1800, effectiveDuration: 1800 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
    expect(policy.hiddenCompletionSurfaces).toContain('battle_pass_card');
    expect(policy.hiddenCompletionSurfaces).toContain('social_share_primary_action');
  });
});
