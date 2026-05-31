import { describe, expect, it } from '@jest/globals';
import {
  PromiseTargetModeSchema,
  CompanionPromiseStatusSchema,
  CompanionPromiseSchema,
  CompanionPromiseHomeStateSchema,
  CompanionPromiseLifecycleResultSchema,
  CreateCompanionPromiseInputSchema,
  CompletedSessionPromiseInputSchema,
} from '../schemas';

const basePromise = {
  createdAt: '2026-05-20T10:00:00.000Z',
  fulfilledAt: null,
  id: '550e8400-e29b-41d4-a716-446655440001',
  missedAt: null,
  sourceSessionId: '550e8400-e29b-41d4-a716-446655440002',
  status: 'pending' as const,
  targetDate: '2026-05-21',
  targetDurationMinutes: 25,
  targetMode: 'FOCUS' as const,
  userId: 'user-123',
};

// ── schemas ────────────────────────────────────────────────────────────
describe('companion-promise schemas', () => {
  it('PromiseTargetModeSchema accepts valid modes', () => {
    for (const mode of ['FOCUS', 'RECOVERY', 'STUDY', 'BOSS_PREP', 'HABIT_BUILD']) {
      expect(PromiseTargetModeSchema.safeParse(mode).success).toBe(true);
    }
    expect(PromiseTargetModeSchema.safeParse('INVALID').success).toBe(false);
  });

  it('CompanionPromiseStatusSchema accepts valid statuses', () => {
    for (const status of ['pending', 'fulfilled', 'missed', 'replaced']) {
      expect(CompanionPromiseStatusSchema.safeParse(status).success).toBe(true);
    }
    expect(CompanionPromiseStatusSchema.safeParse('invalid').success).toBe(false);
  });

  it('CompanionPromiseSchema validates correct shape', () => {
    expect(CompanionPromiseSchema.safeParse(basePromise).success).toBe(true);
  });

  it('CompanionPromiseSchema rejects invalid UUID', () => {
    expect(CompanionPromiseSchema.safeParse({ ...basePromise, id: 'not-a-uuid' }).success).toBe(false);
  });

  it('CompanionPromiseHomeStateSchema validates all kinds', () => {
    expect(
      CompanionPromiseHomeStateSchema.safeParse({ kind: 'hidden', showOfflineBanner: false }).success,
    ).toBe(true);
    expect(
      CompanionPromiseHomeStateSchema.safeParse({ kind: 'offline', showOfflineBanner: true }).success,
    ).toBe(true);
    expect(
      CompanionPromiseHomeStateSchema.safeParse({ kind: 'pending', promise: basePromise, showOfflineBanner: false }).success,
    ).toBe(true);
    expect(
      CompanionPromiseHomeStateSchema.safeParse({ kind: 'fulfilled', promise: basePromise, showOfflineBanner: false }).success,
    ).toBe(true);
    expect(
      CompanionPromiseHomeStateSchema.safeParse({ kind: 'missed', promise: basePromise, showOfflineBanner: false }).success,
    ).toBe(true);
  });

  it('CompanionPromiseLifecycleResultSchema validates correct shape', () => {
    const result = CompanionPromiseLifecycleResultSchema.safeParse({
      createdPromise: null,
      fulfilledPromise: null,
      missedPromise: null,
    });
    expect(result.success).toBe(true);
  });

  it('CreateCompanionPromiseInputSchema validates correct shape', () => {
    const result = CreateCompanionPromiseInputSchema.safeParse({
      createdAt: '2026-05-20T10:00:00.000Z',
      sourceSessionId: '550e8400-e29b-41d4-a716-446655440002',
      targetDate: '2026-05-21',
      targetDurationMinutes: 25,
      targetMode: 'FOCUS',
      userId: 'user-123',
    });
    expect(result.success).toBe(true);
  });

  it('CreateCompanionPromiseInputSchema rejects duration < 5', () => {
    const result = CreateCompanionPromiseInputSchema.safeParse({
      createdAt: '2026-05-20T10:00:00.000Z',
      sourceSessionId: '550e8400-e29b-41d4-a716-446655440002',
      targetDate: '2026-05-21',
      targetDurationMinutes: 3,
      targetMode: 'FOCUS',
      userId: 'user-123',
    });
    expect(result.success).toBe(false);
  });

  it('CompletedSessionPromiseInputSchema validates correct shape', () => {
    const result = CompletedSessionPromiseInputSchema.safeParse({
      completedAt: Date.now(),
      durationMinutes: 25,
      sessionId: '550e8400-e29b-41d4-a716-446655440002',
      sessionMode: 'FLOW',
      userId: 'user-123',
    });
    expect(result.success).toBe(true);
  });
});
