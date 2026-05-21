import {
  BehaviorStatsSchema,
  FeatureAvailabilitySnapshotSchema,
  VexExperienceSchema,
  VexPersonalizationProfileSchema,
  type BehaviorStats,
  type BossIntensity,
  type CompletionStep,
  type FeatureAvailabilitySnapshot,
  type HomeSection,
  type VexExperience,
  type VexPersonalizationProfile,
  type VexSystemToDisable,
} from './schemas';

const DISABLED_RPG_SYSTEMS: VexSystemToDisable[] = [
  'shop', 'inventory', 'premium_currency', 'battle_pass', 'wagers',
  'rivals', 'squads', 'leaderboards', 'advanced_economy',
];

const FREE_EXECUTION_LOOP = [
  'start_session', 'complete_session', 'basic_xp',
  'basic_streak', 'basic_progress', 'basic_coach',
];

function resolveBossIntensity(profile: VexPersonalizationProfile): BossIntensity {
  if (profile.motivationStyle === 'game_like') return 'game-like';
  if (profile.motivationStyle === 'intense') return 'intense';
  if (profile.motivationStyle === 'calm' || profile.motivationStyle === 'student') {
    return 'subtle';
  }
  return profile.gamificationIntensity === 'intense' ? 'standard' : profile.gamificationIntensity;
}

function resolveBoss(input: {
  availability: FeatureAvailabilitySnapshot;
  profile: VexPersonalizationProfile;
  stats: BehaviorStats;
}): VexExperience['boss'] {
  const intensity = resolveBossIntensity(input.profile);
  const hasSessionSignal = input.stats.totalCompletedSessions > 0;
  const canShow = input.availability.boss && hasSessionSignal;
  const gameLike = intensity === 'game-like' || intensity === 'intense';

  return {
    completionEffect: canShow && gameLike ? 'session_damage' : canShow ? 'smooth_pulse' : 'none',
    copy: gameLike
      ? 'Your focus sessions push the creature back, one block at a time.'
      : 'A quiet momentum marker reflects the focus you have already earned.',
    dayZeroTeaserAllowed: input.profile.motivationStyle === 'game_like',
    homePlacement: !canShow ? 'hidden' : gameLike ? 'compact_card' : 'top_tiny',
    intensity,
    isVisible: canShow,
    progressSource: canShow ? 'completed_focus_sessions' : 'none',
    systemsDisabled: DISABLED_RPG_SYSTEMS,
  };
}

function resolveCompletion(input: {
  availability: FeatureAvailabilitySnapshot;
  boss: VexExperience['boss'];
  stats: BehaviorStats;
}): VexExperience['completion'] {
  const sequence: CompletionStep[] = [
    'core_saved',
    'coach_companion_reflection',
    'streak_progress',
  ];

  if (input.availability.study && input.stats.studyUsageRatio >= 0.35) {
    sequence.push('study_progress');
  }
  if (input.boss.isVisible && input.boss.completionEffect === 'session_damage') {
    sequence.push('boss_effect');
  }
  sequence.push('quiet_xp', 'next_action');

  return {
    fallback: 'If any optional layer is unavailable, completion still saves and returns one next action.',
    sequence,
  };
}

function resolveBehavior(profile: VexPersonalizationProfile, stats: BehaviorStats): {
  adaptations: string[];
  copy: string;
  duration: number;
} {
  if (stats.completedSessionDurations.length < 3) {
    return {
      adaptations: ['needs_more_signal'],
      copy: 'Start with the default. VEX will adapt after a few real sessions.',
      duration: profile.defaultSessionDuration,
    };
  }

  const durationCounts = new Map<number, number>();
  stats.completedSessionDurations.forEach((duration) => {
    durationCounts.set(duration, (durationCounts.get(duration) ?? 0) + 1);
  });
  const best = Array.from(durationCounts.entries()).sort((a, b) => b[1] - a[1])[0];

  return {
    adaptations: ['duration_pattern', stats.mostSuccessfulTimeOfDay ? 'time_of_day_pattern' : 'soft_pattern'],
    copy: 'Want to repeat your best rhythm?',
    duration: best?.[0] ?? profile.defaultSessionDuration,
  };
}

function resolveHome(input: {
  boss: VexExperience['boss'];
  profile: VexPersonalizationProfile;
  stats: BehaviorStats;
}): VexExperience['home'] {
  const sections: HomeSection[] = ['coach_line', 'primary_session'];
  if (input.stats.totalCompletedSessions > 0) sections.push('progress_signal', 'companion_thread');
  if (input.profile.primaryGoal === 'STUDY' || input.stats.studyUsageRatio >= 0.35) {
    sections.push('study_layer');
  }
  if (input.boss.isVisible) sections.push('boss_compact');
  if (input.stats.totalCompletedSessions >= 5) sections.push('premium_tease');

  return {
    coachCopy: input.profile.preferredTone === 'direct'
      ? 'Start the block. Keep the target clean.'
      : 'Start with one clean block and let VEX adjust around you.',
    sections,
    studyName: input.profile.studyLayerName,
  };
}

function resolvePremium(
  availability: FeatureAvailabilitySnapshot,
  stats: BehaviorStats,
): VexExperience['premium'] {
  const attempted = stats.premiumFeatureAttempts;
  const highIntent = attempted.includes('advanced_study')
    || attempted.includes('weekly_intelligence')
    || attempted.includes('custom_identity');
  const shouldTease = availability.premium && stats.totalCompletedSessions >= 5 && highIntent;

  return {
    copy: shouldTease
      ? 'Unlock deeper personalization and let VEX learn your patterns.'
      : 'Premium appears after VEX has shown real personal value.',
    mustRemainFree: FREE_EXECUTION_LOOP,
    shouldTease,
    trigger: attempted.includes('advanced_study')
      ? 'advanced_study'
      : attempted.includes('weekly_intelligence')
        ? 'weekly_intelligence'
        : attempted.includes('custom_identity') ? 'custom_identity' : shouldTease ? 'session_value' : 'none',
  };
}

export function resolveVexExperience(
  userProfile: VexPersonalizationProfile,
  behaviorStats: BehaviorStats,
  featureAvailability: FeatureAvailabilitySnapshot,
): VexExperience {
  const profile = VexPersonalizationProfileSchema.parse(userProfile);
  const stats = BehaviorStatsSchema.parse(behaviorStats);
  const availability = FeatureAvailabilitySnapshotSchema.parse(featureAvailability);
  const boss = resolveBoss({ availability, profile, stats });
  const behavior = resolveBehavior(profile, stats);

  return VexExperienceSchema.parse({
    behaviorAdaptations: behavior.adaptations,
    boss,
    completion: resolveCompletion({ availability, boss, stats }),
    home: resolveHome({ boss, profile, stats }),
    premium: resolvePremium(availability, stats),
    release: {
      hidden: ['shop', 'inventory', 'battle_pass', 'wagers', 'rivals', 'squads', 'leaderboards'],
      included: ['motivation_onboarding', 'adaptive_home', 'start_session', 'completion_sequence', 'study_layer'],
      productionProof: ['real_device_first_session_qa', 'restart_persistence_qa', 'offline_slow_network_qa'],
      teasedOnly: ['deep_coach_memory', 'weekly_intelligence', 'visual_identity_depth'],
    },
    routeGates: {
      boss: {
        canNavigate: availability.boss && boss.isVisible && boss.intensity !== 'subtle',
        canQuery: availability.boss && stats.totalCompletedSessions > 0,
      },
      premium: { canNavigate: availability.premium, canQuery: availability.premium },
    },
    sessionDefaults: {
      copy: behavior.copy,
      duration: behavior.duration,
      mode: stats.preferredSessionMode ?? profile.defaultSessionMode,
    },
  });
}
