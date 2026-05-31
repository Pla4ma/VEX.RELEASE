import {
  AdaptationResultSchema,
  type AdaptationRuleInput,
  type AdaptationResult,
} from './session-behavior-signal-schemas';

function coldStart(): AdaptationResult {
  return AdaptationResultSchema.parse({
    shouldShowRescue: false,
    rescueReason: null,
    suggestedDurationMinutes: 25,
    shouldReduceFriction: false,
    shouldQuietEveningNudges: false,
    shouldUseHandoffForNextSession: false,
    handoffLabel: null,
    shouldSuggestShorterSessions: false,
    shorterSessionReason: null,
    shouldSuggestStudyReview: false,
    studyReviewTarget: null,
    shouldReduceGameLanguage: false,
    gameLanguageReason: null,
    modeChangeDetected: false,
    fromMode: null,
    toMode: null,
    userFacingAdaptation: null,
    confidence: 'low',
  });
}

export function resolveAdaptation(input: AdaptationRuleInput): AdaptationResult {
  const result = coldStart();
  const { summary, currentDurationMinutes } = input;
  let confidenceCount = 0;

  if (summary.consecutiveAppOpenedNoSession >= 2) {
    result.shouldReduceFriction = true;
    result.shouldShowRescue = true;
    result.rescueReason = 'opened_app_no_start';
    result.suggestedDurationMinutes = 10;
    result.userFacingAdaptation =
      'You skipped setup twice, so VEX made this one smaller.';
    confidenceCount++;
  }

  if (summary.totalSessionsStarted >= 3 && summary.totalPauses >= 3) {
    result.shouldSuggestShorterSessions = true;
    result.shorterSessionReason =
      'You pause mid-session often. Try a shorter block.';
    result.suggestedDurationMinutes = Math.min(15, currentDurationMinutes);
    if (!result.userFacingAdaptation) {
      result.userFacingAdaptation =
        'You paused halfway last time, so VEX suggests a shorter block.';
    }
    confidenceCount++;
  }

  const recentDurations = summary.recentDurationsSeconds;
  if (recentDurations.length >= 3) {
    const under20Count = recentDurations.filter((d) => d < 20 * 60).length;
    if (under20Count >= recentDurations.length * 0.6) {
      const avgMin = Math.round(
        recentDurations.reduce((a, b) => a + b, 0) /
          recentDurations.length /
          60,
      );
      result.suggestedDurationMinutes = Math.max(10, avgMin);
      if (!result.userFacingAdaptation) {
        result.userFacingAdaptation =
          `Your last sessions worked better around ${avgMin} minutes.`;
      }
      confidenceCount++;
    }
  }

  if (summary.projectHandoffSaved && summary.lastHandoffLabel) {
    result.shouldUseHandoffForNextSession = true;
    result.handoffLabel = summary.lastHandoffLabel;
    if (!result.userFacingAdaptation) {
      result.userFacingAdaptation =
        'You saved a next move, so Project Mode starts there.';
    }
    confidenceCount++;
  }

  if (summary.eveningDismissals >= 2) {
    result.shouldQuietEveningNudges = true;
    if (!result.userFacingAdaptation) {
      result.userFacingAdaptation =
        'You dismissed evening nudges, so VEX will stay quieter then.';
    }
    confidenceCount++;
  }

  if (
    summary.totalSessionsAbandoned >= 2 &&
    summary.totalSessionsStarted >= 3
  ) {
    result.shouldShowRescue = true;
    result.rescueReason = 'make_it_smaller';
    result.shouldReduceFriction = true;
    result.suggestedDurationMinutes = Math.min(
      12,
      result.suggestedDurationMinutes,
    );
    if (!result.userFacingAdaptation) {
      result.userFacingAdaptation =
        'VEX noticed a few unfinished sessions. Try a smaller block.';
    }
    confidenceCount++;
  }

  if (summary.studyTargetsCompleted >= 1 && summary.lastStudyTarget) {
    result.shouldSuggestStudyReview = true;
    result.studyReviewTarget = summary.lastStudyTarget;
    if (!result.userFacingAdaptation) {
      result.userFacingAdaptation =
        `Your last study target was "${summary.lastStudyTarget}". Review it next.`;
    }
    confidenceCount++;
  }

  if (
    summary.modeChanges >= 1 &&
    summary.previousMode === 'SPRINT' &&
    summary.lastMode === 'FOCUS'
  ) {
    result.shouldReduceGameLanguage = true;
    result.gameLanguageReason =
      'You switched from game-like to focus. VEX adjusted the tone.';
    result.modeChangeDetected = true;
    result.fromMode = summary.previousMode;
    result.toMode = summary.lastMode;
    if (!result.userFacingAdaptation) {
      result.userFacingAdaptation =
        'You moved from Run to a quieter mode. VEX reduced game-like language.';
    }
    confidenceCount++;
  }

  if (
    summary.notificationDismissals >= 2 &&
    !result.shouldQuietEveningNudges
  ) {
    result.shouldQuietEveningNudges = true;
    if (!result.userFacingAdaptation) {
      result.userFacingAdaptation =
        'You dismissed a few nudges, so VEX will stay lighter.';
    }
    confidenceCount++;
  }

  if (summary.rescueCompletedCount >= 1) {
    if (!result.shouldShowRescue && summary.totalSessionsAbandoned >= 1) {
      result.shouldShowRescue = true;
      result.rescueReason = 'recovery_pattern';
      result.suggestedDurationMinutes = 8;
    }
    if (!result.userFacingAdaptation) {
      result.userFacingAdaptation =
        'VEX noticed you worked through a rescue block before. Another small one might help.';
    }
    confidenceCount++;
  }

  result.confidence =
    confidenceCount >= 3
      ? 'high'
      : confidenceCount >= 2
        ? 'medium'
        : 'low';

  return result;
}
