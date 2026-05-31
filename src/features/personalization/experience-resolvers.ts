import type {
  BehaviorStats,
  BossIntensity,
  CompletionStep,
  FeatureAvailabilitySnapshot,
  HomeLayoutVariant,
  VexExperience,
  VexPersonalizationProfile,
} from './schemas';

export function resolveUserStage(
  stats: BehaviorStats,
): VexExperience['userStage'] {
  if (stats.totalCompletedSessions === 0) {return 'new_user';}
  if (stats.totalCompletedSessions < 3) {return 'activating';}
  if (stats.totalCompletedSessions < 10) {return 'engaged';}
  return 'power_user';
}

export function resolveHiddenSystems(
  profile: VexPersonalizationProfile,
  stats: BehaviorStats,
): Pick<VexExperience, 'bannedSurfaces' | 'hiddenSystems' | 'teasedSystems'> {
  const hiddenSystems: VexExperience['hiddenSystems'] = [
    'shop',
    'inventory',
    'battle_pass',
    'wagers',
    'rivals',
    'squads',
    'leaderboards',
  ];
  const teasedSystems: string[] = [];
  const bannedSurfaces: string[] = [];

  if (
    profile.motivationStyle === 'calm' ||
    profile.motivationStyle === 'study_focused'
  ) {
    hiddenSystems.push('advanced_economy', 'premium_currency');
    bannedSurfaces.push('boss_full_cta', 'game_hub');
  }
  if (profile.gamificationIntensity === 'minimal') {
    hiddenSystems.push('premium_currency');
    bannedSurfaces.push('boss_combat_effects', 'critical_hit_animations');
  }
  if (
    stats.bossChallengeEngagement === 'none' &&
    stats.totalCompletedSessions > 5
  ) {
    teasedSystems.push('boss_tab');
  }
  return { bannedSurfaces, hiddenSystems, teasedSystems };
}

export function resolveCoachMode(profile: VexPersonalizationProfile): string {
  switch (profile.coachMode) {
    case 'mentor':
      return 'gentle_mentor';
    case 'tactical':
      return 'direct_tactical';
    case 'study_tutor':
      return 'study_guide';
    case 'reflection':
      return 'reflective_prompt';
    case 'game_guide':
      return 'game_companion';
    default:
      return 'gentle_mentor';
  }
}

export function resolveCompanionIntensity(
  profile: VexPersonalizationProfile,
): 'none' | 'subtle' | 'present' | 'active' {
  if (profile.gamificationIntensity === 'strong') {return 'active';}
  if (profile.gamificationIntensity === 'medium') {return 'present';}
  if (profile.motivationStyle === 'calm') {return 'subtle';}
  return 'present';
}

export function resolveHomeLayoutVariant(
  profile: VexPersonalizationProfile,
  stats: BehaviorStats,
): HomeLayoutVariant {
  if (profile.primaryGoal === 'study' || profile.primaryGoal === 'learning')
    {return 'study_centered';}
  if (profile.motivationStyle === 'game_like') {return 'game_centered';}
  if (stats.totalCompletedSessions >= 10) {return 'full_expanded';}
  if (stats.totalCompletedSessions >= 3) {return 'coach_first';}
  return 'compact_starter';
}

export function resolveBossIntensity(
  profile: VexPersonalizationProfile,
  stats: BehaviorStats,
): BossIntensity {
  if (stats.bossChallengeEngagement === 'none') {return 'subtle';}
  if (profile.motivationStyle === 'game_like') {return 'game-like';}
  if (profile.motivationStyle === 'intense') {return 'intense';}
  return 'standard';
}

export function resolveBoss(input: {
  availability: FeatureAvailabilitySnapshot;
  profile: VexPersonalizationProfile;
  stats: BehaviorStats;
}): VexExperience['boss'] {
  const isVisible =
    input.availability.boss &&
    input.stats.totalCompletedSessions >= 3 &&
    input.stats.bossChallengeEngagement !== 'none';
  const intensity = resolveBossIntensity(input.profile, input.stats);
  return {
    isVisible,
    intensity,
    copy: isVisible
      ? 'Your focus fuels the challenge.'
      : 'Boss unlocks after your rhythm forms.',
    completionEffect: isVisible ? 'session_damage' : 'none',
    dayZeroTeaserAllowed: false,
    homePlacement: isVisible
      ? intensity === 'subtle'
        ? 'top_tiny'
        : 'compact_card'
      : 'hidden',
    progressSource: isVisible ? 'completed_focus_sessions' : 'none',
    systemsDisabled: [],
  };
}

export function resolveCompletion(input: {
  availability: FeatureAvailabilitySnapshot;
  boss: VexExperience['boss'];
  stats: BehaviorStats;
}): VexExperience['completion'] {
  const sequence: CompletionStep[] = [
    'core_saved',
    'coach_companion_reflection',
    'streak_progress',
  ];
  if (input.availability.study) {sequence.push('study_progress');}
  if (input.boss.isVisible) {sequence.push('boss_effect');}
  sequence.push('quiet_xp', 'next_action');
  return {
    fallback: 'Session saved. Keep the momentum.',
    sequence,
  };
}

export function resolvePremiumMoment(
  stats: BehaviorStats,
): VexExperience['premiumMoment'] {
  if (stats.totalCompletedSessions < 5) {return 'none';}
  if (stats.premiumFeatureAttempts.includes('advanced_study'))
    {return 'advanced_study';}
  if (stats.premiumFeatureAttempts.includes('weekly_intelligence'))
    {return 'weekly_intelligence';}
  if (stats.premiumFeatureAttempts.includes('custom_identity'))
    {return 'custom_identity';}
  if (stats.totalCompletedSessions >= 10) {return 'session_value';}
  return 'none';
}
