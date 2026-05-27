import { useMemo } from 'react';
import { useOnboardingStore } from '../onboarding/store';
import { useResolvedVexExperienceRuntime } from './hooks';
import { computeFirstWeekExperience } from './useFirstWeekExperience';
import type {
  VexRuntimeInput,
  VexRuntimeExperience,
  CompletionSequenceDetails,
  NotificationPolicyDetails,
  PremiumMomentDetails,
  CoachPresenceDetails,
} from './runtime-experience-types';
import type { VexExperience } from './experience-schemas';

export type { VexRuntimeExperience, VexRuntimeInput } from './runtime-experience-types';

export function computeVexRuntimeExperience(input: VexRuntimeInput): VexRuntimeExperience {
  const firstWeek = computeFirstWeekExperience({
    completedSessions: input.completedSessions,
    daysSinceOnboarding: input.daysSinceOnboarding,
    daysSinceLastSession: input.daysSinceLastSession,
    motivationStyle: input.motivationStyle as 'calm' | 'friendly' | 'coach_led' | 'study_focused' | 'game_like' | 'intense' | undefined,
    primaryGoal: input.primaryGoal,
    bossEngagement: input.bossEngagement,
    studyUsageRatio: input.studyUsageRatio,
    isPremium: input.isPremium,
    featureAvailable: input.featureAvailable,
  });

  const stage = firstWeek.currentDayStage;
  const isDayZero = stage === 'DAY_0_NOT_STARTED';
  const isComeback = firstWeek.comebackState !== 'none';

  const completionSequence: CompletionSequenceDetails = {
    emphasis: isDayZero ? 'simple_win' : firstWeek.completionEmphasis,
    steps: isDayZero
      ? ['coach_companion_reflection', 'next_action']
      : stage === 'DAY_1_RETURN'
        ? ['core_saved', 'coach_companion_reflection', 'streak_progress']
        : stage === 'DAY_3_COMPANION_CONNECTION'
          ? ['core_saved', 'coach_companion_reflection', 'streak_progress', 'study_progress']
          : stage === 'DAY_5_PATH_FORMING'
            ? ['core_saved', 'coach_companion_reflection', 'streak_progress', 'study_progress', 'next_action']
            : stage === 'DAY_7_DEEPER_MODE'
              ? ['core_saved', 'coach_companion_reflection', 'streak_progress', 'study_progress', 'boss_effect', 'next_action']
              : ['core_saved', 'coach_companion_reflection', 'streak_progress', 'study_progress', 'next_action'],
    showProgressProof: !isDayZero,
    showCoachReflection: true,
    showNextAction: true,
    showWeeklyInsight: stage === 'DAY_7_DEEPER_MODE' || stage === 'POST_DAY_7',
  };

  const notificationPolicy: NotificationPolicyDetails = {
    maxPerDay: isDayZero ? 0 : isComeback ? 2 : 2,
    allowedTypes: isDayZero
      ? []
      : firstWeek.notificationAllowedTypes.length > 0
        ? firstWeek.notificationAllowedTypes
        : ['gentle_return', 'coach_check_in', 'progress_milestone'],
    isQuietHours: true,
    quietStartHour: 22,
    quietEndHour: 8,
  };

  const premiumMomentTrigger = firstWeek.premiumMoment;
  const safeTrigger: PremiumMomentDetails['triggerMoment'] =
    (premiumMomentTrigger === 'soft_tease' || premiumMomentTrigger === 'weekly_value')
      ? premiumMomentTrigger
      : 'none';

  const premiumMoment: PremiumMomentDetails = {
    canShow: !isDayZero
      && firstWeek.premiumMoment !== 'none'
      && firstWeek.premiumMoment !== 'hidden'
      && input.completedSessions >= 5,
    triggerMoment: safeTrigger,
    delayDays: isDayZero ? 7 : 0,
    requiresBillingReady: true,
  };

  const coachPresenceTone: CoachPresenceDetails = {
    tone: isComeback ? 'recovering' : isDayZero ? 'steady' : 'ready',
    primaryMessage: isComeback
      ? 'Start with one clean session.'
      : firstWeek.primaryMessage,
    isComeback,
    isDayZero,
    studyLayerLabel: firstWeek.studyLayerLabel,
    bossIntensity: firstWeek.bossIntensity,
  };

  return {
    resolvedExperience: {} as VexExperience,
    firstWeekExperience: firstWeek,
    surfaceMap: null,
    premiumMoment,
    notificationPolicy,
    completionSequence,
    coachPresenceTone,
    studyLayerLabel: firstWeek.studyLayerLabel,
    bossIntensity: firstWeek.bossIntensity,
  };
}

export function useVexRuntimeExperience(input: VexRuntimeInput): VexRuntimeExperience {
  const duration = useOnboardingStore((s) => s.focusDuration);
  const goal = useOnboardingStore((s) => s.goal);
  const style = useOnboardingStore((s) => s.explicitMotivationStyle);

  const normalizedStyle = typeof style === 'string'
    && ['calm', 'friendly', 'coach_led', 'game_like', 'intense', 'study_focused'].includes(style)
    ? (style as 'calm' | 'friendly' | 'coach_led' | 'game_like' | 'intense' | 'study_focused')
    : undefined;

  const resolvedGoal: string | undefined = (() => {
    const g = goal;
    if (g === 'STUDY') return 'study';
    if (g === 'WORK') return 'work';
    if (g === 'CREATIVE') return 'creative';
    if (g === 'PERSONAL') return 'personal';
    return undefined;
  })();

  const effectiveInput: VexRuntimeInput = {
    ...input,
    motivationStyle: input.motivationStyle ?? normalizedStyle,
    primaryGoal: input.primaryGoal ?? resolvedGoal,
  };

  return useMemo(() => computeVexRuntimeExperience(effectiveInput), [
    effectiveInput.completedSessions,
    effectiveInput.daysSinceOnboarding,
    effectiveInput.daysSinceLastSession,
    effectiveInput.motivationStyle,
    effectiveInput.primaryGoal,
    effectiveInput.bossEngagement,
    effectiveInput.studyUsageRatio,
    effectiveInput.coachInteractions,
    effectiveInput.completionStreak,
    effectiveInput.isPremium,
    effectiveInput.featureAvailable.boss,
    effectiveInput.featureAvailable.premium,
    effectiveInput.featureAvailable.social,
    effectiveInput.featureAvailable.study,
    duration,
    goal,
    style,
  ]);
}
