import {
  FirstWeekExperienceSchema,
  FirstWeekInputSchema,
  type FirstWeekExperience,
  type FirstWeekResolverInput,
  type FirstWeekStage,
} from './first-week-schemas';

const PUBLIC_V1_HIDDEN: FirstWeekExperience['hiddenSurfaces'] = [
  'boss_full',
  'shop',
  'inventory',
  'battle_pass',
  'wagers',
  'rivals',
  'squads',
  'leaderboards',
  'premium_currency',
  'premium_hard_sell',
  'advanced_economy',
];

function resolveStage(input: FirstWeekResolverInput): FirstWeekStage {
  if (input.completedSessions === 0) return 'DAY_0_NOT_STARTED';
  if (input.completedSessions === 1) return 'DAY_1_RETURN';
  if (input.completedSessions === 2) return 'DAY_2_PROGRESS_PROOF';
  if (input.completedSessions < 5) return 'DAY_3_COMPANION_CONNECTION';
  if (input.completedSessions < 7) return 'DAY_5_PATH_FORMING';
  if (input.completedSessions === 7) return 'DAY_7_DEEPER_MODE';
  return 'POST_DAY_7';
}

function resolveStudyLabel(goal: FirstWeekResolverInput['primaryGoal']): FirstWeekExperience['studyLayerLabel'] {
  switch (goal) {
    case 'study': return 'Study OS';
    case 'learning': return 'Learning OS';
    case 'creative': return 'Project Focus Path';
    case 'personal':
    case 'personal_growth': return 'Growth Path';
    default: return 'Deep Work Plan';
  }
}

function resolveComeback(days: number | null): FirstWeekExperience['comebackState'] {
  if (days === null || days <= 1) return 'none';
  if (days === 2) return 'missed_1_day';
  if (days <= 4) return 'missed_2_3_days';
  if (days <= 10) return 'missed_week';
  return 'returning_after_long_gap';
}

function resolveComebackMessage(style: FirstWeekResolverInput['motivationStyle']): string {
  if (style === 'study_focused') return 'Do one review block before adding new material.';
  if (style === 'game_like') return 'The run is not over. One clean block puts it back in motion.';
  if (style === 'intense') return 'Reset with one contained block.';
  if (style === 'coach_led') return 'Reset the rhythm. Twenty minutes is enough.';
  return 'You are not behind. Start with one clean session.';
}

function resolveSurfaces(
  stage: FirstWeekStage,
  input: FirstWeekResolverInput,
  comeback: FirstWeekExperience['comebackState'],
): FirstWeekExperience['allowedHomeSurfaces'] {
  if (comeback !== 'none') {
    return ['coach_presence_line', 'recovery_cta', 'start_session'];
  }
  if (stage === 'DAY_0_NOT_STARTED') {
    const base: FirstWeekExperience['allowedHomeSurfaces'] = [
      'motivation_confirmation',
      'coach_presence_line',
      'start_session',
      'tiny_unlock_preview',
    ];
    if (
      input.featureAvailability.boss &&
      (input.motivationStyle === 'game_like' || input.motivationStyle === 'intense')
    ) {
      base.push('tiny_boss_teaser');
    }
    return base;
  }
  if (stage === 'DAY_5_PATH_FORMING' || stage === 'DAY_7_DEEPER_MODE' || stage === 'POST_DAY_7') {
    return [
      'coach_presence_line',
      'start_session',
      'progress_proof',
      'companion_continuity',
      'study_deep_work_path',
    ];
  }
  return ['coach_presence_line', 'start_session', 'progress_proof', 'companion_continuity'];
}

function resolvePremiumMoment(input: FirstWeekResolverInput, stage: FirstWeekStage): FirstWeekExperience['premiumMoment'] {
  if (!input.featureAvailability.premium || input.premiumState !== 'configured') return 'none';
  if (stage === 'DAY_7_DEEPER_MODE' || stage === 'POST_DAY_7') return 'weekly_value';
  if (stage === 'DAY_5_PATH_FORMING') return 'soft_tease';
  return 'none';
}

export function resolveFirstWeekExperience(rawInput: FirstWeekResolverInput): FirstWeekExperience {
  const input = FirstWeekInputSchema.parse(rawInput);
  const currentDayStage = resolveStage(input);
  const comebackState = resolveComeback(input.daysSinceLastSession);
  const allowedHomeSurfaces = resolveSurfaces(currentDayStage, input, comebackState);
  const isGameUser = input.motivationStyle === 'game_like' || input.motivationStyle === 'intense';
  const studyLayerLabel = resolveStudyLabel(input.primaryGoal);
  const premiumMoment = resolvePremiumMoment(input, currentDayStage);
  const bossIntensity = allowedHomeSurfaces.includes('tiny_boss_teaser')
    ? 'tiny_tease'
    : input.completedSessions > 0 && input.featureAvailability.boss && isGameUser
      ? 'visible'
      : input.completedSessions > 0 && input.featureAvailability.boss
        ? 'subtle'
        : 'hidden';

  return FirstWeekExperienceSchema.parse({
    allowedHomeSurfaces,
    bossIntensity,
    coachMessageType: comebackState !== 'none' ? 'comeback' : currentDayStage.toLowerCase(),
    comebackState,
    completionEmphasis: 'confirmation_coach_progress_next_action',
    currentDayStage,
    hiddenSurfaces: PUBLIC_V1_HIDDEN,
    notificationAllowedTypes: ['gentle_return', 'coach_check_in', 'progress_milestone'],
    premiumMoment,
    primaryCTA: {
      intent: input.primaryGoal === 'study' || input.primaryGoal === 'learning'
        ? 'CONTINUE_STUDY_PATH'
        : 'START_SESSION',
      label: input.completedSessions === 0 ? 'Start first session' : 'Start next session',
    },
    primaryMessage: comebackState !== 'none'
      ? resolveComebackMessage(input.motivationStyle)
      : input.completedSessions === 0
        ? 'VEX is shaped around one clean first block.'
        : 'Your rhythm is forming. Start the next clean block.',
    secondaryCTA: input.completedSessions >= 2
      ? { intent: 'OPEN_PROGRESS', label: 'Review progress' }
      : null,
    spotlightSurface: allowedHomeSurfaces.includes('tiny_boss_teaser')
      ? 'tiny_boss_teaser'
      : currentDayStage === 'DAY_7_DEEPER_MODE'
        ? 'weekly_insight'
        : currentDayStage === 'DAY_5_PATH_FORMING'
          ? 'study_deep_work_path'
          : input.completedSessions > 0
            ? 'progress_proof'
            : 'none',
    studyLayerLabel,
    unlockTease: input.completedSessions === 0
      ? 'VEX opens one layer at a time after real sessions.'
      : null,
  });
}
