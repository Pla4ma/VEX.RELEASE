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
    expect(getModeCoachConfig(SessionMode.CHALLENGE).cooldownSeconds).toBe(900);
  });

  it('returns coach config for FLOW', () => {
    expect(getModeCoachConfig(SessionMode.FLOW).cooldownSeconds).toBe(600);
  });

  it('returns coach config for LIGHT_FOCUS', () => {
    expect(getModeCoachConfig(SessionMode.LIGHT_FOCUS).cooldownSeconds).toBe(600);
  });

  it('returns coach config for STUDY', () => {
    expect(getModeCoachConfig(SessionMode.STUDY).cooldownSeconds).toBe(600);
  });

  it('returns coach config for CREATIVE', () => {
    expect(getModeCoachConfig(SessionMode.CREATIVE).cooldownSeconds).toBe(1200);
  });

  it('returns coach config for SPRINT', () => {
    expect(getModeCoachConfig(SessionMode.SPRINT).cooldownSeconds).toBe(300);
  });

  it('returns coach config for RECOVERY', () => {
    expect(getModeCoachConfig(SessionMode.RECOVERY).cooldownSeconds).toBe(300);
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
