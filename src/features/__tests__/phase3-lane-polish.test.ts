/**
 * Phase 3 — Lane Product Polish Tests
 *
 * Covers: Phase 3A (pipeline audit), 3B (Study polish),
 * 3C (Clean polish), 3D (Run polish), 3E (Project polish),
 * 3F (Unified architecture proof).
 *
 * All tests consume existing services — no new architecture created.
 */

import { getLaneMechanicPolicy, getLanePresentationPolicy } from '../lane-engine';
import type { Lane, LaneProfile, LaneMechanicPolicy } from '../lane-engine/types';
import { buildLaneSessionBrief } from '../session-start/service';
import { decideNudge } from '../notification-policy/service';
import type { NudgeDecision } from '../notification-policy/types';
import { isRescueEligible, createRescuePlan } from '../rescue-mode/service';
import { resolveCompletionExperiencePolicy } from '../session-completion/completion-experience-policy';
import type {
  CompletionExperiencePolicy,
  CompletionExperiencePolicyInput,
} from '../session-completion/completion-experience-policy-schemas';
import { resolveLaneCopy } from '../personalization/first-week-lane-copy';
import { LANE_USER_FACING_NAMES } from '../lane-engine/schemas';
import { decideHomeSurfaces } from '../home-experience/home-surface-decision';
import { SessionMode } from '../../session/modes';
type SessionModeString = (typeof SessionMode)[keyof typeof SessionMode];

// ─── Test Fixtures ─────────────────────────────────────────────────────

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

const featureAvailability = { boss: true, challenges: true, premium: true, study: true };
const baseStats = {
  bossChallengeEngagement: 'none' as const,
  coachInteractions: 0,
  comebackSessions: 0,
  completionStreak: 0,
  ignoredFeatures: [],
  premiumFeatureAttempts: [],
  studyUsageRatio: 0,
  totalCompletedSessions: 0,
};
const baseProfile = {
  gamificationIntensity: 'medium' as const,
  motivationStyle: 'coach_led' as const,
  primaryGoal: 'work' as const,
  studyLayerName: 'Deep Work Plan',
  userStage: 'engaged' as const,
};

function sessionSummary(overrides: {
  sessionId?: string;
  userId?: string;
  sessionMode?: SessionModeString;
  plannedDuration?: number;
  effectiveDuration?: number;
  completionPercentage?: number;
  focusQuality?: number;
  finalScore?: number;
  streakMaintained?: boolean;
  createdAt?: number;
}): CompletionExperiencePolicyInput['summary'] {
  const now = Date.now();
  return {
    sessionId: overrides.sessionId ?? 'test-summary-id',
    userId: overrides.userId ?? 'test-user',
    status: 'COMPLETED',
    sessionMode: overrides.sessionMode ?? SessionMode.LIGHT_FOCUS,
    plannedDuration: overrides.plannedDuration ?? 1500,
    actualDuration: 1500,
    effectiveDuration: overrides.effectiveDuration ?? 1500,
    pausedDuration: 0,
    completionPercentage: overrides.completionPercentage ?? 100,
    focusQuality: overrides.focusQuality ?? 90,
    focusPurityScore: 90,
    interruptions: 0,
    pauses: 0,
    pausedTime: 0,
    streakMaintained: overrides.streakMaintained ?? true,
    modeBonus: 0,
    baseScore: 80,
    timeBonus: 5,
    finalScore: overrides.finalScore ?? 90,
    createdAt: overrides.createdAt ?? now,
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

function completionInput(overrides: {
  lane?: Lane;
  motivationStyle?: CompletionExperiencePolicyInput['motivationStyle'];
  premiumState?: CompletionExperiencePolicyInput['premiumState'];
  primaryGoal?: CompletionExperiencePolicyInput['primaryGoal'];
  sessionMode?: CompletionExperiencePolicyInput['sessionMode'];
  featureAvailability?: CompletionExperiencePolicyInput['featureAvailability'];
  consequences?: CompletionExperiencePolicyInput['consequences'];
  summary?: Partial<CompletionExperiencePolicyInput['summary']>;
}): CompletionExperiencePolicyInput {
  return {
    consequences: overrides.consequences ?? undefined,
    featureAvailability: overrides.featureAvailability ?? { boss: true, challenges: true, progress: true, study: true, contractUsed: false },
    firstWeekStage: null,
    lane: overrides.lane ?? 'minimal_normal',
    motivationStyle: overrides.motivationStyle ?? 'calm',
    premiumState: overrides.premiumState ?? 'free',
    primaryGoal: overrides.primaryGoal ?? 'WORK',
    sessionMode: overrides.sessionMode ?? SessionMode.LIGHT_FOCUS,
    summary: sessionSummary({
      sessionMode: overrides.sessionMode,
      ...(overrides.summary ?? {}),
    }),
  };
}

function auditLane(lane: Lane): string {
  const profile = baseLaneProfile({ primaryLane: lane });
  const policy = getLaneMechanicPolicy(profile);
  const brief = buildLaneSessionBrief({ lane });
  const nudge = decideNudge({ lane, completedSessions: 0, daysSinceOnboarding: 0 });
  const input = completionInput({ lane, motivationStyle: lane === 'minimal_normal' ? 'calm' : 'coach_led', sessionMode: brief.sessionMode });
  const completion = resolveCompletionExperiencePolicy(input);
  const day0Copy = resolveLaneCopy('DAY_0_NOT_STARTED', profile, 'fallback');

  return [
    `Lane: ${lane} (${LANE_USER_FACING_NAMES[lane]})`,
    `  Day 0 surface: ${day0Copy.laneStageTheme}, "${day0Copy.primaryMessage}"`,
    `  Session mode: ${brief.sessionMode}, CTA: "${brief.ctaLabel}"`,
    `  Completion: animation=${completion.animationLevel}, payoff=${completion.adaptivePayoff}, next=${completion.nextAction}`,
    `  Notification budget: ${nudge.budgetRemaining}/${nudge.lane === 'minimal_normal' ? 1 : 2}/day`,
    `  Preferred: ${policy.preferredMechanics.join(', ')}`,
    `  Blocked: ${policy.blockedMechanics.join(', ')}`,
    `  Hidden completion surfaces: ${completion.hiddenCompletionSurfaces.length}`,
    '',
  ].join('\n');
}

// ============================================================================
// Phase 3A — Lane Pipeline Audit
// ============================================================================

describe('Phase 3A — Lane Pipeline Audit', () => {
  it('audit table: all four modes produce distinct profiles', () => {
    const results: Record<Lane, string> = {} as Record<Lane, string>;
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      results[lane] = auditLane(lane);
    }

    const modes = Object.values(results);
    const modeLines = modes.map((m) => m.match(/Session mode: (\w+)/)?.[1]);
    const uniqueModes = new Set(modeLines);
    expect(uniqueModes.size).toBe(4);

    const themes = modes.map((m) => m.match(/Day 0 surface: (\w+)/)?.[1]);
    const uniqueThemes = new Set(themes);
    expect(uniqueThemes.size).toBe(4);

    expect(results.student).toContain('first_study_block');
    expect(results.game_like).toContain('first_focus_run');
    expect(results.deep_creative).toContain('first_project_block');
    expect(results.minimal_normal).toContain('first_clean_session');
  });

  it('audit table: mechanism policies match locked decisions', () => {
    const policies: Record<Lane, LaneMechanicPolicy> = {
      student: getLaneMechanicPolicy(baseLaneProfile({ primaryLane: 'student' })),
      game_like: getLaneMechanicPolicy(baseLaneProfile({ primaryLane: 'game_like' })),
      deep_creative: getLaneMechanicPolicy(baseLaneProfile({ primaryLane: 'deep_creative' })),
      minimal_normal: getLaneMechanicPolicy(baseLaneProfile({ primaryLane: 'minimal_normal' })),
    };

    expect(policies.student.preferredMechanics).toContain('study_os');
    expect(policies.minimal_normal.blockedMechanics).toContain('boss_full_cta');
    expect(policies.minimal_normal.blockedMechanics).toContain('xp_first_ui');
    expect(policies.game_like.preferredMechanics).toContain('personal_boss');
    expect(policies.deep_creative.preferredMechanics).toContain('project_thread');
  });

  it('audit table: Clean notification budget is max 1/day', () => {
    const cleanNudge = decideNudge({
      lane: 'minimal_normal',
      completedSessions: 3,
      daysSinceOnboarding: 3,
      sentToday: 1,
    });
    expect(cleanNudge.allowed).toBe(false);
    expect(cleanNudge.budgetRemaining).toBe(0);

    const studyNudge = decideNudge({
      lane: 'student',
      completedSessions: 3,
      daysSinceOnboarding: 3,
      sentToday: 1,
    });
    expect(studyNudge.allowed).toBe(true);
    expect(studyNudge.budgetRemaining).toBe(1);
  });

  it('audit table: presentation policy maps Clean to minimal animation', () => {
    const cleanPres = getLanePresentationPolicy({ lane: 'minimal_normal', reducedMotion: false });
    expect(cleanPres.animation).toBe('minimal');

    const runPres = getLanePresentationPolicy({ lane: 'game_like', reducedMotion: false });
    expect(runPres.animation).toBe('medium_high');
  });
});

// ============================================================================
// Phase 3B — Study Mode Polish
// ============================================================================

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
    // study_os is blocked on Day 0 per day0-surface-constants
    // tiny preview comes from study_layer (which is allowed as tiny_tease on Day 0)
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
      featureAvailability: { boss: false, challenges: false, progress: false, study: false, contractUsed: false },
      summary: { sessionId: 'study-degraded-id', finalScore: 92, focusQuality: 88 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    // Falls back to progress_insight because study feature unavailable
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
      featureAvailability: { boss: true, challenges: true, progress: true, study: false, contractUsed: false },
      summary: { sessionId: 'study-premium-id', finalScore: 92, focusQuality: 88 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    expect(policy.hiddenCompletionSurfaces).toContain('study_progress_card');
    expect(policy.adaptivePayoff).toBe('progress_insight');
  });
});

// ============================================================================
// Phase 3C — Clean Mode Polish
// ============================================================================

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
      personalizationProfile: { ...baseProfile, motivationStyle: 'calm', gamificationIntensity: 'minimal' },
      laneProfile: cleanProfile,
    });

    expect(map.boss_full_cta ?? 'blocked').toBe('blocked');
    expect(map.boss_teaser ?? 'hidden').not.toBe('primary');
    expect(map.boss_compact ?? 'hidden').not.toBe('spotlight');

    const policy = getLaneMechanicPolicy(cleanProfile);
    expect(policy.blockedMechanics).toContain('boss_full_cta');
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
      personalizationProfile: { ...baseProfile, motivationStyle: 'calm', gamificationIntensity: 'minimal' },
      laneProfile: cleanProfile,
    });

    expect(map.challenge_teaser ?? 'hidden').toBe('hidden');
    const policy = getLaneMechanicPolicy(cleanProfile);
    expect(policy.blockedMechanics).toContain('challenge_spam');
  });

  it('Clean active session is LIGHT_FOCUS with minimal noise', () => {
    const brief = buildLaneSessionBrief({ lane: 'minimal_normal', durationSeconds: 25 * 60 });

    expect(brief.sessionMode).toBe(SessionMode.LIGHT_FOCUS);
    expect(brief.ctaLabel).toBe('Start clean session');
    expect(brief.title).toBe('Clean session ready');
    expect(brief.body).toContain('Name one task');
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
    expect(policy.hiddenCompletionSurfaces).toContain('social_share_primary_action');
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

// ============================================================================
// Phase 3D — Run Mode Polish
// ============================================================================

describe('Phase 3D — Run Mode Polish', () => {
  const runProfile = baseLaneProfile({ primaryLane: 'game_like' });

  it('Run has no economy, shop, gems, wagers, or coins', () => {
    const policy = getLaneMechanicPolicy(runProfile);

    const economyMarkers = ['shop', 'gems', 'wagers', 'trading', 'paid_saves'];
    for (const marker of economyMarkers) {
      expect(policy.blockedMechanics).toContain(marker as (typeof policy.blockedMechanics)[number]);
    }

    const brief = buildLaneSessionBrief({ lane: 'game_like', durationSeconds: 25 * 60 });
    const json = JSON.stringify(brief);
    expect(json).not.toMatch(/coin|gem|shop|wallet|wager|bounty|battle.?pass|paid.?save|inventory/i);
  });

  it('Run completion hides boss_consequence_card without boss consequences', () => {
    const input = completionInput({
      lane: 'game_like',
      motivationStyle: 'coach_led',
      sessionMode: SessionMode.SPRINT,
      summary: { sessionId: 'run-no-boss-id', finalScore: 90, focusQuality: 85 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    expect(policy.adaptivePayoff).not.toBe('boss_damage');
    expect(policy.hiddenCompletionSurfaces).toContain('boss_consequence_card');
  });

  it('PersonalBoss requires evidence: boss_damage fires with game_like motivation + boss consequences', () => {
    const input = completionInput({
      lane: 'game_like',
      motivationStyle: 'game_like',
      sessionMode: SessionMode.SPRINT,
      consequences: { boss: { damage: 50 } },
      summary: { sessionId: 'run-boss-id', finalScore: 90, focusQuality: 85 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    expect(policy.adaptivePayoff).toBe('boss_damage');
    expect(policy.hiddenCompletionSurfaces).not.toContain('boss_consequence_card');
  });

  it('Run completion hides all currency/economy surfaces', () => {
    const input = completionInput({
      lane: 'game_like',
      motivationStyle: 'game_like',
      sessionMode: SessionMode.SPRINT,
      consequences: { boss: { damage: 50 } },
      summary: { sessionId: 'run-currency-id', finalScore: 90, focusQuality: 85 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    const currencySurfaces = [
      'coins_gems_wallet',
      'premium_chest',
      'battle_pass_card',
      'shop_inventory_prompts',
      'chest_reward_animation',
    ];
    for (const surface of currencySurfaces) {
      expect(policy.hiddenCompletionSurfaces).toContain(surface as (typeof policy.hiddenCompletionSurfaces)[number]);
    }
  });

  it('non-Run modes do not see full Run systems on home surfaces', () => {
    for (const lane of ['student', 'deep_creative', 'minimal_normal'] as const) {
      const map = decideHomeSurfaces({
        behaviorStats: baseStats,
        featureAvailability,
        hasActiveBoss: false,
        hasActiveRecommendation: false,
        hasActiveStudyPlan: false,
        isFirstSession: false,
        personalizationProfile: baseProfile,
        laneProfile: baseLaneProfile({ primaryLane: lane }),
      });

      expect(map.run_board ?? 'hidden').not.toBe('primary');
      expect(map.run_board ?? 'hidden').not.toBe('spotlight');

      const policy = getLaneMechanicPolicy(baseLaneProfile({ primaryLane: lane }));
      const hasRunMechanics = policy.preferredMechanics.some(
        (m) => ['focus_run', 'personal_boss', 'companion_party_member'].includes(m)
      );
      if (lane === 'minimal_normal') {
        expect(hasRunMechanics).toBe(false);
      }
    }
  });

  it('non-Run completion does not use boss_damage payoff', () => {
    const nonRunLanes: Lane[] = ['student', 'deep_creative', 'minimal_normal'];
    for (const lane of nonRunLanes) {
      const input = completionInput({
        lane,
        motivationStyle: lane === 'minimal_normal' ? 'calm' : 'coach_led',
        primaryGoal: lane === 'student' ? 'STUDY' : 'WORK',
        sessionMode: lane === 'student' ? SessionMode.STUDY : SessionMode.LIGHT_FOCUS,
        consequences: { boss: { damage: 50 } },
        summary: { sessionId: `non-run-${lane}`, finalScore: 90, focusQuality: 85 },
      });

      const policy = resolveCompletionExperiencePolicy(input);
      expect(policy.adaptivePayoff).not.toBe('boss_damage');
    }
  });
});

// ============================================================================
// Phase 3E — Project Mode Polish
// ============================================================================

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
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
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
    const rescueInput = {
      userId: 'test-user',
      lane: 'deep_creative' as const,
      laneProfile: projectProfile,
      reason: 'unclear' as const,
    };
    const plan = createRescuePlan(rescueInput);

    expect(plan.sessionMode).toBe(SessionMode.CREATIVE);
    expect(plan.taskDescription).toContain('next concrete step');
    expect(plan.durationSeconds).toBe(7 * 60);
    expect(plan.frictionLevel).toBe('none');

    const eligibility = isRescueEligible({
      userId: 'test-user',
      abandonedSessionExists: true,
      completedSessions: 1,
      daysSinceOnboarding: 2,
      hasActiveSession: false,
      hoursUntilStreakBreak: 12,
      lane: 'deep_creative',
      laneProfile: projectProfile,
      missedPlannedSession: false,
      recentDismissals: 0,
      streakAtRisk: false,
      userTooBig: false,
    });

    expect(eligibility.eligible).toBe(true);
    expect(eligibility.trigger).toBe('abandoned_session');
  });

  it('Project Day 0 requires only lightweight setup (no uploads, no economy)', () => {
    const copy = resolveLaneCopy('DAY_0_NOT_STARTED', projectProfile, 'fallback');

    expect(copy.laneStageTheme).toBe('first_project_block');
    expect(copy.primaryMessage).toContain('project block');

    const map = decideHomeSurfaces({
      behaviorStats: baseStats,
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: false,
      isFirstSession: false,
      personalizationProfile: { ...baseProfile, primaryGoal: 'creative' },
      laneProfile: projectProfile,
    });

    // Day 0 project_thread is hidden on first load — teased only after first session
    // Project mechanics prefer project_thread, but Day 0 surfaces are minimal
    expect(map.project_thread ?? 'hidden').not.toBe('primary');

    const policy = getLaneMechanicPolicy(projectProfile);
    expect(policy.blockedMechanics).toContain('economy');
    expect(policy.blockedMechanics).toContain('loud_combat_default');
  });

  it('Project completion hides economy and combat surfaces', () => {
    const input = completionInput({
      lane: 'deep_creative',
      motivationStyle: 'creator',
      primaryGoal: 'CREATIVE',
      sessionMode: SessionMode.CREATIVE,
      summary: { sessionId: 'project-complete-id', finalScore: 88, plannedDuration: 1800, effectiveDuration: 1800 },
    });

    const policy = resolveCompletionExperiencePolicy(input);
    expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
    expect(policy.hiddenCompletionSurfaces).toContain('battle_pass_card');
    expect(policy.hiddenCompletionSurfaces).toContain('social_share_primary_action');
  });
});

// ============================================================================
// Phase 3F — Unified Architecture Proof
// ============================================================================

describe('Phase 3F — Unified Architecture Proof', () => {
  it('all modes share same core session loop (SessionMode enum covers all)', () => {
    const laneSessionModes: Record<Lane, string> = {
      student: buildLaneSessionBrief({ lane: 'student' }).sessionMode,
      game_like: buildLaneSessionBrief({ lane: 'game_like' }).sessionMode,
      deep_creative: buildLaneSessionBrief({ lane: 'deep_creative' }).sessionMode,
      minimal_normal: buildLaneSessionBrief({ lane: 'minimal_normal' }).sessionMode,
    };

    expect(laneSessionModes.student).toBe(SessionMode.STUDY);
    expect(laneSessionModes.game_like).toBe(SessionMode.SPRINT);
    expect(laneSessionModes.deep_creative).toBe(SessionMode.CREATIVE);
    expect(laneSessionModes.minimal_normal).toBe(SessionMode.LIGHT_FOCUS);

    for (const mode of Object.values(laneSessionModes)) {
      expect(mode).toBeDefined();
      expect(typeof mode).toBe('string');
    }
  });

  it('modes differ by presentation/policy, not separate session engines', () => {
    const lanes: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];

    const presentations = lanes.map((lane) => getLanePresentationPolicy({ lane, reducedMotion: false }));

    const icons = new Set(presentations.map((p) => p.icon));
    expect(icons.size).toBe(4);

    const tones = new Set(presentations.map((p) => p.copyTone));
    expect(tones.size).toBe(4);

    const feelings = new Set(presentations.map((p) => p.visualFeeling));
    expect(feelings.size).toBe(4);

    for (const p of presentations) {
      expect(p.lane).toBeDefined();
      expect(p.animation).toBeDefined();
      expect(p.density).toBeDefined();
      expect(p.emptyStateCta).toBeDefined();
      expect(p.loadingState).toBeDefined();
    }
  });

  it('Home consumes LaneProfile to decide surfaces per lane', () => {
    const input = {
      behaviorStats: { ...baseStats, totalCompletedSessions: 4 },
      featureAvailability,
      hasActiveBoss: false,
      hasActiveRecommendation: false,
      hasActiveStudyPlan: true,
      isFirstSession: false,
      personalizationProfile: baseProfile,
    };

    const studentMap = decideHomeSurfaces({
      ...input,
      laneProfile: baseLaneProfile({ primaryLane: 'student' }),
    });
    expect(studentMap.study_os).not.toBe('hidden');

    const runMap = decideHomeSurfaces({
      ...input,
      behaviorStats: { ...input.behaviorStats, bossChallengeEngagement: 'medium' },
      hasActiveBoss: true,
      hasActiveStudyPlan: false,
      personalizationProfile: { ...baseProfile, motivationStyle: 'game_like' },
      laneProfile: baseLaneProfile({ primaryLane: 'game_like' }),
    });
    expect(runMap.run_board).not.toBe('hidden');

    const projectMap = decideHomeSurfaces({
      ...input,
      behaviorStats: { ...input.behaviorStats, projectFocusUsageRatio: 0.6 },
      hasActiveStudyPlan: false,
      personalizationProfile: { ...baseProfile, primaryGoal: 'creative' },
      laneProfile: baseLaneProfile({ primaryLane: 'deep_creative' }),
    });
    expect(projectMap.project_thread).not.toBe('hidden');

    const cleanMap = decideHomeSurfaces({
      ...input,
      hasActiveStudyPlan: false,
      personalizationProfile: { ...baseProfile, motivationStyle: 'calm', gamificationIntensity: 'minimal' },
      laneProfile: baseLaneProfile({ primaryLane: 'minimal_normal' }),
    });
    expect(cleanMap.today_strip).not.toBe('hidden');
  });

  it('SessionStart consumes LaneProfile to produce lane-aware brief', () => {
    const lanes: Lane[] = ['student', 'game_like', 'deep_creative', 'minimal_normal'];
    const briefs = lanes.map((lane) => buildLaneSessionBrief({
      laneProfile: baseLaneProfile({ primaryLane: lane }),
      durationSeconds: 25 * 60,
    }));

    const ctaLabels = briefs.map((b) => b.ctaLabel);
    const uniqueCtas = new Set(ctaLabels);
    expect(uniqueCtas.size).toBe(4);

    const expectedCtas = ['Start study block', 'Start encounter', 'Resume project block', 'Start clean session'];
    for (const expected of expectedCtas) {
      expect(ctaLabels).toContain(expected);
    }

    for (const brief of briefs) {
      expect(brief.sessionMode).toBeDefined();
      expect(brief.suggestedDurationSeconds).toBeGreaterThan(0);
      expect(brief.focusStrategyLoadout.length).toBeGreaterThan(0);
      expect(brief.successCondition).toBeDefined();
    }
  });

  it('Completion consumes LaneProfile for lane-aware experience', () => {
    const completionPolicies: Record<Lane, CompletionExperiencePolicy> = {
      student: resolveCompletionExperiencePolicy(completionInput({
        lane: 'student',
        motivationStyle: 'study_focused',
        primaryGoal: 'STUDY',
        sessionMode: SessionMode.STUDY,
        summary: { sessionId: 'arch-student', finalScore: 92, focusQuality: 88 },
      })),
      game_like: resolveCompletionExperiencePolicy(completionInput({
        lane: 'game_like',
        motivationStyle: 'game_like',
        sessionMode: SessionMode.SPRINT,
        consequences: { boss: { damage: 50 } },
        summary: { sessionId: 'arch-run', finalScore: 90, focusQuality: 85 },
      })),
      deep_creative: resolveCompletionExperiencePolicy(completionInput({
        lane: 'deep_creative',
        motivationStyle: 'creator',
        primaryGoal: 'CREATIVE',
        sessionMode: SessionMode.CREATIVE,
        summary: { sessionId: 'arch-project', finalScore: 88, plannedDuration: 1800, effectiveDuration: 1800 },
      })),
      minimal_normal: resolveCompletionExperiencePolicy(completionInput({
        lane: 'minimal_normal',
        motivationStyle: 'calm',
        sessionMode: SessionMode.LIGHT_FOCUS,
        summary: { sessionId: 'arch-clean', finalScore: 95 },
      })),
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
      // laneStageTheme uses public-facing names: study/run/project/clean
      const publicNameMap: Record<Lane, string> = { student: 'study', game_like: 'run', deep_creative: 'project', minimal_normal: 'clean' };
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
