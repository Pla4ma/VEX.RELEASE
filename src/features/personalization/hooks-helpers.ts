import {
  StudyLayerNameSchema,
  type VexPersonalizationProfile,
} from './schemas';

export function normalizeMotivationStyle(
  style: string | null,
): VexPersonalizationProfile['motivationStyle'] {
  switch (style) {
    case 'calm':
    case 'friendly':
    case 'coach_led':
    case 'game_like':
    case 'intense':
    case 'study_focused':
      return style;
    case 'worker':
      return 'coach_led';
    default:
      return 'calm';
  }
}

export function resolveTone(
  style: VexPersonalizationProfile['motivationStyle'],
): VexPersonalizationProfile['preferredTone'] {
  switch (style) {
    case 'intense':
      return 'direct';
    case 'coach_led':
      return 'strategic';
    case 'friendly':
      return 'warm';
    case 'game_like':
      return 'direct';
    case 'study_focused':
      return 'strategic';
    case 'calm':
    default:
      return 'soft';
  }
}

export function resolveStudyLayerName(
  goal: string | null,
  motivationStyle: VexPersonalizationProfile['motivationStyle'],
): string {
  if (goal === 'STUDY' || motivationStyle === 'study_focused') {
    return 'Study OS';
  }
  if (goal === 'WORK' || motivationStyle === 'intense') {
    return 'Deep Work Plan';
  }
  if (goal === 'CREATIVE') {
    return 'Project Focus Path';
  }
  if (goal === 'LEARNING') {
    return 'Learning OS';
  }
  if (goal === 'PERSONAL' || motivationStyle === 'calm') {
    return 'Growth Path';
  }
  if (motivationStyle === 'coach_led') {
    return 'Deep Work Plan';
  }
  if (motivationStyle === 'game_like') {
    return 'Deep Work Plan';
  }
  return 'Deep Work Plan';
}

export function buildProfileFromOnboarding(input: {
  duration: number | null;
  goal: string | null;
  style: VexPersonalizationProfile['motivationStyle'];
}): VexPersonalizationProfile {
  const isStudy = input.goal === 'STUDY';
  const isCreative = input.goal === 'CREATIVE';
  const isLearning = input.goal === 'LEARNING';
  const isPersonal = input.goal === 'PERSONAL';
  const primaryGoal = isStudy
    ? ('study' as const)
    : isCreative
      ? ('creative' as const)
      : isLearning
        ? ('learning' as const)
        : isPersonal
          ? ('personal' as const)
          : ('work' as const);

  return {
    primaryGoal,
    motivationStyle: input.style,
    preferredTone: resolveTone(input.style),
    gamificationIntensity:
      input.style === 'game_like' || input.style === 'intense'
        ? 'strong'
        : input.style === 'calm'
          ? 'minimal'
          : 'medium',
    coachMode:
      input.style === 'study_focused'
        ? 'study_tutor'
        : input.style === 'intense'
          ? 'tactical'
          : input.style === 'game_like'
            ? 'game_guide'
            : input.style === 'coach_led'
              ? 'mentor'
              : 'reflection',
    studyLayerName: StudyLayerNameSchema.parse(
      resolveStudyLayerName(input.goal, input.style),
    ),
    defaultSessionDuration: input.duration ?? 25,
    defaultSessionMode: isStudy
      ? 'STUDY'
      : isCreative
        ? 'CREATIVE'
        : input.style === 'intense'
          ? 'SPRINT'
          : 'FOCUS',
    userStage: 'new',
  };
}