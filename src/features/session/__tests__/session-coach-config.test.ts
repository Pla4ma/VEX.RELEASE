import { SessionMode } from '../../../session/modes';
import { getModeCoachConfig } from '../service';

describe('getModeCoachConfig', () => {
  it('returns coach config for DEEP_WORK', () => {
    const c = getModeCoachConfig(SessionMode.DEEP_WORK);
    expect(c.enabled).toBe(true);
    expect(c.cooldownSeconds).toBe(900);
    expect(c.globalCooldownRemaining).toBe(0);
  });

  it('returns coach config for CHALLENGE', () => {
    const c = getModeCoachConfig(SessionMode.CHALLENGE);
    expect(c.enabled).toBe(true);
    expect(c.cooldownSeconds).toBe(900);
  });

  it('returns coach config for FLOW', () => {
    const c = getModeCoachConfig(SessionMode.FLOW);
    expect(c.enabled).toBe(true);
    expect(c.cooldownSeconds).toBe(600);
  });

  it('returns coach config for LIGHT_FOCUS', () => {
    const c = getModeCoachConfig(SessionMode.LIGHT_FOCUS);
    expect(c.enabled).toBe(true);
    expect(c.cooldownSeconds).toBe(600);
  });

  it('returns coach config for STUDY', () => {
    const c = getModeCoachConfig(SessionMode.STUDY);
    expect(c.enabled).toBe(true);
    expect(c.cooldownSeconds).toBe(600);
  });

  it('returns coach config for CREATIVE', () => {
    const c = getModeCoachConfig(SessionMode.CREATIVE);
    expect(c.enabled).toBe(true);
    expect(c.cooldownSeconds).toBe(1200);
  });

  it('returns coach config for SPRINT', () => {
    const c = getModeCoachConfig(SessionMode.SPRINT);
    expect(c.enabled).toBe(true);
    expect(c.cooldownSeconds).toBe(300);
  });

  it('returns coach config for RECOVERY', () => {
    const c = getModeCoachConfig(SessionMode.RECOVERY);
    expect(c.enabled).toBe(true);
    expect(c.cooldownSeconds).toBe(300);
  });

  it('returns coach disabled for STARTER', () => {
    const c = getModeCoachConfig(SessionMode.STARTER);
    expect(c.enabled).toBe(false);
    expect(c.cooldownSeconds).toBe(0);
  });

  it('falls back to FLOW for unknown mode', () => {
    const c = getModeCoachConfig('unknown' as SessionMode);
    expect(c.enabled).toBe(true);
    expect(c.cooldownSeconds).toBe(600);
  });
});
