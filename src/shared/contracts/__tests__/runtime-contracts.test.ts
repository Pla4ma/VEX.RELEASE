import { describe, expect, it } from '@jest/globals';

import {
  DomainEventEnvelopeSchema,
  CoreEventNameSchema,
} from '../event-contracts';
import {
  AppErrorCodeSchema,
  VexAppErrorSchema,
  createAppError,
} from '../error-contracts';
import {
  RuntimeAuthStatusSchema,
  RuntimeConnectionStateSchema,
  UserRuntimeSnapshotSchema,
} from '../runtime-snapshot-schemas';

const behaviorStats = {
  abandonedSessionDurations: [],
  bossChallengeEngagement: 'none' as const,
  coachInteractions: 0,
  comebackSessions: 0,
  completedSessionDurations: [],
  completionStreak: 0,
  ignoredFeatures: [],
  mostSuccessfulTimeOfDay: null,
  preferredSessionMode: null,
  premiumFeatureAttempts: [],
  studyUsageRatio: 0,
  totalCompletedSessions: 0,
};

const onboardingProfile = {
  primaryGoal: 'focus' as const,
  motivationStyle: 'calm' as const,
  preferredTone: 'soft' as const,
  gamificationIntensity: 'minimal' as const,
  coachMode: 'mentor' as const,
  studyLayerName: 'Study OS' as const,
  defaultSessionDuration: 25,
  defaultSessionMode: 'FOCUS' as const,
  userStage: 'new' as const,
};

describe('canonical runtime contracts', () => {
  it('accepts a complete user runtime snapshot', () => {
    const snapshot = UserRuntimeSnapshotSchema.parse({
      userId: 'user-1',
      authStatus: 'authenticated',
      onboardingProfile,
      behaviorStats,
      networkState: 'online',
      premiumReady: false,
      sourceFreshness: {
        auth: 100,
        onboarding: 100,
        behavior: 100,
      },
      capturedAt: 100,
      version: 1,
    });

    expect(snapshot.behaviorStats.totalCompletedSessions).toBe(0);
  });

  it('rejects feature availability embedded in the snapshot', () => {
    expect(() =>
      UserRuntimeSnapshotSchema.parse({
        userId: 'user-1',
        authStatus: 'authenticated',
        onboardingProfile,
        behaviorStats,
        networkState: 'online',
        premiumReady: false,
        sourceFreshness: { auth: 100, onboarding: 100, behavior: 100 },
        capturedAt: 100,
        version: 1,
        featureAvailability: { boss: false },
      }),
    ).toThrow();
  });

  it('validates status enums', () => {
    expect(RuntimeAuthStatusSchema.parse('checking')).toBe('checking');
    expect(RuntimeConnectionStateSchema.parse('unknown')).toBe('unknown');
    expect(() => RuntimeConnectionStateSchema.parse('connected')).toThrow();
  });
});

describe('canonical event envelope', () => {
  it('requires identity and idempotency metadata', () => {
    const event = DomainEventEnvelopeSchema.parse({
      eventId: '00000000-0000-4000-8000-000000000001',
      eventName: 'session:completed',
      payload: { durationSeconds: 60 },
      userId: 'user-1',
      sessionId: null,
      idempotencyKey: 'session:user-1:one',
      occurredAt: 100,
      version: 1,
    });

    expect(event.eventName).toBe('session:completed');
    expect(CoreEventNameSchema.parse('onboarding:completed')).toBe(
      'onboarding:completed',
    );
  });

  it('rejects events without an idempotency key', () => {
    expect(() =>
      DomainEventEnvelopeSchema.parse({
        eventId: '00000000-0000-4000-8000-000000000001',
        eventName: 'session:completed',
        payload: {},
        userId: 'user-1',
        sessionId: null,
        occurredAt: 100,
        version: 1,
      }),
    ).toThrow();
  });
});

describe('canonical application errors', () => {
  it('normalizes unknown failures into a typed user-safe error', () => {
    const error = createAppError('network', 'loadHome', new Error('socket failed'));

    expect(VexAppErrorSchema.parse(error)).toEqual(error);
    expect(error.retryable).toBe(true);
    expect(error.userMessage).toBe('VEX could not connect. Try again.');
  });

  it('rejects unknown error codes', () => {
    expect(() => AppErrorCodeSchema.parse('mystery')).toThrow();
  });
});
