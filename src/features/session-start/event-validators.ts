import type {
  SessionContextEstablishedEvent,
  SessionGoalsSetEvent,
  SessionInitiatedEvent,
  SessionMoodAssessedEvent,
  SessionPreparationStartedEvent,
  SessionReadinessAssessedEvent,
  SessionStartEventType,
} from './types';

export function validateSessionStartEvent(
  event: SessionStartEventType,
): boolean {
  if (!event.id || !event.userId || !event.sessionId || !event.timestamp) {
    return false;
  }
  if (!event.data || !event.metadata) {return false;}

  switch (event.type) {
    case 'session_initiated':
      return validateSessionInitiatedEvent(event);
    case 'session_preparation_started':
      return validateSessionPreparationStartedEvent(event);
    case 'session_readiness_assessed':
      return validateSessionReadinessAssessedEvent(event);
    case 'session_goals_set':
      return validateSessionGoalsSetEvent(event);
    case 'session_mood_assessed':
      return validateSessionMoodAssessedEvent(event);
    case 'session_context_established':
      return validateSessionContextEstablishedEvent(event);
    default:
      return true;
  }
}

function validateSessionInitiatedEvent(event: SessionInitiatedEvent): boolean {
  return !!(
    event.data.initiationType &&
    event.data.initiatedAt &&
    event.data.trigger &&
    event.data.intent &&
    event.data.context
  );
}

function validateSessionPreparationStartedEvent(
  event: SessionPreparationStartedEvent,
): boolean {
  return !!(
    event.data.preparationType &&
    event.data.preparationSteps &&
    event.data.environment &&
    event.data.user
  );
}

function validateSessionReadinessAssessedEvent(
  event: SessionReadinessAssessedEvent,
): boolean {
  return !!(
    event.data.assessmentType &&
    typeof event.data.readinessScore === 'number' &&
    event.data.readinessLevel &&
    event.data.factors &&
    event.data.trends &&
    event.data.recommendations
  );
}

function validateSessionGoalsSetEvent(event: SessionGoalsSetEvent): boolean {
  return !!(
    event.data.goalType &&
    event.data.goals &&
    event.data.alignment &&
    event.data.planning
  );
}

function validateSessionMoodAssessedEvent(
  event: SessionMoodAssessedEvent,
): boolean {
  return !!(
    event.data.assessmentType &&
    event.data.moodProfile &&
    event.data.moodState &&
    event.data.influences &&
    event.data.recommendations
  );
}

function validateSessionContextEstablishedEvent(
  event: SessionContextEstablishedEvent,
): boolean {
  return !!(
    event.data.contextType &&
    event.data.contextData &&
    event.data.adaptations
  );
}
