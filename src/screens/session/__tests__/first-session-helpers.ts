/**
 * Pure personalization logic extracted for testing.
 * Maps onboarding inputs to session configuration.
 */

const PROFILE_TO_MODE: Record<string, string> = {
  study_focused: 'STUDY',
  student: 'STUDY',
  worker: 'LIGHT_FOCUS',
  calm: 'LIGHT_FOCUS',
  friendly: 'LIGHT_FOCUS',
  coach_led: 'LIGHT_FOCUS',
  game_like: 'LIGHT_FOCUS',
  intense: 'DEEP_WORK',
  competitive: 'DEEP_WORK',
  creator: 'CREATIVE',
};

const PROFILE_TO_DURATION: Record<string, number> = {
  calm: 15,
  game_like: 15,
  intense: 25,
  competitive: 25,
  study_focused: 25,
  student: 25,
  worker: 25,
  friendly: 20,
  coach_led: 20,
  creator: 25,
};

const PROFILE_TO_COACH_LINE: Record<string, string> = {
  calm: 'Start gentle. No pressure. Just show up.',
  game_like: 'Your first boss is watching. Let them see you show up.',
  intense: 'One block. Full intensity. Set the tone.',
  competitive: 'Every session counts. Make this one matter.',
  study_focused: 'Your material is ready. Lock in and absorb.',
  student: 'Start your study rhythm now. Build the habit.',
  worker: 'Your work deserves your full attention.',
  friendly: 'No pressure at all. Just you and the timer.',
  coach_led: 'Your coach believes in this first step.',
  creator: 'Your work needs your presence. Start creating.',
};

function goalToProfileType(g: string | null): string {
  switch (g) {
    case 'STUDY':
      return 'study_focused';
    case 'WORK':
      return 'worker';
    case 'CREATIVE':
      return 'creator';
    case 'PERSONAL':
      return 'calm';
    default:
      return 'friendly';
  }
}

export function computePersonalization(input: {
  goal: string | null;
  focusDuration: number | null;
  element: string | null;
  motivationProfile: { primary: string; secondary: string[] } | null;
}) {
  const { goal, focusDuration, element, motivationProfile } = input;

  const profileType = motivationProfile
    ? motivationProfile.primary
    : goalToProfileType(goal);

  const defaultMode = PROFILE_TO_MODE[profileType] ?? 'LIGHT_FOCUS';
  const baseDuration = PROFILE_TO_DURATION[profileType] ?? 25;
  const suggestedDurationMinutes = focusDuration ?? baseDuration;
  const coachLine =
    PROFILE_TO_COACH_LINE[profileType] ?? 'One session. One step.';
  const showBossTease = profileType === 'game_like';

  const durationLabel = showBossTease
    ? 'Short session to show the boss you are here'
    : profileType === 'calm'
      ? 'A gentle start to build your rhythm'
      : 'Recommended to build momentum';

  return {
    companionElement: element,
    coachLine,
    defaultMode,
    durationLabel,
    showBossTease,
    suggestedDurationMinutes,
  };
}
