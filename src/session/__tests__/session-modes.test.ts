/**
 * Session Feature — Session Modes Tests
 */

import {
  SessionMode,
  SessionModeSchema,
  SESSION_MODE_CONFIG,
  resolveSessionMode,
  getSessionModeConfig,
  getRecoveryChainMultiplier,
  getSprintChainMultiplier,
} from '../modes';

describe('session modes', () => {
  test('SessionMode enum has all expected values', () => {
    expect(SessionMode.DEEP_WORK).toBe('DEEP_WORK');
    expect(SessionMode.CHALLENGE).toBe('CHALLENGE');
    expect(SessionMode.LIGHT_FOCUS).toBe('LIGHT_FOCUS');
    expect(SessionMode.FLOW).toBe('FLOW');
    expect(SessionMode.STUDY).toBe('STUDY');
    expect(SessionMode.CREATIVE).toBe('CREATIVE');
    expect(SessionMode.SPRINT).toBe('SPRINT');
    expect(SessionMode.RECOVERY).toBe('RECOVERY');
    expect(SessionMode.STARTER).toBe('STARTER');
  });

  test('resolveSessionMode returns valid modes and falls back to FLOW for invalid input', () => {
    expect(resolveSessionMode('DEEP_WORK')).toBe(SessionMode.DEEP_WORK);
    expect(resolveSessionMode('STUDY')).toBe(SessionMode.STUDY);
    expect(resolveSessionMode('INVALID_MODE')).toBe(SessionMode.FLOW);
    expect(resolveSessionMode(null)).toBe(SessionMode.FLOW);
    expect(resolveSessionMode(undefined)).toBe(SessionMode.FLOW);
  });

  test('getSessionModeConfig returns correct config for each mode', () => {
    const config = getSessionModeConfig('DEEP_WORK');
    expect(config.companionBehavior).toBe('intense');
    expect(config.blockerIntensityMultiplier).toBe(1.5);
    expect(config.purityPassThreshold).toBe(85);
    expect(config.xpMultiplier).toBe(1.2);
  });

  test('getSessionModeConfig falls back for invalid mode', () => {
    const config = getSessionModeConfig('INVALID');
    expect(config.companionBehavior).toBe('gentle'); // FLOW defaults
    expect(config.xpMultiplier).toBe(1);
  });

  test('every session mode has scoring weights summing close to 1', () => {
    for (const mode of Object.values(SessionMode)) {
      const config = SESSION_MODE_CONFIG[mode];
      const sum =
        config.scoringWeights.consistency +
        config.scoringWeights.depth +
        config.scoringWeights.recovery;
      expect(sum).toBeCloseTo(1.0, 5);
    }
  });

  test('getRecoveryChainMultiplier clamps chain count between 1 and 4', () => {
    expect(getRecoveryChainMultiplier(0)).toBe(1); // clamped to 1
    expect(getRecoveryChainMultiplier(1)).toBe(1);
    expect(getRecoveryChainMultiplier(2)).toBeCloseTo(1.05);
    expect(getRecoveryChainMultiplier(4)).toBeCloseTo(1.15);
    expect(getRecoveryChainMultiplier(10)).toBeCloseTo(1.15); // clamped to 4
  });

  test('getSprintChainMultiplier delegates to getRecoveryChainMultiplier', () => {
    expect(getSprintChainMultiplier(3)).toBe(getRecoveryChainMultiplier(3));
  });

  test('STARTER mode has lowest blocker intensity and lowest purity threshold', () => {
    const starter = SESSION_MODE_CONFIG[SessionMode.STARTER];
    for (const mode of Object.values(SessionMode)) {
      const config = SESSION_MODE_CONFIG[mode];
      expect(starter.blockerIntensityMultiplier).toBeLessThanOrEqual(
        config.blockerIntensityMultiplier,
      );
      expect(starter.purityPassThreshold).toBeLessThanOrEqual(
        config.purityPassThreshold,
      );
    }
  });
});
