/**
 * Session Feature — Validation Tests
 */

import {
  validateSessionConfig,
  validateSessionStart,
  validateSessionPause,
  validateSessionCompletion,
} from '../utils/validation';

const validConfig = {
  duration: 1500,
  intervals: 3,
  breakDuration: 300,
  strictMode: false,
  dndEnabled: false,
  autoStartBreaks: false,
  tags: ['work'],
  name: 'Test Session',
};

describe('validateSessionConfig', () => {
  test('passes with valid config', () => {
    const result = validateSessionConfig(validConfig);
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toBeDefined();
  });

  test('fails when duration is too short', () => {
    const result = validateSessionConfig({ ...validConfig, duration: 30 });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('fails when duration exceeds 24 hours', () => {
    const result = validateSessionConfig({ ...validConfig, duration: 90000 });
    expect(result.success).toBe(false);
  });

  test('produces warning for long session without breaks', () => {
    const result = validateSessionConfig({
      ...validConfig,
      duration: 9000,
      breakDuration: 0,
    });
    expect(result.success).toBe(true);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'LONG_SESSION_NO_BREAK' }),
      ]),
    );
  });

  test('produces warning for strict mode without DND', () => {
    const result = validateSessionConfig({
      ...validConfig,
      strictMode: true,
      dndEnabled: false,
    });
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'STRICT_WITHOUT_DND' }),
      ]),
    );
  });
});

describe('validateSessionStart', () => {
  test('fails for unauthenticated user', () => {
    const result = validateSessionStart(validConfig, {
      isAuthenticated: false,
      hasActiveSession: false,
      networkStatus: 'online',
      dailySessionCount: 0,
    });
    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'NOT_AUTHENTICATED' }),
      ]),
    );
  });

  test('fails when user already has active session', () => {
    const result = validateSessionStart(validConfig, {
      isAuthenticated: true,
      hasActiveSession: true,
      networkStatus: 'online',
      dailySessionCount: 0,
    });
    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'ACTIVE_SESSION_EXISTS' }),
      ]),
    );
  });

  test('warns about offline mode', () => {
    const result = validateSessionStart(validConfig, {
      isAuthenticated: true,
      hasActiveSession: false,
      networkStatus: 'offline',
      dailySessionCount: 0,
    });
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'OFFLINE_MODE' }),
      ]),
    );
  });
});

describe('validateSessionPause', () => {
  test('succeeds for ACTIVE session', () => {
    const result = validateSessionPause({
      status: 'ACTIVE',
      elapsedTime: 300,
      pauseCount: 0,
      strictMode: false,
    });
    expect(result.success).toBe(true);
  });

  test('fails for non-ACTIVE session', () => {
    const result = validateSessionPause({
      status: 'PAUSED',
      elapsedTime: 300,
      pauseCount: 0,
      strictMode: false,
    });
    expect(result.success).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'INVALID_STATUS_FOR_PAUSE' }),
      ]),
    );
  });

  test('warns about excessive pauses', () => {
    const result = validateSessionPause({
      status: 'ACTIVE',
      elapsedTime: 600,
      pauseCount: 6,
      strictMode: false,
    });
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'EXCESSIVE_PAUSES' }),
      ]),
    );
  });
});

describe('validateSessionCompletion', () => {
  test('recommends abandon for minimal completion', () => {
    const result = validateSessionCompletion({
      elapsedTime: 30,
      duration: 1500,
      completionPercentage: 2,
      interruptions: 0,
      anticheatFlags: 0,
    });
    expect(result.data?.canComplete).toBe(false);
    expect(result.data?.recommendedAction).toBe('abandon');
  });

  test('recommends review for high interruptions', () => {
    const result = validateSessionCompletion({
      elapsedTime: 1500,
      duration: 1500,
      completionPercentage: 80,
      interruptions: 15,
      anticheatFlags: 0,
    });
    expect(result.data?.recommendedAction).toBe('review');
  });

  test('recommends complete for a clean session', () => {
    const result = validateSessionCompletion({
      elapsedTime: 1500,
      duration: 1500,
      completionPercentage: 100,
      interruptions: 0,
      anticheatFlags: 0,
    });
    expect(result.data?.canComplete).toBe(true);
    expect(result.data?.recommendedAction).toBe('complete');
  });
});
