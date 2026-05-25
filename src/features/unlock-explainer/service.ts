import { LaneFitSchema, UnlockDecisionSchema, UnlockExplainerInputSchema } from './schemas';
import type { UnlockDecision, UnlockExplainerInput } from './types';

const NEVER_UNLOCK: ReadonlySet<string> = new Set([
  'shop',
  'inventory',
  'wagers',
  'battle_pass',
  'premium_currency',
  'streak_insurance',
  'gems_prominent',
  'economy_advanced',
  'economy_basic',
]);

const LANE_FEATURE_FIT: Record<string, Record<string, 'strong' | 'medium' | 'weak' | 'blocked'>> = {
  study_os: {
    student: 'strong',
    deep_creative: 'medium',
    game_like: 'weak',
    minimal_normal: 'weak',
  },
  run_board: {
    game_like: 'strong',
    student: 'weak',
    deep_creative: 'weak',
    minimal_normal: 'blocked',
  },
  project_thread: {
    deep_creative: 'strong',
    student: 'medium',
    game_like: 'weak',
    minimal_normal: 'weak',
  },
  today_strip: {
    minimal_normal: 'strong',
    deep_creative: 'medium',
    student: 'medium',
    game_like: 'weak',
  },
  boss_tab: {
    game_like: 'strong',
    student: 'weak',
    deep_creative: 'weak',
    minimal_normal: 'blocked',
  },
  rescue_cta: {
    student: 'strong',
    deep_creative: 'strong',
    game_like: 'medium',
    minimal_normal: 'medium',
  },
};

function resolveLaneFit(featureKey: string, lane?: string): 'strong' | 'medium' | 'weak' | 'blocked' {
  const map = LANE_FEATURE_FIT[featureKey];
  if (!map) return 'medium';
  if (!lane) return 'weak';
  return (map[lane] as 'strong' | 'medium' | 'weak' | 'blocked') ?? 'medium';
}

export function createUnlockDecision(rawInput: UnlockExplainerInput): UnlockDecision {
  const input = UnlockExplainerInputSchema.parse(rawInput);
  const now = Date.now();

  if (NEVER_UNLOCK.has(input.featureKey)) {
    return UnlockDecisionSchema.parse({
      featureKey: input.featureKey,
      decision: 'hidden',
      reasonCode: 'final_release_deactivated',
      userFacingReason: 'This feature is not available in the current version.',
      evidence: [],
      laneFit: LaneFitSchema.options[3],
      canHide: false,
      canReconsiderAtSessionCount: null,
    });
  }

  if (input.manualOverride) {
    return UnlockDecisionSchema.parse({
      featureKey: input.featureKey,
      decision: input.manualOverride,
      reasonCode: 'manual_override',
      userFacingReason: 'You chose this setting.',
      evidence: [{ source: 'manual_override', detail: input.manualOverride, observedAt: now }],
      laneFit: resolveLaneFit(input.featureKey, input.laneProfile),
      canHide: input.manualOverride !== 'hidden',
      canReconsiderAtSessionCount: null,
    });
  }

  if (input.sessionCount === 0) {
    const laneFit = resolveLaneFit(input.featureKey, input.laneProfile);
    if (laneFit === 'blocked') {
      return UnlockDecisionSchema.parse({
        featureKey: input.featureKey,
        decision: 'blocked',
        reasonCode: 'lane_blocked',
        userFacingReason: 'Not available for your current experience style.',
        evidence: [
          { source: 'lane_profile', detail: `lane:${input.laneProfile ?? 'unknown'}`, observedAt: now },
        ],
        laneFit: 'blocked',
        canHide: false,
        canReconsiderAtSessionCount: input.sessionCount + 3,
      });
    }
    const isCoreFeature = ['focus_session', 'home_tab', 'profile_tab', 'focus_tab'].includes(input.featureKey);
    return UnlockDecisionSchema.parse({
      featureKey: input.featureKey,
      decision: isCoreFeature ? 'unlocked' : 'teased',
      reasonCode: isCoreFeature ? 'day_zero_core' : 'day_zero_tease',
      userFacingReason: isCoreFeature
        ? 'Available from your first session.'
        : 'Available after your first session.',
      evidence: [{ source: 'cold_start', detail: `sessionCount:${input.sessionCount}`, observedAt: now }],
      laneFit,
      canHide: !isCoreFeature,
      canReconsiderAtSessionCount: isCoreFeature ? null : 1,
    });
  }

  const laneFit = resolveLaneFit(input.featureKey, input.laneProfile);

  if (laneFit === 'blocked') {
    return UnlockDecisionSchema.parse({
      featureKey: input.featureKey,
      decision: 'blocked',
      reasonCode: 'lane_blocked',
      userFacingReason: `Not available for your current experience style. You can change this in settings.`,
      evidence: [
        { source: 'lane_profile', detail: `lane:${input.laneProfile ?? 'unknown'}`, observedAt: now },
      ],
      laneFit: 'blocked',
      canHide: false,
      canReconsiderAtSessionCount: input.sessionCount + 3,
    });
  }

  const minSessions = laneFit === 'strong' ? 1 : laneFit === 'medium' ? 3 : 5;
  const isUnlocked = input.sessionCount >= minSessions;

  return UnlockDecisionSchema.parse({
    featureKey: input.featureKey,
    decision: isUnlocked ? 'unlocked' : 'teased',
    reasonCode: isUnlocked
      ? `unlocked_after_${minSessions}_sessions`
      : `teased_before_${minSessions}_sessions`,
    userFacingReason: isUnlocked
      ? `Unlocked because of your progress.`
      : `Available after ${minSessions} completed sessions.`,
    evidence: [
      { source: 'session_count', detail: `sessions:${input.sessionCount}`, observedAt: now },
      { source: 'lane_profile', detail: `lane:${input.laneProfile ?? 'unknown'}`, observedAt: now },
    ],
    laneFit,
    canHide: input.sessionCount >= minSessions,
    canReconsiderAtSessionCount: isUnlocked ? null : minSessions,
  });
}

export function getUnlockExplainerCopy(decision: UnlockDecision): {
  body: string;
  cta: string | null;
  title: string;
} {
  const base = {
    body: decision.userFacingReason,
    cta: decision.canHide ? 'Got it' : null,
    title: decision.decision === 'unlocked'
      ? `${decision.featureKey} unlocked`
      : decision.decision === 'teased'
        ? `${decision.featureKey} coming soon`
        : decision.decision === 'blocked'
          ? `${decision.featureKey} unavailable`
          : '',
  };
  return base;
}

export function isFeatureVisible(decision: UnlockDecision): boolean {
  return decision.decision !== 'hidden';
}
