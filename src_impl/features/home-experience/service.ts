import {
  HomeExperienceModelSchema,
  type ExplicitMotivationStyle,
  type HomeExperienceModel,
  type HomeExperienceStage,
  type HomeSection,
} from './schemas';
import { resolveVexExperience } from '../personalization';
import type {
  BehaviorStats,
  FeatureAvailabilitySnapshot,
  VexPersonalizationProfile,
} from '../personalization';

interface HomeExperienceInput {
  explicitMotivationStyle: ExplicitMotivationStyle | null;
  totalCompletedSessions: number;
}

const DAY_ZERO_HIDDEN: HomeSection[] = [
  'session_reflection',
  'progress_signal',
  'study_layer',
  'companion_thread',
  'adaptive_challenge',
];

export function getHomeStage(totalCompletedSessions: number): HomeExperienceStage {
  if (totalCompletedSessions <= 0) { return 'STAGE_0'; }
  if (totalCompletedSessions === 1) { return 'STAGE_1'; }
  if (totalCompletedSessions <= 4) { return 'STAGE_2'; }
  if (totalCompletedSessions <= 9) { return 'STAGE_3'; }
  return 'STAGE_4';
}

function copyForStyle(style: ExplicitMotivationStyle | null): {
  coach: string;
  study: string;
  teaser: HomeExperienceModel['teasedElements'][number];
  unlock: string;
} {
  switch (style) {
    case 'study_focused':
      return {
        coach: 'I will keep this structured and help you protect the next study block.',
        study: 'Study OS sits as the work mode when you choose study work.',
        teaser: { system: 'study', copy: 'Study tools appear when you choose study work.' },
        unlock: 'Your system is forming around structured learning.',
      };
    case 'game_like':
      return {
        coach: 'One clean run first. The visual layer can grow after VEX sees your rhythm.',
        study: 'Study OS stays a mode, not the whole dashboard.',
        teaser: { system: 'rpg', copy: 'Visual challenges adapt if you like game-like motivation.' },
        unlock: 'Next, VEX will reflect your progress without crowding the first move.',
      };
    case 'coach_led':
      return {
        coach: 'I will keep it direct: choose the next block, then I will help you adjust.',
        study: 'Study OS appears as a guided mode when the work calls for it.',
        teaser: { system: 'coach', copy: 'Your coach line gets sharper after the first session.' },
        unlock: 'Your system is forming around personal guidance.',
      };
    case 'intense':
      return {
        coach: 'Start the block. Keep the setup short and prove momentum first.',
        study: 'Study OS stays available as a serious work mode.',
        teaser: { system: 'progress', copy: 'Next, VEX will reflect your progress.' },
        unlock: 'Your system is forming around decisive execution.',
      };
    case 'calm':
    default:
      return {
        coach: 'No pressure. Start with one clean block and let the system adapt.',
        study: 'Study OS stays a quiet mode for study work.',
        teaser: { system: 'companion', copy: 'Your system is forming.' },
        unlock: 'Your system is forming at your pace.',
      };
  }
}

function profileForStyle(
  style: ExplicitMotivationStyle | null,
): VexPersonalizationProfile {
  const motivationStyle = style ?? 'calm';
  const studyLayerName = motivationStyle === 'study_focused' ? 'Study OS' as const
    : motivationStyle === 'calm' ? 'Growth Plan' as const
    : 'Deep Work Plan' as const;
  const isStudy = motivationStyle === 'study_focused';
  return {
    primaryGoal: isStudy ? 'study' : 'work',
    motivationStyle,
    preferredTone: motivationStyle === 'intense' ? 'direct' : motivationStyle === 'coach_led' ? 'strategic' : 'soft',
    gamificationIntensity: motivationStyle === 'game_like' || motivationStyle === 'intense' ? 'strong' : 'minimal',
    coachMode: motivationStyle === 'study_focused' ? 'study_tutor' : motivationStyle === 'intense' ? 'tactical' : motivationStyle === 'game_like' ? 'game_guide' : motivationStyle === 'coach_led' ? 'mentor' : 'reflection',
    studyLayerName,
    defaultSessionDuration: 25,
    defaultSessionMode: isStudy ? 'STUDY' : 'FOCUS',
    userStage: 'new',
  };
}

function behaviorForSessions(totalCompletedSessions: number): BehaviorStats {
  return {
    abandonedSessionDurations: [],
    bossChallengeEngagement: 'none',
    coachInteractions: 0,
    comebackSessions: 0,
    completedSessionDurations: [],
    completionStreak: 0,
    ignoredFeatures: [],
    mostSuccessfulTimeOfDay: null,
    preferredSessionMode: null,
    premiumFeatureAttempts: [],
    studyUsageRatio: 0,
    totalCompletedSessions,
  };
}

function resolveSpotlight(
  style: ExplicitMotivationStyle | null,
  stage: HomeExperienceStage,
  totalSessions: number,
): 'none' | 'study' | 'coach' | 'boss_progress' | 'progress_rhythm' | 'companion' {
  if (stage === 'STAGE_0') return 'none';
  if (stage === 'STAGE_1') return 'progress_rhythm';
  switch (style) {
    case 'study_focused': return 'study';
    case 'coach_led': return 'coach';
    case 'game_like': return totalSessions >= 5 ? 'boss_progress' : 'progress_rhythm';
    case 'intense': return totalSessions >= 3 ? 'boss_progress' : 'progress_rhythm';
    case 'calm': return 'progress_rhythm';
    default: return 'companion';
  }
}

export function buildHomeExperienceModel(input: HomeExperienceInput): HomeExperienceModel {
  const stage = getHomeStage(input.totalCompletedSessions);
  const copy = copyForStyle(input.explicitMotivationStyle);
  const featureAvailability: FeatureAvailabilitySnapshot = {
    boss: stage !== 'STAGE_0',
    challenges: stage !== 'STAGE_0',
    premium: stage === 'STAGE_3' || stage === 'STAGE_4',
    study: stage !== 'STAGE_0',
  };
  const resolved = resolveVexExperience(
    profileForStyle(input.explicitMotivationStyle),
    behaviorForSessions(input.totalCompletedSessions),
    featureAvailability,
  );
  const visibleSections: HomeSection[] = stage === 'STAGE_0'
    ? ['motivation_style', 'coach_line', 'primary_session', 'single_evolution_teaser']
    : ['coach_line', 'primary_session', 'session_reflection', 'progress_signal'];

  const spotlight = resolveSpotlight(input.explicitMotivationStyle, stage, input.totalCompletedSessions);

  return HomeExperienceModelSchema.parse({
    aiCoachMessageStyle: resolved.home.coachCopy || copy.coach,
    allowedQueries: stage === 'STAGE_0'
      ? ['session_stats', 'onboarding_state', 'home_priority_minimal']
      : ['session_stats', 'onboarding_state', 'home_priority', 'streak_summary'],
    allowedRoutes: stage === 'STAGE_0'
      ? ['SessionStack.SessionSetup']
      : ['SessionStack.SessionSetup', 'FocusScoreDashboard'],
    companionPlacement: stage === 'STAGE_0'
      ? 'Soft visual presence inside the coach line.'
      : 'Small continuity thread below the primary action.',
    hiddenSections: stage === 'STAGE_0' ? DAY_ZERO_HIDDEN : ['adaptive_challenge'],
    mustNotRun: stage === 'STAGE_0'
      ? ['boss_query', 'challenge_query', 'study_plan_query', 'squad_query', 'locked_route_registration']
      : ['locked_route_registration'],
    primaryCta: stage === 'STAGE_0' ? 'Start First Session' : 'Start Next Session',
    progressPlacement: stage === 'STAGE_0'
      ? 'Hidden until the first completed session creates a real signal.'
      : 'One compact signal below the action.',
    rpgBossPlacement: stage === 'STAGE_0'
      ? 'A tiny visual wrapper only; no boss route or query.'
      : 'Adaptive challenge hint after progress context exists.',
    secondaryCta: stage === 'STAGE_0' ? 'Choose style' : 'Review progress',
    spotlight,
    stage,
    studyOsPlacement: copy.study,
    teasedElements: [copy.teaser],
    unlockPathCopy: copy.unlock,
    visibleSections,
  });
}
