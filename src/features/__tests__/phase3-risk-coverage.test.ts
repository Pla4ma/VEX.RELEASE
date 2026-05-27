/**
 * Phase 3 — Remaining Lane Risk Coverage
 *
 * Risk 1: Study AI completion path (post-session next action)
 * Risk 2: Premium gating (premiumState: free | premium)
 * Risk 3: Run companion party-mode gating
 * Risk 4: ProjectThread persistence via focus-memory repository
 * Risk 5: First-week progressive unlock staging
 */

import { hasActiveStudyFollowUp, extractStudyContextFromSession } from '../session-completion/study-context';
import { buildPostSessionNextAction } from '../session-completion/post-session-next-action';
import { computeWeakTopics, computeWeeklyIntelligence, hasWeeklyIntelligenceData } from '../study-intelligence/service';
import type { StudyPlan } from '../study-os/schemas';
import { resolveFirstWeekExperience } from '../personalization/first-week-service';
import type { FirstWeekResolverInput } from '../personalization/first-week-schemas';
import { resolveCompletionExperiencePolicy } from '../session-completion/completion-experience-policy';
import type { CompletionExperiencePolicyInput } from '../session-completion/completion-experience-policy-schemas';
import { resolveLaneCopy } from '../personalization/first-week-lane-copy';
import { getLaneMechanicPolicy } from '../lane-engine/service';
import { decideNudge } from '../notification-policy/service';
import { decideHomeSurfaces } from '../home-experience/home-surface-decision';
import { buildLaneSessionBrief } from '../session-start/service';
import { SessionMode } from '../../session/modes';
import type { Lane, LaneProfile } from '../lane-engine/types';

const TEST_UUID = '550e8400-e29b-41d4-a716-446655440000';

const baseLaneProfile = (overrides: Partial<LaneProfile>): LaneProfile => ({
  primaryLane: 'minimal_normal',
  secondaryLane: null,
  confidence: 0.8,
  confidenceBand: 'high',
  source: 'onboarding',
  evidence: [],
  traits: { needsStructure: 0.5, wantsPlay: 0.1, needsContinuity: 0.4, wantsQuiet: 0.9 },
  resolvedAt: Date.now(),
  ...overrides,
});

type SessionModeString = (typeof SessionMode)[keyof typeof SessionMode];

function sess(overrides: {
  sessionId?: string;
  userId?: string;
  sessionMode?: SessionModeString;
  plannedDuration?: number;
  effectiveDuration?: number;
}) {
  const now = Date.now();
  return {
    sessionId: overrides.sessionId ?? TEST_UUID,
    userId: overrides.userId ?? TEST_UUID,
    status: 'COMPLETED' as const,
    sessionMode: overrides.sessionMode ?? SessionMode.LIGHT_FOCUS,
    plannedDuration: overrides.plannedDuration ?? 1500,
    actualDuration: 1500,
    effectiveDuration: overrides.effectiveDuration ?? 1500,
    pausedDuration: 0,
    completionPercentage: 100,
    focusQuality: 90,
    focusPurityScore: 90,
    interruptions: 0,
    pauses: 0,
    pausedTime: 0,
    streakMaintained: true,
    modeBonus: 0,
    baseScore: 80,
    timeBonus: 5,
    finalScore: 90,
    createdAt: now,
    streakIncreased: true,
    streakDays: 3,
    xpEarned: 100,
    coinsEarned: 0,
    gemsEarned: 0,
    damageTaken: 0,
    vsAverage: 10,
    vsBest: -5,
    penaltiesApplied: [],
  };
}

function makeStudyPlan(overrides: Partial<StudyPlan> = {}): StudyPlan {
  const now = Date.now();
  return {
    blocks: [{
      id: 'block-1', title: 'Cell Biology', objective: 'Understand mitochondrial function',
      estimatedMinutes: 30, status: 'completed' as const, order: 1,
    }],
    createdAt: now,
    deadlineAt: null,
    id: overrides.id ?? 'plan-1',
    reviewItems: [{
      id: 'review-1', prompt: 'Explain the Krebs cycle', confidence: 'weak' as const,
      studyPlanId: overrides.id ?? 'plan-1', answerHint: null, dueAt: now + 86400000,
    }],
    source: 'manual' as const,
    status: 'active' as const,
    title: overrides.title ?? 'Biology Review',
    userId: overrides.userId ?? TEST_UUID,
  };
}

const baseStats = { bossEngagement: 'none' as const, studyUsageRatio: 0 };

// ============================================================================
// Risk 1 — Study AI Completion Path
// ============================================================================

describe('Risk 1 — Study AI Completion Path', () => {
  it('hasActiveStudyFollowUp true when studyTarget exists', () => {
    const ctx = extractStudyContextFromSession({ studyTarget: 'Cell Biology', studyPlanId: 'plan-1' });
    expect(hasActiveStudyFollowUp(ctx)).toBe(true);
  });

  it('hasActiveStudyFollowUp false with no study data', () => {
    const ctx = extractStudyContextFromSession(undefined);
    expect(hasActiveStudyFollowUp(ctx)).toBe(false);
  });

  it('buildPostSessionNextAction with study context returns STUDY mode review CTA', () => {
    const summary = sess({ sessionMode: SessionMode.STUDY, sessionId: TEST_UUID, userId: TEST_UUID });
    const result = buildPostSessionNextAction({ summary, studyContext: { studyTarget: 'Cell Biology', studyPlanId: 'plan-1' } });
    expect(result.ctaLabel).toBe('Review next');
    expect(result.reason).toContain('Cell Biology');
    expect(result.routeParams.presetMode).toBe('STUDY');
  });

  it('buildPostSessionNextAction without study context generates recommendation', () => {
    const summary = sess({ sessionMode: SessionMode.LIGHT_FOCUS, sessionId: TEST_UUID, userId: TEST_UUID });
    const result = buildPostSessionNextAction({ summary });
    expect(result.ctaLabel).toBe('Start next focus');
    expect(result.routeParams.recommendationId).toContain(TEST_UUID);
  });

  it('computeWeakTopics returns empty for no plans', () => {
    expect(computeWeakTopics([])).toHaveLength(0);
  });

  it('computeWeakTopics detects weak review confidence', () => {
    const plan = makeStudyPlan();
    const topics = computeWeakTopics([plan]);
    expect(topics.length).toBeGreaterThan(0);
    expect(topics.find((t) => t.topic === 'cell')).toBeDefined();
  });

  it('computeWeeklyIntelligence returns valid structure for no data', () => {
    const intel = computeWeeklyIntelligence({ plans: [], streakDays: 0 });
    expect(intel.suggestion).toContain('first study block');
  });

  it('hasWeeklyIntelligenceData: false for empty, true when done blocks exist', () => {
    expect(hasWeeklyIntelligenceData([])).toBe(false);
    const plan = makeStudyPlan();
    expect(hasWeeklyIntelligenceData([plan])).toBe(true);
  });
});

// ============================================================================
// Risk 2 — Premium Gating
// ============================================================================

describe('Risk 2 — Premium Gating', () => {
  const compDefaults = {
    consequences: undefined,
    featureAvailability: { boss: true, challenges: true, progress: true, study: true, contractUsed: false },
    firstWeekStage: null,
  } as const;

  it('premiumState premium: Study keeps progress, hides currency', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...compDefaults,
      lane: 'student', motivationStyle: 'study_focused', premiumState: 'premium', primaryGoal: 'STUDY',
      sessionMode: SessionMode.STUDY,
      summary: sess({ sessionMode: SessionMode.STUDY, sessionId: TEST_UUID, userId: TEST_UUID }),
    } as CompletionExperiencePolicyInput);
    expect(policy.adaptivePayoff).toBe('study_progress');
    expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
    expect(policy.hiddenCompletionSurfaces).toContain('premium_chest');
  });

  it('premiumState premium: Run boss_damage fires, currency still hidden', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...compDefaults,
      lane: 'game_like', motivationStyle: 'game_like', premiumState: 'premium', primaryGoal: 'WORK',
      consequences: { boss: { damage: 50 } }, sessionMode: SessionMode.SPRINT,
      summary: sess({ sessionMode: SessionMode.SPRINT, sessionId: TEST_UUID, userId: TEST_UUID }),
    } as CompletionExperiencePolicyInput);
    expect(policy.adaptivePayoff).toBe('boss_damage');
    expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
  });

  it('premiumState premium: Clean stays minimal', () => {
    const policy = resolveCompletionExperiencePolicy({
      ...compDefaults,
      lane: 'minimal_normal', motivationStyle: 'calm', premiumState: 'premium', primaryGoal: 'WORK',
      sessionMode: SessionMode.LIGHT_FOCUS,
      summary: sess({ sessionMode: SessionMode.LIGHT_FOCUS, sessionId: TEST_UUID, userId: TEST_UUID }),
    } as CompletionExperiencePolicyInput);
    expect(policy.animationLevel).toBe('minimal');
    expect(policy.heroBeat.surface).toBe('hero_minimal');
  });

  it('firstWeek: premiumState configured unlocks premium moments at DAY_5/DAY_7', () => {
    const day5 = resolveFirstWeekExperience({
      behaviorStats: baseStats, completedSessions: 5, daysSinceLastSession: null, daysSinceOnboarding: 6,
      featureAvailability: { boss: true, premium: true, social: false, study: true },
      motivationStyle: 'coach_led', premiumState: 'configured', primaryGoal: 'work',
    });
    expect(day5.premiumMoment).toBe('soft_tease');

    const day7 = resolveFirstWeekExperience({
      behaviorStats: baseStats, completedSessions: 7, daysSinceLastSession: null, daysSinceOnboarding: 7,
      featureAvailability: { boss: true, premium: true, social: false, study: true },
      motivationStyle: 'coach_led', premiumState: 'configured', primaryGoal: 'work',
    });
    expect(day7.premiumMoment).toBe('weekly_value');
  });

  it('premiumState unavailable: premiumMoment always none', () => {
    for (const sessions of [0, 5, 7]) {
      const result = resolveFirstWeekExperience({
        behaviorStats: baseStats, completedSessions: sessions, daysSinceLastSession: null,
        daysSinceOnboarding: sessions,
        featureAvailability: { boss: true, premium: true, social: false, study: true },
        motivationStyle: 'coach_led', premiumState: 'unavailable', primaryGoal: 'work',
      });
      expect(result.premiumMoment).toBe('none');
    }
  });

  it('all four modes produce valid completion with premiumState premium', () => {
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      const policy = resolveCompletionExperiencePolicy({
        ...compDefaults,
        lane,
        consequences: lane === 'game_like' ? { boss: { damage: 50 } } : undefined,
        featureAvailability: { boss: true, challenges: true, progress: true, study: true, contractUsed: false },
        motivationStyle: lane === 'game_like' ? 'game_like' : lane === 'minimal_normal' ? 'calm' : 'coach_led',
        premiumState: 'premium',
        primaryGoal: lane === 'student' ? 'STUDY' : 'WORK',
        sessionMode: lane === 'student' ? SessionMode.STUDY : lane === 'game_like' ? SessionMode.SPRINT : SessionMode.LIGHT_FOCUS,
        summary: sess({
          sessionMode: lane === 'student' ? SessionMode.STUDY : lane === 'game_like' ? SessionMode.SPRINT : SessionMode.LIGHT_FOCUS,
          sessionId: TEST_UUID, userId: TEST_UUID,
        }),
      } as CompletionExperiencePolicyInput);
      expect(policy.heroBeat).toBeDefined();
      expect(policy.nextAction).toBeDefined();
      expect(policy.hiddenCompletionSurfaces).toContain('premium_chest');
    }
  });
});

// ============================================================================
// Risk 3 — Run Companion Party-Mode Gating
// ============================================================================

describe('Risk 3 — Run Companion Party-Mode Gating', () => {
  it('companion_party_member and optional_party_mode only in game_like', () => {
    const runPolicy = getLaneMechanicPolicy(baseLaneProfile({ primaryLane: 'game_like' }));
    expect(runPolicy.preferredMechanics).toContain('companion_party_member');
    expect(runPolicy.preferredMechanics).toContain('optional_party_mode');

    for (const lane of ['student', 'deep_creative', 'minimal_normal'] as const) {
      const policy = getLaneMechanicPolicy(baseLaneProfile({ primaryLane: lane }));
      expect(policy.preferredMechanics).not.toContain('companion_party_member');
      expect(policy.preferredMechanics).not.toContain('optional_party_mode');
    }
  });

  it('Clean blocks companion_chores; game_like omits chores from preferred', () => {
    const cleanPolicy = getLaneMechanicPolicy(baseLaneProfile({ primaryLane: 'minimal_normal' }));
    expect(cleanPolicy.blockedMechanics).toContain('companion_chores');

    const runPolicy = getLaneMechanicPolicy(baseLaneProfile({ primaryLane: 'game_like' }));
    expect(runPolicy.preferredMechanics).not.toContain('companion_chores');
  });

  it('Run brief has encounter CTA, no party/squad language', () => {
    const brief = buildLaneSessionBrief({ lane: 'game_like' });
    expect(brief.sessionMode).toBe(SessionMode.SPRINT);
    expect(brief.ctaLabel).toBe('Start encounter');
    expect(brief.title).not.toContain('party');
  });

  it('Run Day 0: game_like gets tiny_boss_teaser, others do not', () => {
    const runDay0 = resolveFirstWeekExperience({
      behaviorStats: baseStats, completedSessions: 0, daysSinceLastSession: null, daysSinceOnboarding: 0,
      featureAvailability: { boss: true, premium: false, social: false, study: false },
      motivationStyle: 'game_like', premiumState: 'unavailable', primaryGoal: 'work',
      laneProfile: baseLaneProfile({ primaryLane: 'game_like' }),
    });
    expect(runDay0.allowedHomeSurfaces).toContain('tiny_boss_teaser');

    for (const lane of ['student', 'deep_creative', 'minimal_normal'] as const) {
      const result = resolveFirstWeekExperience({
        behaviorStats: baseStats, completedSessions: 0, daysSinceLastSession: null, daysSinceOnboarding: 0,
        featureAvailability: { boss: true, premium: false, social: false, study: true },
        motivationStyle: 'calm', premiumState: 'unavailable', primaryGoal: 'work',
        laneProfile: baseLaneProfile({ primaryLane: lane }),
      });
      expect(result.allowedHomeSurfaces).not.toContain('tiny_boss_teaser');
    }
  });
});

// ============================================================================
// Risk 4 — ProjectThread Persistence
// ============================================================================

describe('Risk 4 — ProjectThread Persistence', () => {
  it('deep_creative prefers project_thread, continuity_memory, next_move', () => {
    const policy = getLaneMechanicPolicy(baseLaneProfile({ primaryLane: 'deep_creative' }));
    expect(policy.preferredMechanics).toContain('project_thread');
    expect(policy.preferredMechanics).toContain('continuity_memory');
    expect(policy.preferredMechanics).toContain('next_move');
  });

  it('deep_creative blocks loud_combat and study_exam_copy', () => {
    const policy = getLaneMechanicPolicy(baseLaneProfile({ primaryLane: 'deep_creative' }));
    expect(policy.blockedMechanics).toContain('loud_combat_default');
    expect(policy.blockedMechanics).toContain('study_exam_copy');
  });

  it('Project Day 3 companion observation references project continuity', () => {
    const result = resolveFirstWeekExperience({
      behaviorStats: baseStats, completedSessions: 3, daysSinceLastSession: null, daysSinceOnboarding: 3,
      featureAvailability: { boss: false, premium: false, social: false, study: true },
      motivationStyle: 'coach_led', premiumState: 'unavailable', primaryGoal: 'creative',
      sessionProfile: { averageDurationMinutes: 30, completions: 3, abandonments: 0, preferredStartHour: 10, consistencyScore: 0.8, savedNextMoves: 0, longestStreak: 3 },
      laneProfile: baseLaneProfile({ primaryLane: 'deep_creative' }),
    });
    expect(result.currentDayStage).toBe('DAY_3_COMPANION_CONNECTION');
    expect(result.unlockExplanation).toContain('project');
  });

  it('Project day 5 path references Project Focus Path', () => {
    const result = resolveFirstWeekExperience({
      behaviorStats: baseStats, completedSessions: 5, daysSinceLastSession: null, daysSinceOnboarding: 5,
      featureAvailability: { boss: false, premium: false, social: false, study: true },
      motivationStyle: 'coach_led', premiumState: 'unavailable', primaryGoal: 'creative',
      sessionProfile: { averageDurationMinutes: 30, completions: 5, abandonments: 0, preferredStartHour: 14, consistencyScore: 0.6, savedNextMoves: 3, longestStreak: 3 },
      laneProfile: baseLaneProfile({ primaryLane: 'deep_creative' }),
    });
    expect(result.currentDayStage).toBe('DAY_5_PATH_FORMING');
    expect(result.unlockExplanation).toContain('Project Focus Path');
  });

  it('Project day 7 weekly intelligence references creative flow', () => {
    const result = resolveFirstWeekExperience({
      behaviorStats: baseStats, completedSessions: 7, daysSinceLastSession: null, daysSinceOnboarding: 7,
      featureAvailability: { boss: false, premium: false, social: false, study: true },
      motivationStyle: 'coach_led', premiumState: 'unavailable', primaryGoal: 'creative',
      sessionProfile: { averageDurationMinutes: 45, completions: 7, abandonments: 0, preferredStartHour: 9, consistencyScore: 0.75, savedNextMoves: 4, longestStreak: 5 },
      laneProfile: baseLaneProfile({ primaryLane: 'deep_creative' }),
    });
    expect(result.currentDayStage).toBe('DAY_7_DEEPER_MODE');
    expect(result.primaryMessage).toContain('creative');
  });

  it('Project home surfaces show project_thread and focus_window after engagement', () => {
    const map = decideHomeSurfaces({
      behaviorStats: { bossChallengeEngagement: 'none' as const, coachInteractions: 0, comebackSessions: 0, completionStreak: 0, ignoredFeatures: [], premiumFeatureAttempts: [], studyUsageRatio: 0, totalCompletedSessions: 5, projectFocusUsageRatio: 0.7 },
      featureAvailability: { boss: true, challenges: true, premium: true, study: true },
      hasActiveBoss: false, hasActiveRecommendation: false, hasActiveStudyPlan: false, isFirstSession: false,
      personalizationProfile: { gamificationIntensity: 'medium' as const, motivationStyle: 'coach_led' as const, primaryGoal: 'creative' as const, studyLayerName: 'Deep Work Plan', userStage: 'engaged' as const },
      laneProfile: baseLaneProfile({ primaryLane: 'deep_creative' }),
    });
    expect(map.project_thread).not.toBe('hidden');
    expect(map.focus_window).not.toBe('hidden');
  });
});

// ============================================================================
// Risk 5 — First-Week Progressive Unlock Staging
// ============================================================================

describe('Risk 5 — First-Week Progressive Unlock Staging', () => {
  it('DAY_0: all four modes unique laneStageThemes', () => {
    const themes: Record<Lane, string> = {} as Record<Lane, string>;
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      themes[lane] = resolveLaneCopy('DAY_0_NOT_STARTED', baseLaneProfile({ primaryLane: lane }), 'fallback').laneStageTheme;
    }
    expect(themes.student).toBe('first_study_block');
    expect(themes.game_like).toBe('first_focus_run');
    expect(themes.deep_creative).toBe('first_project_block');
    expect(themes.minimal_normal).toBe('first_clean_session');
  });

  it('DAY_1-7: laneStageTheme uses public-facing lane names', () => {
    const pn: Record<Lane, string> = { student: 'study', game_like: 'run', deep_creative: 'project', minimal_normal: 'clean' };
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      const profile = baseLaneProfile({ primaryLane: lane });
      const d1 = resolveLaneCopy('DAY_1_RETURN', profile, 'fallback');
      expect(d1.laneStageTheme).toBe(`${pn[lane]}_return`);
      const d2 = resolveLaneCopy('DAY_2_PROGRESS_PROOF', profile, 'fallback');
      expect(d2.laneStageTheme).toBe(`${pn[lane]}_proof`);
      const d3 = resolveLaneCopy('DAY_3_COMPANION_CONNECTION', profile, 'fallback');
      expect(d3.laneStageTheme).toBe(`${pn[lane]}_companion_preview`);
      const d7 = resolveLaneCopy('DAY_7_DEEPER_MODE', profile, 'fallback');
      expect(d7.laneStageTheme).toBe(`${pn[lane]}_weekly_intelligence`);
    }
  });

  it('full student progression: all stages correct', () => {
    const stages: string[] = [];
    const profile = baseLaneProfile({ primaryLane: 'student' });
    for (const stage of ['DAY_0_NOT_STARTED', 'DAY_1_RETURN', 'DAY_2_PROGRESS_PROOF', 'DAY_3_COMPANION_CONNECTION', 'DAY_5_PATH_FORMING', 'DAY_7_DEEPER_MODE'] as const) {
      stages.push(`${stage}:${resolveLaneCopy(stage, profile, 'fallback').laneStageTheme}`);
    }
    expect(stages).toEqual([
      'DAY_0_NOT_STARTED:first_study_block', 'DAY_1_RETURN:study_return',
      'DAY_2_PROGRESS_PROOF:study_proof', 'DAY_3_COMPANION_CONNECTION:study_companion_preview',
      'DAY_5_PATH_FORMING:student_path_forming', 'DAY_7_DEEPER_MODE:study_weekly_intelligence',
    ]);
  });

  it('resolveFirstWeekExperience stages through all days', () => {
    const base: Partial<FirstWeekResolverInput> = {
      behaviorStats: baseStats, daysSinceLastSession: null,
      featureAvailability: { boss: false, premium: false, social: false, study: true },
      motivationStyle: 'study_focused', premiumState: 'unavailable', primaryGoal: 'study',
      laneProfile: baseLaneProfile({ primaryLane: 'student' }),
    };
    const day0 = resolveFirstWeekExperience({ ...base, completedSessions: 0, daysSinceOnboarding: 0 } as FirstWeekResolverInput);
    expect(day0.currentDayStage).toBe('DAY_0_NOT_STARTED');
    const day3 = resolveFirstWeekExperience({ ...base, completedSessions: 3, daysSinceOnboarding: 3 } as FirstWeekResolverInput);
    expect(day3.currentDayStage).toBe('DAY_3_COMPANION_CONNECTION');
    const day7 = resolveFirstWeekExperience({ ...base, completedSessions: 7, daysSinceOnboarding: 7 } as FirstWeekResolverInput);
    expect(day7.currentDayStage).toBe('DAY_7_DEEPER_MODE');
    const post = resolveFirstWeekExperience({ ...base, completedSessions: 10, daysSinceOnboarding: 14 } as FirstWeekResolverInput);
    expect(post.currentDayStage).toBe('POST_DAY_7');
  });

  it('Clean end-to-end: max 1 notif, no boss', () => {
    const day0 = resolveFirstWeekExperience({
      behaviorStats: baseStats, completedSessions: 0, daysSinceLastSession: null, daysSinceOnboarding: 0,
      featureAvailability: { boss: false, premium: false, social: false, study: false },
      motivationStyle: 'calm', premiumState: 'unavailable', primaryGoal: 'work',
      laneProfile: baseLaneProfile({ primaryLane: 'minimal_normal' }),
    });
    expect(day0.allowedHomeSurfaces).not.toContain('tiny_boss_teaser');
    const nudge = decideNudge({ lane: 'minimal_normal', completedSessions: 3, daysSinceOnboarding: 3, sentToday: 1 });
    expect(nudge.allowed).toBe(false);
  });

  it('comeback state progression: none → missed_1 → missed_week → long_gap', () => {
    const base: Partial<FirstWeekResolverInput> = {
      behaviorStats: baseStats, featureAvailability: { boss: false, premium: false, social: false, study: true },
      motivationStyle: 'coach_led', premiumState: 'unavailable', primaryGoal: 'work',
      completedSessions: 0, daysSinceOnboarding: 0,
    };
    expect(resolveFirstWeekExperience({ ...base, daysSinceLastSession: 0 } as FirstWeekResolverInput).comebackState).toBe('none');
    expect(resolveFirstWeekExperience({ ...base, daysSinceLastSession: 2 } as FirstWeekResolverInput).comebackState).toBe('missed_1_day');
    expect(resolveFirstWeekExperience({ ...base, daysSinceLastSession: 7 } as FirstWeekResolverInput).comebackState).toBe('missed_week');
    expect(resolveFirstWeekExperience({ ...base, daysSinceLastSession: 30 } as FirstWeekResolverInput).comebackState).toBe('returning_after_long_gap');
  });

  it('final release: economy surfaces permanently hidden', () => {
    for (const sessions of [0, 3, 7, 10]) {
      const result = resolveFirstWeekExperience({
        behaviorStats: baseStats, completedSessions: sessions, daysSinceLastSession: null, daysSinceOnboarding: sessions,
        featureAvailability: { boss: true, premium: true, social: true, study: true },
        motivationStyle: 'coach_led', premiumState: 'configured', primaryGoal: 'work',
      });
      const blocked = ['shop', 'inventory', 'battle_pass', 'wagers', 'rivals', 'squads', 'leaderboards', 'premium_currency', 'premium_hard_sell', 'advanced_economy'];
      for (const b of blocked) {
        expect(result.hiddenSurfaces).toContain(b as (typeof result.hiddenSurfaces)[number]);
      }
    }
  });
});
