import {
  HomeExperienceModelSchema,
  type ExplicitMotivationStyle,
  type HomeExperienceModel,
  type HomeExperienceStage,
  type HomeSection,
} from './schemas';
import { resolveVexExperience } from '../personalization';
import type { BehaviorStats, FeatureAvailabilitySnapshot } from '../personalization';

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
  if (totalCompletedSessions <= 0) return 'STAGE_0';
  if (totalCompletedSessions === 1) return 'STAGE_1';
  if (totalCompletedSessions <= 4) return 'STAGE_2';
  if (totalCompletedSessions <= 9) return 'STAGE_3';
  return 'STAGE_4';
}

function makeBehaviorStats(totalCompletedSessions: number): BehaviorStats {
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

function makeFeatureAvailability(stage: HomeExperienceStage): FeatureAvailabilitySnapshot {
  return {
    boss: stage !== 'STAGE_0',
    challenges: stage !== 'STAGE_0',
    premium: stage === 'STAGE_3' || stage === 'STAGE_4',
    study: stage !== 'STAGE_0',
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
  const availability = makeFeatureAvailability(stage);
  const stats = makeBehaviorStats(input.totalCompletedSessions);

  const resolved = resolveVexExperience(
    {
      primaryGoal: input.explicitMotivationStyle === 'study_focused' ? 'study' : 'work',
      motivationStyle: input.explicitMotivationStyle ?? 'calm',
      preferredTone: input.explicitMotivationStyle === 'intense' ? 'direct' : input.explicitMotivationStyle === 'coach_led' ? 'strategic' : 'soft',
      gamificationIntensity: input.explicitMotivationStyle === 'game_like' || input.explicitMotivationStyle === 'intense' ? 'strong' : 'minimal',
      coachMode: input.explicitMotivationStyle === 'study_focused' ? 'study_tutor' : input.explicitMotivationStyle === 'intense' ? 'tactical' : input.explicitMotivationStyle === 'game_like' ? 'game_guide' : input.explicitMotivationStyle === 'coach_led' ? 'mentor' : 'reflection',
      studyLayerName: input.explicitMotivationStyle === 'study_focused' ? 'Study OS' : input.explicitMotivationStyle === 'calm' ? 'Growth Plan' : 'Deep Work Plan',
      defaultSessionDuration: 25,
      defaultSessionMode: input.explicitMotivationStyle === 'study_focused' ? 'STUDY' : 'FOCUS',
      userStage: 'new',
    },
    stats,
    availability,
  );

  const isDayZero = stage === 'STAGE_0';
  const visibleSections: HomeSection[] = isDayZero
    ? ['motivation_style', 'coach_line', 'primary_session', 'single_evolution_teaser']
    : ['coach_line', 'primary_session', 'session_reflection', 'progress_signal'];

  const spotlight = resolveSpotlight(input.explicitMotivationStyle, stage, input.totalCompletedSessions);

  return HomeExperienceModelSchema.parse({
    aiCoachMessageStyle: resolved.home.coachCopy,
    allowedQueries: isDayZero
      ? ['session_stats', 'onboarding_state', 'home_priority_minimal']
      : ['session_stats', 'onboarding_state', 'home_priority', 'streak_summary'],
    allowedRoutes: isDayZero
      ? ['SessionStack.SessionSetup']
      : ['SessionStack.SessionSetup', 'FocusScoreDashboard'],
    companionPlacement: isDayZero
      ? 'Soft visual presence inside the coach line.'
      : 'Small continuity thread below the primary action.',
    hiddenSections: isDayZero ? DAY_ZERO_HIDDEN : ['adaptive_challenge'],
    mustNotRun: isDayZero
      ? ['boss_query', 'challenge_query', 'study_plan_query', 'squad_query', 'locked_route_registration']
      : ['locked_route_registration'],
    primaryCta: isDayZero ? 'Start First Session' : 'Start Next Session',
    progressPlacement: isDayZero
      ? 'Hidden until the first completed session creates a real signal.'
      : 'One compact signal below the action.',
    rpgBossPlacement: isDayZero
      ? 'A tiny visual wrapper only; no boss route or query.'
      : 'Adaptive challenge hint after progress context exists.',
    secondaryCta: isDayZero ? 'Choose style' : 'Review progress',
    spotlight,
    stage,
    studyOsPlacement: resolved.studyLayerLabel ?? 'Deep Work Plan',
    teasedElements: [{ system: stage === 'STAGE_0' ? 'companion' : 'progress', copy: resolved.premium.copy }],
    unlockPathCopy: resolved.premium.copy,
    visibleSections,
  });
}
