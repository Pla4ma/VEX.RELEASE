/**
 * Session Service — Coach Config Tests
 */

import { SessionMode } from '../../../session/modes';
import { getModeCoachConfig } from '../service';

describe('getModeCoachConfig', () => {
  it('returns coach config for DEEP_WORK mode', () => {
    const config = getModeCoachConfig(SessionMode.DEEP_WORK);
    expect(config.enabled).toBe(true);
    expect(config.cooldownSeconds).toBe(900);
    expect(config.globalCooldownRemaining).toBe(0);
  });

  it('returns coach config for CHALLENGE mode', () => {
    const config = getModeCoachConfig(SessionMode.CHALLENGE);
    expect(config.enabled).toBe(true);
    expect(config.cooldownSeconds).toBe(900);
  });

  it('returns coach config for FLOW mode', () => {
    const config = getModeCoachConfig(SessionMode.FLOW);
    expect(config.enabled).toBe(true);
    expect(config.cooldownSeconds).toBe(600);
  });

  it('returns coach config for LIGHT_FOCUS mode', () => {
    const config = getModeCoachConfig(SessionMode.LIGHT_FOCUS);
    expect(config.enabled).toBe(true);
    expect(config.cooldownSeconds).toBe(600);
  });

  it('returns coach config for STUDY mode', () => {
    const config = getModeCoachConfig(SessionMode.STUDY);
    expect(config.enabled).toBe(true);
    expect(config.cooldownSeconds).toBe(600);
  });

  it('returns coach config for CREATIVE mode', () => {
    const config = getModeCoachConfig(SessionMode.CREATIVE);
    expect(config.enabled).toBe(true);
    expect(config.cooldownSeconds).toBe(1200);
  });

  it('returns coach config for SPRINT mode', () => {
    const config = getModeCoachConfig(SessionMode.SPRINT);
    expect(config.enabled).toBe(true);
    expect(config.cooldownSeconds).toBe(300);
  });

  it('returns coach config for RECOVERY mode', () => {
    const config = getModeCoachConfig(SessionMode.RECOVERY);
    expect(config.enabled).toBe(true);
    expect(config.cooldownSeconds).toBe(300);
  });

  it('returns coach disabled for STARTER mode', () => {
    const config = getModeCoachConfig(SessionMode.STARTER);
    expect(config.enabled).toBe(false);
    expect(config.cooldownSeconds).toBe(0);
  });

  it('falls back to FLOW for unknown mode', () => {
    const config = getModeCoachConfig('unknown_mode' as SessionMode);
    expect(config.enabled).toBe(true);
    expect(config.cooldownSeconds).toBe(600);
  });
});
