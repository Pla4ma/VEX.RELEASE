/**
 * Tests for session-start events.
 */

import {
  createSessionInitiatedEvent,
  createSessionPreparationStartedEvent,
  createSessionReadinessAssessedEvent,
  createSessionGoalsSetEvent,
  createSessionMoodAssessedEvent,
  createSessionContextEstablishedEvent,
  serializeSessionStartEvent,
  deserializeSessionStartEvent,
} from '../events';

describe('session-start: events', () => {
  const userId = 'user-123';
  const sessionId = 'session-456';

  it('createSessionInitiatedEvent returns correct structure', () => {
    const event = createSessionInitiatedEvent(
      userId,
      sessionId,
      'manual',
      'user_tap',
      'focus',
      {},
    );
    expect(event.type).toBe('session_initiated');
    expect(event.userId).toBe(userId);
    expect(event.sessionId).toBe(sessionId);
    expect(event.id).toMatch(/^evt_/);
    expect(event.data.initiationType).toBe('manual');
  });

  it('createSessionPreparationStartedEvent returns correct structure', () => {
    const event = createSessionPreparationStartedEvent(
      userId,
      sessionId,
      'quick',
      [],
      {},
      {},
    );
    expect(event.type).toBe('session_preparation_started');
    expect(event.metadata.source).toBe('session-start');
  });

  it('createSessionReadinessAssessedEvent returns correct structure', () => {
    const event = createSessionReadinessAssessedEvent(
      userId,
      sessionId,
      'auto',
      85,
      'ready',
      {},
      {},
      [],
    );
    expect(event.type).toBe('session_readiness_assessed');
    expect(event.data.readinessScore).toBe(85);
  });

  it('createSessionGoalsSetEvent returns correct structure', () => {
    const event = createSessionGoalsSetEvent(
      userId,
      sessionId,
      'user_defined',
      [],
      {},
      {},
    );
    expect(event.type).toBe('session_goals_set');
  });

  it('createSessionMoodAssessedEvent returns correct structure', () => {
    const event = createSessionMoodAssessedEvent(
      userId,
      sessionId,
      'self_report',
      {},
      {},
      {},
      [],
    );
    expect(event.type).toBe('session_mood_assessed');
  });

  it('createSessionContextEstablishedEvent returns correct structure', () => {
    const event = createSessionContextEstablishedEvent(
      userId,
      sessionId,
      'environment',
      {},
      {},
    );
    expect(event.type).toBe('session_context_established');
  });

  it('serializeSessionStartEvent produces valid JSON with ISO timestamp', () => {
    const event = createSessionInitiatedEvent(
      userId,
      sessionId,
      'manual',
      'user_tap',
      'focus',
      {},
    );
    const serialized = serializeSessionStartEvent(event);
    const parsed = JSON.parse(serialized);
    expect(typeof parsed.timestamp).toBe('string');
    expect(parsed.type).toBe('session_initiated');
  });

  it('deserializeSessionStartEvent restores timestamp as Date', () => {
    const event = createSessionInitiatedEvent(
      userId,
      sessionId,
      'manual',
      'user_tap',
      'focus',
      {},
    );
    const serialized = serializeSessionStartEvent(event);
    const deserialized = deserializeSessionStartEvent(serialized);
    expect(deserialized.timestamp).toBeInstanceOf(Date);
    expect(deserialized.type).toBe('session_initiated');
  });

  it('round-trips serialize → deserialize correctly', () => {
    const event = createSessionGoalsSetEvent(
      userId,
      sessionId,
      'system_suggested',
      [],
      {},
      {},
    );
    const roundTrip = deserializeSessionStartEvent(
      serializeSessionStartEvent(event),
    );
    expect(roundTrip.id).toBe(event.id);
    expect(roundTrip.userId).toBe(userId);
  });
});
