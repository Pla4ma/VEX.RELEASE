import {
  getCoachMemoryConfidence,
  getCoachPresenceMessage,
} from './copy-service';
import {
  CoachPresenceMemorySummarySchema,
  CoachPresenceSchema,
  CompletionPresenceSummarySchema,
  type CoachPresence,
  type CoachPresenceMotivationStyle,
} from './schemas';
import type {
  CompletionPresenceInput,
} from './coach-presence-types';
import {
  goalForLane,
  styleForLane,
} from './service-helpers';
import {
  buildCoachPresence,
  resolveCoachActionIntent,
} from './service';

export function buildCompletionCoachPresence(
  input: CompletionPresenceInput,
): CoachPresence {
  const summary = CompletionPresenceSummarySchema.parse(input.summary);
  const memorySummary = CoachPresenceMemorySummarySchema.parse(
    input.memorySummary,
  );
  const motivationStyle = styleForLane(
    input.laneProfile,
    input.motivationStyle,
  );
  const primaryGoal = goalForLane(
    input.laneProfile,
    summary.sessionMode === 'STUDY' ? 'study' : 'focus',
  );
  const memoryConfidence = getCoachMemoryConfidence(
    summary.isFirstSession ? 1 : 3,
    memorySummary.syncAvailable,
  );
  const reflection = getCoachPresenceMessage({
    aiAvailable: memorySummary.syncAvailable,
    bossIntensity: null,
    comebackState: summary.isComeback ? 'missed_1_day' : null,
    completionContext: summary.isFirstSession
      ? 'first_session'
      : summary.isComeback
        ? 'comeback'
        : null,
    firstWeekStage: summary.isFirstSession ? 'after_session_1' : null,
    latestSession: {
      durationMinutes: summary.durationMinutes,
      focusPurityScore: summary.focusPurityScore,
      isComeback: summary.isComeback,
      mode: summary.sessionMode,
    },
    memoryConfidence,
    motivationStyle,
    premiumMoment: 'none',
    primaryGoal,
    sessionMode: 'completed',
    studyLayerLabel: primaryGoal === 'study' ? 'Study' : null,
  });
  const base = buildCoachPresence({
    companion: null,
    featureAvailability: input.featureAvailability,
    laneProfile: input.laneProfile,
    memorySummary,
    motivationStyle,
    progress: {
      currentStreakDays: summary.streakDays,
      highFocusStreak: summary.isHighFocusStreak ? 1 : 0,
      totalSessions: summary.isFirstSession ? 1 : 3,
    },
    surface: 'SESSION_SETUP',
  });
  return CoachPresenceSchema.parse({
    ...base,
    id: 'coach-presence:session-completion',
    message: reflection.message,
    nextAction: {
      intent: resolveCoachActionIntent({
        featureAvailability: input.featureAvailability,
        requestedIntent:
          summary.sessionMode === 'STUDY'
            ? 'START_STUDY_SESSION'
            : 'START_SESSION',
      }),
      label:
        summary.sessionMode === 'STUDY' ? 'Next study block' : 'Next focus',
      reason:
        summary.focusPurityScore >= 90
          ? 'The rhythm is warm.'
          : 'Keep the next move simple.',
    },
    sessionReflection: reflection.message,
  });
}
