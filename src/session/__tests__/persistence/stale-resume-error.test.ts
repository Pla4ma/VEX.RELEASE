import { isSessionStale, canResumeSession, baseState, SessionPersistenceError } from './helpers';
import type { PersistedSessionState } from './helpers';

describe('isSessionStale', () => {
  it('should return false for recent session', () => {
    const recent = Date.now() - 1000;
    expect(isSessionStale(recent)).toBe(false);
  });

  it('should return true for old session', () => {
    const old = Date.now() - 25 * 60 * 60 * 1000;
    expect(isSessionStale(old)).toBe(true);
  });

  it('should respect custom max age', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    expect(isSessionStale(fiveMinutesAgo, 2 * 60 * 1000)).toBe(true);
    expect(isSessionStale(fiveMinutesAgo, 10 * 60 * 1000)).toBe(false);
  });
});

describe('canResumeSession', () => {
  it('should allow resume for fresh active session', () => {
    const result = canResumeSession(baseState);
    expect(result.canResume).toBe(true);
    expect(result.risk).toBe('NONE');
  });

  it('should deny resume for completed session', () => {
    const completed = { ...baseState, status: 'COMPLETED' as const };
    const result = canResumeSession(completed as PersistedSessionState);
    expect(result.canResume).toBe(false);
  });

  it('should deny resume for old session', () => {
    const old = {
      ...baseState,
      lastUpdatedAt: Date.now() - 25 * 60 * 60 * 1000,
    };
    const result = canResumeSession(old);
    expect(result.canResume).toBe(false);
    expect(result.risk).toBe('HIGH');
  });

  it('should warn for session with many interruptions', () => {
    const interrupted = { ...baseState, interruptions: 15 };
    const result = canResumeSession(interrupted);
    expect(result.canResume).toBe(true);
    expect(result.risk).toBe('MEDIUM');
  });

  it('should warn for long background time', () => {
    const backgrounded = { ...baseState, backgroundTime: 35 * 60 * 1000 };
    const result = canResumeSession(backgrounded);
    expect(result.canResume).toBe(true);
    expect(result.risk).toBe('MEDIUM');
  });
});

describe('SessionPersistenceError', () => {
  it('should create error with message', () => {
    const error = new SessionPersistenceError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('SessionPersistenceError');
  });

  it('should include details', () => {
    const cause = new Error('Original error');
    const error = new SessionPersistenceError('Test error', {
      cause,
      sessionId: '123',
    });
    expect(error.details).toEqual({ cause, sessionId: '123' });
  });
});
