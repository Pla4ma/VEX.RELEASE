import type {
  FocusGoal,
  MotivationProfileType,
} from '../../../features/onboarding/schemas';

export interface OnboardingAdaptationPreview {
  coachTone: string;
  durationLabel: string;
  rewardPreview: string;
  sessionTitle: string;
}

type PreviewInput = {
  goal: FocusGoal | undefined;
  motivationStyle: MotivationProfileType | undefined;
};

const GOAL_SESSION: Record<FocusGoal, Pick<OnboardingAdaptationPreview, 'durationLabel' | 'sessionTitle'>> = {
  CREATIVE: {
    durationLabel: '15 min',
    sessionTitle: 'Creative Sprint',
  },
  PERSONAL: {
    durationLabel: '10 min',
    sessionTitle: 'Personal Reset',
  },
  STUDY: {
    durationLabel: '15 min',
    sessionTitle: 'Study Lock-in',
  },
  WORK: {
    durationLabel: '15 min',
    sessionTitle: 'Work Focus Block',
  },
};

const STYLE_PREVIEW: Partial<
  Record<
    MotivationProfileType,
    Pick<OnboardingAdaptationPreview, 'coachTone' | 'rewardPreview'>
  >
> = {
  calm: {
    coachTone: 'Quiet guidance with fewer interruptions.',
    rewardPreview: 'Steady streak credit and a simple next action.',
  },
  friendly: {
    coachTone: 'Warm nudges and companion continuity.',
    rewardPreview: 'A first-win badge plus tomorrow encouragement.',
  },
  game_like: {
    coachTone: 'Clearer goals, visible progress, and more energetic prompts.',
    rewardPreview: 'Streak credit and a visible next milestone.',
  },
  intense: {
    coachTone: 'Direct coaching with sharper challenge timing.',
    rewardPreview: 'Higher-pressure grading and a stronger next push.',
  },
  student: {
    coachTone: 'Study timing and review prompts move forward.',
    rewardPreview: 'Study streak credit and a review-ready next step.',
  },
};

const DEFAULT_STYLE: Pick<
  OnboardingAdaptationPreview,
  'coachTone' | 'rewardPreview'
> = {
  coachTone: 'Warm nudges and companion continuity.',
  rewardPreview: 'A first-win badge plus tomorrow encouragement.',
};

export function buildOnboardingAdaptationPreview({
  goal,
  motivationStyle,
}: PreviewInput): OnboardingAdaptationPreview {
  const session = GOAL_SESSION[goal ?? 'WORK'];
  const style = STYLE_PREVIEW[motivationStyle ?? 'friendly'] ?? DEFAULT_STYLE;

  return {
    coachTone: style.coachTone,
    durationLabel: session.durationLabel,
    rewardPreview: style.rewardPreview,
    sessionTitle: session.sessionTitle,
  };
}
