import type {
  BehaviorStats,
  CompletionStep,
  FeatureAvailabilitySnapshot,
  HomeSection,
  VexExperience,
  VexPersonalizationProfile,
} from './schemas';

const DISABLED_RPG_SYSTEMS: VexExperience['boss']['systemsDisabled'] = [
  'shop',
  'inventory',
  'premium_currency',
  'battle_pass',
  'wagers',
  'rivals',
  'squads',
  'leaderboards',
  'advanced_economy',
];

const FREE_EXECUTION_LOOP = [
  'start_session',
  'complete_session',
  'basic_xp',
  'basic_streak',
  'basic_progress',
  'basic_coach',
];

export function resolveCoachMode(
  profile: VexPersonalizationProfile,
): VexPersonalizationProfile['coachMode'] {
  if (profile.coachMode) return profile.coachMode;
  switch (profile.motivationStyle) {
    case 'game_like': return 'game_guide';
    case 'intense': return 'tactical';
    case 'study_focused': return 'study_tutor';
    case 'coach_led': return 'mentor';
    case 'calm': return 'reflection';
    default: return 'mentor';
  }
}

export function resolveCompanionIntensity(
  profile: VexPersonalizationProfile,
): VexExperience['companionIntensity'] {
  switch (profile.motivationStyle) {
    case 'calm': return 'subtle';
    case 'friendly': return 'present';
    case 'coach_led':
    case 'study_focused': return 'active';
    default: return 'present';
  }
}

export function resolveHomeLayoutVariant(
  profile: VexPersonalizationProfile,
  stats: BehaviorStats,
): VexExperience['homeLayoutVariant'] {
  if (stats.totalCompletedSessions === 0) return 'compact_starter';
  if (profile.primaryGoal === 'study' || profile.primaryGoal === 'learning') return 'study_centered';
  if (profile.motivationStyle === 'game_like' || profile.motivationStyle === 'intense') return 'game_centered';
  if (profile.motivationStyle === 'coach_led') return 'coach_first';
  if (stats.totalCompletedSessions >= 10) return 'full_expanded';
  return 'coach_first';
}

export function resolvePremiumMoment(stats: BehaviorStats): VexExperience['premiumMoment'] {
  if (stats.totalCompletedSessions < 5) return 'none';
  if (stats.premiumFeatureAttempts.includes('advanced_study')) return 'advanced_study';
  if (stats.premiumFeatureAttempts.includes('weekly_intelligence')) return 'weekly_intelligence';
  if (stats.premiumFeatureAttempts.includes('custom_identity')) return 'custom_identity';
  if (stats.studyUsageRatio >= 0.5) return 'advanced_study';
  return 'session_value';
}

export function resolveBossIntensity(
  profile: VexPersonalizationProfile,
  stats: BehaviorStats,
): VexExperience['boss']['intensity'] {
  if (profile.motivationStyle === 'game_like') return 'game-like';
  if (profile.motivationStyle === 'intense') return 'intense';
  if (profile.motivationStyle === 'calm' || profile.motivationStyle === 'study_focused') return 'subtle';
  if (stats.bossChallengeEngagement === 'high') return 'game-like';
  if (stats.bossChallengeEngagement === 'medium') return 'standard';
  return 'subtle';
}

export function resolveBoss(input: {
  availability: FeatureAvailabilitySnapshot;
  profile: VexPersonalizationProfile;
  stats: BehaviorStats;
}): VexExperience['boss'] {
  const intensity = resolveBossIntensity(input.profile, input.stats);
  const canShow = input.availability.boss && input.stats.totalCompletedSessions > 0;
  const gameLike = intensity === 'game-like' || intensity === 'intense';

  return {
    completionEffect: canShow && gameLike ? 'session_damage' : canShow ? 'smooth_pulse' : 'none',
    copy: gameLike
      ? 'Your focus sessions push the creature back, one block at a time.'
      : 'A quiet momentum marker reflects the focus you have already earned.',
    dayZeroTeaserAllowed: input.profile.motivationStyle === 'game_like' || input.profile.motivationStyle === 'intense',
    homePlacement: !canShow ? 'hidden' : gameLike ? 'compact_card' : 'top_tiny',
    intensity,
    isVisible: canShow,
    progressSource: canShow ? 'completed_focus_sessions' : 'none',
    systemsDisabled: DISABLED_RPG_SYSTEMS,
  };
}

export function resolveCompletion(input: {
  availability: FeatureAvailabilitySnapshot;
  boss: VexExperience['boss'];
  stats: BehaviorStats;
}): VexExperience['completion'] {
  const sequence: CompletionStep[] = ['core_saved', 'coach_companion_reflection', 'streak_progress'];
  if (input.availability.study && input.stats.studyUsageRatio >= 0.35) sequence.push('study_progress');
  if (input.boss.isVisible && input.boss.completionEffect === 'session_damage') sequence.push('boss_effect');
  sequence.push('quiet_xp', 'next_action');
  return {
    fallback: 'If any optional layer is unavailable, completion still saves and returns one next action.',
    sequence,
  };
}

export function resolveBehavior(profile: VexPersonalizationProfile, stats: BehaviorStats): {
  adaptations: string[];
  copy: string;
  duration: number;
  sessionSuggestion: string;
} {
  if (stats.completedSessionDurations.length < 3) {
    return {
      adaptations: ['needs_more_signal'],
      copy: 'VEX is learning your rhythm. Start with the default.',
      duration: profile.defaultSessionDuration,
      sessionSuggestion: 'Start with one clean block and let VEX adjust around you.',
    };
  }
  const durationCounts = new Map<number, number>();
  stats.completedSessionDurations.forEach((d) => durationCounts.set(d, (durationCounts.get(d) ?? 0) + 1));
  const best = Array.from(durationCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  const adaptations: string[] = ['duration_pattern'];
  if (stats.mostSuccessfulTimeOfDay) adaptations.push('time_of_day_pattern');
  if (stats.abandonedSessionDurations.length > 0) adaptations.push('abandonment_aware');
  if (stats.comebackSessions > 0) adaptations.push('comeback_adaptive');
  if (stats.coachInteractions >= 3) adaptations.push('coach_responsive');
  if (stats.studyUsageRatio >= 0.5) adaptations.push('study_heavy');
  if (stats.ignoredFeatures.includes('boss_tab')) adaptations.push('boss_ignored');
  return {
    adaptations,
    copy: 'Want to repeat your best rhythm?',
    duration: best?.[0] ?? profile.defaultSessionDuration,
    sessionSuggestion: stats.mostSuccessfulTimeOfDay
      ? `Your best sessions happen around ${stats.mostSuccessfulTimeOfDay}. Ready for another?`
      : 'Start with one clean block.',
  };
}

export function resolveHome(input: {
  boss: VexExperience['boss'];
  profile: VexPersonalizationProfile;
  stats: BehaviorStats;
}): VexExperience['home'] {
  const sections: HomeSection[] = ['coach_line', 'primary_session'];
  if (input.stats.totalCompletedSessions > 0) sections.push('progress_signal', 'companion_thread');
  const study = input.profile.primaryGoal === 'study' || input.profile.primaryGoal === 'learning' || input.stats.studyUsageRatio >= 0.35;
  if (study) sections.push('study_layer');
  if (input.boss.isVisible) sections.push(input.boss.intensity === 'subtle' ? 'boss_teaser' : 'boss_compact');
  if (input.stats.totalCompletedSessions >= 5) sections.push('premium_tease');
  const coachCopy = input.profile.preferredTone === 'direct'
    ? 'Start the block. Keep the target clean.'
    : input.profile.preferredTone === 'warm'
      ? 'One clean block, together. Ready?'
      : 'Start with one clean block and let VEX adjust around you.';
  return { coachCopy, sections, studyName: input.profile.studyLayerName };
}

export function resolvePremium(
  availability: FeatureAvailabilitySnapshot,
  stats: BehaviorStats,
): VexExperience['premium'] {
  const attempted = stats.premiumFeatureAttempts;
  const shouldTease = availability.premium && stats.totalCompletedSessions >= 5 && attempted.length > 0;
  return {
    copy: shouldTease
      ? 'Unlock deeper personalization and let VEX learn your patterns.'
      : 'Premium appears after VEX has shown real personal value.',
    mustRemainFree: FREE_EXECUTION_LOOP,
    shouldTease,
    trigger: attempted.includes('advanced_study') ? 'advanced_study'
      : attempted.includes('weekly_intelligence') ? 'weekly_intelligence'
        : attempted.includes('custom_identity') ? 'custom_identity'
          : shouldTease ? 'session_value' : 'none',
  };
}
