/**
 * Phase 3C — Clean Mode Polish
 */

import {
  getLaneMechanicPolicy,
  buildLaneSessionBrief,
  decideNudge,
  resolveCompletionExperiencePolicy,
  decideHomeSurfaces,
  SessionMode,
  baseLaneProfile,
  baseStats,
  baseProfile,
  featureAvailability,
  completionInput,
} from './phase3-test-helpers';

describe('Phase 3C — Clean Mode Polish', () => {
  const cleanProfile = baseLaneProfile({ primaryLane: 'minimal_normal' });

  it('Clean Day 0 has no boss surfaces', () => {
    const map = decideHomeSurfaces({
      behaviorStats: baseStats,
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: {
        ...baseProfile,
        motivationStyle: 'calm',
        gamificationIntensity: 'minimal',
      },
      laneProfile: cleanProfile,
    });

    expect(map.boss_full_cta ?? 'blocked').toBe('blocked');
    expect(map.boss_teaser ?? 'hidden').not.toBe('primary');
    expect(map.boss_compact ?? 'hidden').not.toBe('spotlight');

    const policy = getLaneMechanicPolicy(cleanProfile);
    expect(policy.blockedMechanics).toContain('blocker_full_cta');
    expect(policy.blockedMechanics).toContain('challenge_spam');
  });

  it('Clean Day 0 has no challenge board surfaces', () => {
    const map = decideHomeSurfaces({
      behaviorStats: baseStats,
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: {
        ...baseProfile,
        motivationStyle: 'calm',
        gamificationIntensity: 'minimal',
      },
      laneProfile: cleanProfile,
    });

    expect(map.challenge_teaser ?? 'hidden').toBe('hidden');
    const policy = getLaneMechanicPolicy(cleanProfile);
    expect(policy.blockedMechanics).toContain('challenge_spam');
  });

  it('Clean active session is LIGHT_FOCUS with minimal noise', () => {
    const brief = buildLaneSessionBrief({
      lane: 'minimal_normal',
      durationSeconds: 25 * 60,
    });

    expect(brief.sessionMode).toBe(SessionMode.LIGHT_FOCUS);
    expect(brief.ctaLabel).toBe('Start clean action');
    expect(brief.title).toBe('One action ready');
    expect(brief.body).toContain('Name one action');
    const json = JSON.stringify(brief);
    expect(json).not.toMatch(/boss|encounter|wager|coin|gem|shop|bounty/i);
  });

  it('Clean completion has minimal animation and hides reward noise', () => {
    const input = completionInput({
      lane: 'minimal_normal',
      motivationStyle: 'calm',
      sessionMode: SessionMode.LIGHT_FOCUS,
      summary: { sessionId: 'clean-complete-id', finalScore: 95 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    expect(policy.animationLevel).toBe('minimal');
    expect(policy.heroBeat.surface).toBe('hero_minimal');

    expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
    expect(policy.hiddenCompletionSurfaces).toContain('premium_chest');
    expect(policy.hiddenCompletionSurfaces).toContain('battle_pass_card');
    expect(policy.hiddenCompletionSurfaces).toContain('chest_reward_animation');
    expect(policy.hiddenCompletionSurfaces).toContain(
      'social_share_primary_action',
    );
    expect(policy.hiddenCompletionSurfaces).toContain('boss_consequence_card');

    const cleanPolicy = getLaneMechanicPolicy(cleanProfile);
    expect(cleanPolicy.preferredMechanics).toContain('today_strip');
    expect(cleanPolicy.preferredMechanics).toContain('clean_session');
  });

  it('Clean notification budget is max 1/day by policy', () => {
    const nudge0 = decideNudge({
      lane: 'minimal_normal',
      completedSessions: 3,
      daysSinceOnboarding: 3,
      sentToday: 0,
    });
    expect(nudge0.allowed).toBe(true);
    expect(nudge0.budgetRemaining).toBe(1);

    const nudge1 = decideNudge({
      lane: 'minimal_normal',
      completedSessions: 3,
      daysSinceOnboarding: 3,
      sentToday: 1,
    });
    expect(nudge1.allowed).toBe(false);
    expect(nudge1.budgetRemaining).toBe(0);

    const studyNudge = decideNudge({
      lane: 'student',
      completedSessions: 3,
      daysSinceOnboarding: 3,
      sentToday: 1,
    });
    expect(studyNudge.budgetRemaining).toBe(1);
  });
});
