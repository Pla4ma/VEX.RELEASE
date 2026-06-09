/**
 * Session Feature — Persistence Resume & Enum Schema Tests
 */

import { isSessionStale, canResumeSession } from '../utils/persistence-resume';

import {
  SessionStatusSchema,
  SessionPhaseSchema,
  ConflictStatusSchema,
  AntiCheatStatusSchema,
} from '../types/enums';

describe('persistence-resume', () => {
  test('isSessionStale returns true for old session', () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    expect(isSessionStale(twoDaysAgo)).toBe(true);
  });

  test('isSessionStale returns false for recent session', () => {
    expect(isSessionStale(Date.now())).toBe(false);
  });

  test('canResumeSession rejects sessions older than 24 hours', () => {
    const oldState = { lastUpdatedAt: Date.now() - 25 * 60 * 60 * 1000, status: 'ACTIVE', interruptions: 0, backgroundTime: 0 } as Parameters<typeof canResumeSession>[0];
    const result = canResumeSession(oldState);
    expect(result.canResume).toBe(false);
    expect(result.risk).toBe('HIGH');
  });

  test('canResumeSession rejects non-resumable statuses', () => {
    const state = { lastUpdatedAt: Date.now(), status: 'COMPLETED', interruptions: 0, backgroundTime: 0 } as Parameters<typeof canResumeSession>[0];
    const result = canResumeSession(state);
    expect(result.canResume).toBe(false);
    expect(result.risk).toBe('NONE');
  });

  test('canResumeSession allows resumption for ACTIVE session with no issues', () => {
    const state = { lastUpdatedAt: Date.now(), status: 'ACTIVE', interruptions: 0, backgroundTime: 0 } as Parameters<typeof canResumeSession>[0];
    const result = canResumeSession(state);
    expect(result.canResume).toBe(true);
    expect(result.risk).toBe('NONE');
  });

  test('canResumeSession flags MEDIUM risk for high interruptions', () => {
    const state = { lastUpdatedAt: Date.now(), status: 'ACTIVE', interruptions: 15, backgroundTime: 0 } as Parameters<typeof canResumeSession>[0];
    const result = canResumeSession(state);
    expect(result.canResume).toBe(true);
    expect(result.risk).toBe('MEDIUM');
  });
});

describe('session enum schemas', () => {
  test('SessionStatusSchema accepts all valid statuses', () => {
    const statuses = [
      'PREPARING', 'STARTING', 'ACTIVE', 'PAUSED', 'BACKGROUNDED',
      'COMPLETING', 'COMPLETED', 'PARTIAL', 'ABANDONED', 'FAILED',
    ];
    for (const status of statuses) {
      expect(() => SessionStatusSchema.parse(status)).not.toThrow();
    }
  });

  test('SessionStatusSchema rejects invalid status', () => {
    expect(() => SessionStatusSchema.parse('INVALID')).toThrow();
  });

  test('SessionPhaseSchema accepts valid phases', () => {
    for (const phase of ['FOCUS', 'SHORT_BREAK', 'LONG_BREAK', 'PREPARATION', 'REVIEW']) {
      expect(() => SessionPhaseSchema.parse(phase)).not.toThrow();
    }
  });

  test('ConflictStatusSchema accepts valid statuses', () => {
    expect(() => ConflictStatusSchema.parse('NONE')).not.toThrow();
    expect(() => ConflictStatusSchema.parse('RESOLVED_LOCAL')).not.toThrow();
  });

  test('AntiCheatStatusSchema accepts valid statuses', () => {
    expect(() => AntiCheatStatusSchema.parse('CLEAN')).not.toThrow();
    expect(() => AntiCheatStatusSchema.parse('FLAGGED')).not.toThrow();
  });
});
