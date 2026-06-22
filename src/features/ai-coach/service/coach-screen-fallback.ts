import {
  ACTION_LABELS,
  FALLBACK_HOME_MESSAGES,
} from '../../coach-presence/copy';
import { resolveCoachActionIntent } from '../../coach-presence/service';
import { getAvailabilityFor } from '../../liveops-config';
import type { CoachQuestionResponse } from './coach-screen-service';

export function getFallbackCoachResponse(
  question: string,
): CoachQuestionResponse {
  const lowerQuestion = question.toLowerCase();
  const featureAvailability = {
    focus: getAvailabilityFor('focus_session'),
    progress: getAvailabilityFor('progress_view'),
    study: getAvailabilityFor('content_study'),
  };

  if (lowerQuestion.includes('study')) {
    const intent = resolveCoachActionIntent({
      featureAvailability,
      requestedIntent: 'START_STUDY_SESSION',
    });
    return {
      actionData: { difficulty: 'NORMAL', duration: 25, type: intent },
      actionLabel: ACTION_LABELS[intent],
      hasAction: true,
      message:
        intent === 'START_STUDY_SESSION'
          ? 'Your study thread is ready. Start the next block.'
          : 'Study is not open yet. Start one clean focus block.',
    };
  }

  if (
    lowerQuestion.includes('progress') ||
    lowerQuestion.includes('level') ||
    lowerQuestion.includes('xp')
  ) {
    const intent = resolveCoachActionIntent({
      featureAvailability,
      requestedIntent: 'REVIEW_PROGRESS',
    });
    return {
      actionData: { type: intent },
      actionLabel: ACTION_LABELS[intent],
      hasAction: true,
      message:
        intent === 'REVIEW_PROGRESS'
          ? 'Your progress has the next signal. Review it, then move.'
          : 'Progress view is locked. Start the next focus block.',
    };
  }

  if (
    lowerQuestion.includes('session') ||
    lowerQuestion.includes('focus') ||
    lowerQuestion.includes('start')
  ) {
    const intent = resolveCoachActionIntent({
      featureAvailability,
      requestedIntent: 'START_SESSION',
    });
    return {
      actionData: { difficulty: 'NORMAL', duration: 25, type: intent },
      actionLabel: ACTION_LABELS[intent],
      hasAction: true,
      message: 'Your next focus block is the move. Start simple.',
    };
  }

  return {
    actionData: { difficulty: 'NORMAL', duration: 25, type: 'START_SESSION' },
    actionLabel: ACTION_LABELS.START_SESSION,
    hasAction: true,
    message: FALLBACK_HOME_MESSAGES.CALM,
  };
}
