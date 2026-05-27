/**
 * Phase 3B — Study Mode Polish
 */

import {
  buildLaneSessionBrief,
  resolveCompletionExperiencePolicy,
  resolveLaneCopy,
  decideHomeSurfaces,
  SessionMode,
  baseLaneProfile,
  baseStats,
  baseProfile,
  featureAvailability,
  completionInput,
} from './phase3-test-helpers';

describe('Phase 3B — Study Mode Polish', () => {
  const studyProfile = baseLaneProfile({ primaryLane: 'student' });

  it('Study Day 0 has tiny preview with no upload/import surface', () => {
    const copy = resolveLaneCopy('DAY_0_NOT_STARTED', studyProfile, 'fallback');
    expect(copy.primaryMessage).toContain('study block');

    const map = decideHomeSurfaces({
      behaviorStats: baseStats,
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: { ...baseProfile, motivationStyle: 'study_focused' },
      laneProfile: studyProfile,
    });

    expect(map.run_board ?? 'hidden').toBe('hidden');
    expect(map.boss_full_cta ?? 'hidden').not.toBe('primary');
    expect(map.boss_full_cta ?? 'hidden').not.toBe('spotlight');
    expect(map.study_layer ?? 'hidden').not.toBe('primary');
  });

  it('Study session brief produces STUDY mode with free start CTA', () => {
    const brief = buildLaneSessionBrief({ lane: 'student', durationSeconds: 25 * 60 });

    expect(brief.sessionMode).toBe(SessionMode.STUDY);
    expect(brief.ctaLabel).toBe('Start study block');
    expect(brief.title).toContain('Study');
    expect(brief.focusStrategyLoadout).toContain('Phone away');
    const json = JSON.stringify(brief);
    expect(json).not.toMatch(/coin|gem|shop|wager|bounty|battle/i);
  });

  it('Study completion produces study_progress adaptive payoff', () => {
    const input = completionInput({
      lane: 'student',
      motivationStyle: 'study_focused',
      primaryGoal: 'STUDY',
      sessionMode: SessionMode.STUDY,
      summary: { sessionId: 'study-complete-id', finalScore: 92, focusQuality: 88 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    expect(policy.adaptivePayoff).toBe('study_progress');
    expect(policy.animationLevel).toBe('low_medium');
    expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
    expect(policy.hiddenCompletionSurfaces).toContain('shop_inventory_prompts');
  });

  it('degraded Study AI falls back safely (all features unavailable)', () => {
    const input = completionInput({
      lane: 'student',
      motivationStyle: 'study_focused',
      primaryGoal: 'STUDY',
      sessionMode: SessionMode.STUDY,
      featureAvailability: {
        boss: false,
        challenges: false,
        progress: false,
        study: false,
        contractUsed: false,
      },
      summary: { sessionId: 'study-degraded-id', finalScore: 92, focusQuality: 88 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    expect(policy.adaptivePayoff).toBe('progress_insight');
    expect(policy.heroBeat).toBeDefined();
    expect(policy.heroBeat.kind).toBe('completion_confirmation');
    expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
    expect(policy.hiddenCompletionSurfaces).toContain('battle_pass_card');
    expect(policy.hiddenCompletionSurfaces).toContain('study_progress_card');
  });

  it('premium Study depth is hidden when study feature unavailable', () => {
    const input = completionInput({
      lane: 'student',
      motivationStyle: 'calm',
      primaryGoal: 'WORK',
      sessionMode: SessionMode.STUDY,
      featureAvailability: {
        boss: true,
        challenges: true,
        progress: true,
        study: false,
        contractUsed: false,
      },
      summary: { sessionId: 'study-premium-id', finalScore: 92, focusQuality: 88 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    expect(policy.hiddenCompletionSurfaces).toContain('study_progress_card');
    expect(policy.adaptivePayoff).toBe('progress_insight');
  });
});
