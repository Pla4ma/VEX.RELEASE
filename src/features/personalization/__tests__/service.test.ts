import { resolveVexExperience } from '../service';
import type {
  BehaviorStats,
  FeatureAvailabilitySnapshot,
  VexPersonalizationProfile,
} from '../types';

const available: FeatureAvailabilitySnapshot = {
  boss: true,
  challenges: true,
  study: true,
  premium: true,
};

const unavailable: FeatureAvailabilitySnapshot = {
  boss: false,
  challenges: false,
  study: false,
  premium: false,
};

function profile(
  motivationStyle: VexPersonalizationProfile['motivationStyle'],
  overrides: Partial<VexPersonalizationProfile> = {},
): VexPersonalizationProfile {
  return {
    primaryGoal: motivationStyle === 'study_focused' ? 'study' : 'work',
    motivationStyle,
    preferredTone: motivationStyle === 'intense' ? 'direct' : motivationStyle === 'coach_led' ? 'strategic' : 'soft',
    gamificationIntensity: motivationStyle === 'game_like' || motivationStyle === 'intense' ? 'strong' : 'minimal',
    coachMode: motivationStyle === 'study_focused' ? 'study_tutor' : motivationStyle === 'intense' ? 'tactical' : motivationStyle === 'game_like' ? 'game_guide' : motivationStyle === 'coach_led' ? 'mentor' : 'reflection',
    studyLayerName: motivationStyle === 'study_focused' ? 'Study OS' : 'Deep Work Plan',
    defaultSessionDuration: 25,
    defaultSessionMode: motivationStyle === 'study_focused' ? 'STUDY' : 'FOCUS',
    userStage: 'new',
    ...overrides,
  };
}

function stats(overrides: Partial<BehaviorStats> = {}): BehaviorStats {
  return {
    abandonedSessionDurations: [],
    bossChallengeEngagement: 'none',
    coachInteractions: 0,
    comebackSessions: 0,
    completedSessionDurations: [],
    completionStreak: 0,
    ignoredFeatures: [],
    mostSuccessfulTimeOfDay: null,
    preferredSessionMode: null,
    premiumFeatureAttempts: [],
    studyUsageRatio: 0,
    totalCompletedSessions: 0,
    ...overrides,
  };
}

describe('resolveVexExperience', () => {
  it('shows a calm user the subtle boss version without battle language', () => {
    const experience = resolveVexExperience(profile('calm'), stats({
      totalCompletedSessions: 5,
    }), available);

    expect(experience.boss.intensity).toBe('subtle');
    expect(experience.boss.homePlacement).toBe('top_tiny');
    expect(experience.boss.copy).toContain('momentum');
    expect(experience.boss.copy).not.toMatch(/battle|damage|kill|defeat/i);
    expect(experience.home.sections).not.toContain('boss_full_cta');
  });

  it('shows a game-like user stronger boss progress tied to sessions', () => {
    const experience = resolveVexExperience(profile('game_like'), stats({
      bossChallengeEngagement: 'high',
      completedSessionDurations: [25, 30, 25],
      totalCompletedSessions: 8,
    }), available);

    expect(experience.boss.intensity).toBe('game-like');
    expect(experience.boss.progressSource).toBe('completed_focus_sessions');
    expect(experience.boss.completionEffect).toBe('session_damage');
    expect(experience.boss.systemsDisabled).toEqual(
      expect.arrayContaining(['shop', 'inventory', 'premium_currency', 'battle_pass']),
    );
    expect(experience.home.sections).toContain('boss_compact');
  });

  it('does not query or navigate boss routes when boss is unavailable', () => {
    const experience = resolveVexExperience(profile('game_like'), stats({
      totalCompletedSessions: 12,
    }), unavailable);

    expect(experience.routeGates.boss.canQuery).toBe(false);
    expect(experience.routeGates.boss.canNavigate).toBe(false);
    expect(experience.boss.isVisible).toBe(false);
    expect(experience.home.sections).not.toContain('boss_compact');
  });

  it('keeps boss off day zero except an optional tiny teaser', () => {
    const experience = resolveVexExperience(profile('game_like'), stats(), available);

    expect(experience.boss.isVisible).toBe(false);
    expect(experience.boss.dayZeroTeaserAllowed).toBe(true);
    expect(experience.routeGates.boss.canQuery).toBe(false);
    expect(experience.routeGates.boss.canNavigate).toBe(false);
  });

  it('orders completion as core, coach, progress, contextual systems, next action', () => {
    const experience = resolveVexExperience(profile('study_focused'), stats({
      completedSessionDurations: [25, 25, 45],
      studyUsageRatio: 0.7,
      totalCompletedSessions: 6,
    }), available);

    expect(experience.completion.sequence).toEqual([
      'core_saved',
      'coach_companion_reflection',
      'streak_progress',
      'study_progress',
      'quiet_xp',
      'next_action',
    ]);
  });

  it('uses behavior softly without overfitting after one session', () => {
    const oneSession = resolveVexExperience(profile('coach_led'), stats({
      completedSessionDurations: [60],
      totalCompletedSessions: 1,
    }), available);
    const repeated = resolveVexExperience(profile('coach_led'), stats({
      completedSessionDurations: [25, 25, 30, 25],
      mostSuccessfulTimeOfDay: 'morning',
      totalCompletedSessions: 6,
    }), available);

    expect(oneSession.sessionDefaults.duration).toBe(25);
    expect(oneSession.behaviorAdaptations).toContain('needs_more_signal');
    expect(repeated.sessionDefaults.duration).toBe(25);
    expect(repeated.sessionDefaults.copy).toContain('repeat your best rhythm');
  });

  it('delays premium until value is experienced and keeps the execution loop free', () => {
    const early = resolveVexExperience(profile('study_focused'), stats({
      totalCompletedSessions: 2,
    }), available);
    const ready = resolveVexExperience(profile('study_focused'), stats({
      premiumFeatureAttempts: ['weekly_intelligence'],
      totalCompletedSessions: 7,
    }), available);

    expect(early.premium.shouldTease).toBe(false);
    expect(ready.premium.shouldTease).toBe(true);
    expect(ready.premium.copy).toContain('deeper personalization');
    expect(ready.premium.mustRemainFree).toEqual(
      expect.arrayContaining(['start_session', 'complete_session', 'basic_coach']),
    );
  });

  it('defines final release as polished core with unfinished economies disabled', () => {
    const experience = resolveVexExperience(profile('intense'), stats({
      totalCompletedSessions: 20,
    }), available);

    expect(experience.release.included).toContain('adaptive_home');
    expect(experience.release.hidden).toEqual(
      expect.arrayContaining(['shop', 'inventory', 'battle_pass', 'wagers']),
    );
    expect(experience.release.productionProof).toContain('real_device_first_session_qa');
  });
});
