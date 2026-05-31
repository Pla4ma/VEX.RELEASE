import type {
  ExplicitMotivationStyle,
  HomeExperienceStage,
} from './schemas';
import type { VexExperience } from '../personalization';
import type { FirstWeekExperience } from '../personalization/first-week-schemas';

export function resolveSpotlight(
  style: ExplicitMotivationStyle | null,
  stage: HomeExperienceStage,
  totalSessions: number,
):
  | 'none'
  | 'study'
  | 'coach'
  | 'boss_progress'
  | 'progress_rhythm'
  | 'companion' {
  if (stage === 'STAGE_0') {return 'none';}
  if (stage === 'STAGE_1') {return 'progress_rhythm';}
  switch (style) {
    case 'study_focused':
      return 'study';
    case 'coach_led':
      return 'coach';
    case 'game_like':
      return totalSessions >= 5 ? 'boss_progress' : 'progress_rhythm';
    case 'intense':
      return totalSessions >= 3 ? 'boss_progress' : 'progress_rhythm';
    case 'calm':
      return 'progress_rhythm';
    default:
      return 'companion';
  }
}

export function getCoachCopy(
  resolved: VexExperience | undefined,
  fw: FirstWeekExperience | undefined,
): string {
  if (fw?.comebackState !== 'none') {
    return (
      fw?.primaryMessage ?? 'You are not behind. Start with one clean session.'
    );
  }
  return (
    resolved?.home.coachCopy ??
    'Start with one clean block and let VEX adjust around you.'
  );
}

export function getPremiumCopy(
  resolved: VexExperience | undefined,
  fw: FirstWeekExperience | undefined,
): string {
  if (fw && (fw.premiumMoment === 'none' || fw.premiumMoment === 'hidden')) {
    return 'Premium appears after VEX has shown real personal value.';
  }
  return (
    resolved?.premium.copy ??
    'Premium appears after VEX has shown real personal value.'
  );
}

export function getStudyLabel(
  _resolved: VexExperience | undefined,
  fw: FirstWeekExperience | undefined,
  style: ExplicitMotivationStyle | null,
): string {
  if (fw?.studyLayerLabel) {return fw.studyLayerLabel;}
  if (style === 'study_focused') {return 'Study OS';}
  return 'Deep Work Plan';
}

export function getBossPlacement(
  _resolved: VexExperience | undefined,
  fw: FirstWeekExperience | undefined,
  isDayZero: boolean,
): string {
  if (isDayZero && fw?.bossIntensity !== 'hidden') {
    return 'A tiny visual wrapper only; no boss route or query.';
  }
  if (fw?.bossIntensity === 'hidden') {
    return 'Boss surface blocked during first-week phase.';
  }
  return 'Adaptive challenge hint after progress context exists.';
}
